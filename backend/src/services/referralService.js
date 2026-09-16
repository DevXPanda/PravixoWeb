import mongoose from "mongoose";
import Referral from "../models/Referral.js";
import ReferralReward from "../models/ReferralReward.js";
import ReferralSetting from "../models/ReferralSetting.js";
import ReferralRelationship from "../models/ReferralRelationship.js";
import Wallet from "../models/Wallet.js";
import WalletTransaction from "../models/WalletTransaction.js";
import Profile from "../models/Profile.js";
import Notification from "../models/Notification.js";
import { creditCreatorWallet } from "../controllers/walletController.js";
import { sendPushToUser } from "../utils/webPush.js";
import { appEvents } from "../utils/eventEmitter.js";

/**
 * Retrieve active referral campaign settings or initialize default settings if none exists.
 */
export const getActiveReferralSettings = async () => {
  let settings = await ReferralSetting.findOne();
  if (!settings) {
    settings = await ReferralSetting.create({
      isEnabled: true,
      rewardAmount: 500,
      currency: "INR",
      qualificationTrigger: "profile_verified",
      maxReferralsPerUser: 0,
      terms: [
        "Invite other creators to Previxo using your unique referral link.",
        "When the referred creator registers and completes profile verification, your reward is credited.",
        "Rewards are credited directly to your Previxo Creator Wallet.",
        "Self-referrals and duplicate accounts are strictly prohibited and will be disqualified.",
      ],
    });
  }
  return settings;
};

/**
 * Creates a referral record between referrer and referred creator.
 * Performs anti-abuse checks: self-referral, already referred, campaign enabled.
 */
export const recordReferralOnSignup = async ({
  referralCode,
  newCreatorProfile,
}) => {
  if (!referralCode || !newCreatorProfile) {
    return { success: false, reason: "Missing parameters" };
  }

  const normalizedCode = referralCode.trim().toUpperCase();

  // Find referring profile
  const referrer = await Profile.findOne({ referralCode: normalizedCode });
  if (!referrer) {
    return { success: false, reason: "Invalid referral code" };
  }

  // Prevent self-referral
  if (referrer._id.toString() === newCreatorProfile._id.toString() || referrer.email === newCreatorProfile.email) {
    return { success: false, reason: "Self-referral is not allowed" };
  }

  // Check campaign settings
  const settings = await getActiveReferralSettings();
  if (!settings.isEnabled) {
    return { success: false, reason: "Referral campaign is currently paused" };
  }

  if (settings.campaignExpiryDate && new Date(settings.campaignExpiryDate) < new Date()) {
    return { success: false, reason: "Referral campaign has expired" };
  }

  // Check max referrals per user limit
  if (settings.maxReferralsPerUser > 0 && referrer.referralCount >= settings.maxReferralsPerUser) {
    return { success: false, reason: "Referrer has reached the maximum referral limit" };
  }

  // Prevent duplicate referral (Creator already referred)
  const existingReferral = await Referral.findOne({
    referredCreatorId: newCreatorProfile._id,
  });
  if (existingReferral) {
    return { success: false, reason: "Creator has already been referred" };
  }

  // Create Referral record
  const referral = await Referral.create({
    referrerCreatorId: referrer._id,
    referredCreatorId: newCreatorProfile._id,
    referralCode: normalizedCode,
    status: "registered",
    qualificationCondition: settings.qualificationTrigger,
  });

  // Update referred creator profile
  await Profile.findByIdAndUpdate(newCreatorProfile._id, {
    referredBy: referrer._id,
  });

  // Increment referrer count
  await Profile.findByIdAndUpdate(referrer._id, {
    $inc: { referralCount: 1 },
  });

  // Notify referrer of registration
  try {
    const notifText = `${newCreatorProfile.fullName || "A creator"} registered using your referral code! Reward will be credited upon qualification.`;
    await Notification.create({
      recipientId: referrer._id,
      senderId: newCreatorProfile._id,
      type: "referral_registered",
      text: notifText,
      targetUrl: "/dashboard",
      metadata: {
        referralId: referral._id,
        referredCreatorId: newCreatorProfile._id,
        referredCreatorName: newCreatorProfile.fullName,
      },
    });

    sendPushToUser(referrer._id, {
      title: "New Referral Registered!",
      body: notifText,
      url: "/dashboard",
    }).catch(() => {});
  } catch (err) {
    console.error("[ReferralService] Notification error on registration:", err);
  }

  // If trigger condition is "on_register", qualify and reward immediately
  if (settings.qualificationTrigger === "on_register") {
    await processReferralQualification({
      referredCreatorId: newCreatorProfile._id,
      triggerType: "on_register",
    });
  }

  return { success: true, referral };
};

/**
 * Qualify a referral and disburse reward to the referring creator.
 * Idempotent: Can safely be invoked multiple times; will never double-credit.
 */
export const processReferralQualification = async ({
  referredCreatorId,
  triggerType = "profile_verified",
  adminOverride = false,
  notes = "",
}) => {
  if (!referredCreatorId) return { success: false, message: "Missing referredCreatorId" };

  const settings = await getActiveReferralSettings();

  // If not admin override, verify campaign is enabled
  if (!adminOverride && !settings.isEnabled) {
    return { success: false, message: "Referral campaign is disabled." };
  }

  // Find the referral record for this referred creator
  const referral = await Referral.findOne({ referredCreatorId });
  if (!referral) {
    return { success: false, message: "No referral record found for this creator." };
  }

  // If already rewarded or qualified, check idempotency
  if (referral.status === "reward_credited") {
    return {
      success: true,
      message: "Referral has already qualified and reward has been credited.",
      alreadyCredited: true,
      referral,
    };
  }

  if (referral.status === "rejected") {
    return { success: false, message: "Referral was rejected: " + referral.rejectionReason };
  }

  // Check matching trigger condition unless admin override
  if (!adminOverride && settings.qualificationTrigger !== "on_register" && settings.qualificationTrigger !== triggerType) {
    return {
      success: false,
      message: `Trigger type (${triggerType}) does not match configured campaign trigger (${settings.qualificationTrigger}).`,
    };
  }

  // Check if reward amount is greater than 0
  const rewardAmount = settings.rewardAmount || 0;

  // Mark as qualified
  referral.status = "qualified";
  referral.qualifiedAt = new Date();
  await referral.save();

  // If reward amount is 0, nothing further to credit
  if (rewardAmount <= 0) {
    referral.status = "reward_credited";
    referral.rewardCreditedAt = new Date();
    await referral.save();
    return { success: true, referral, rewardAmount: 0 };
  }

  // IDEMPOTENCY: Check if ReferralReward already exists
  let rewardRecord = await ReferralReward.findOne({ referralId: referral._id });
  if (rewardRecord && rewardRecord.status === "credited") {
    referral.status = "reward_credited";
    referral.rewardCreditedAt = rewardRecord.creditedAt || new Date();
    await referral.save();
    return {
      success: true,
      message: "Reward already credited.",
      reward: rewardRecord,
      referral,
    };
  }

  // Credit creator wallet
  const referredProfile = await Profile.findById(referredCreatorId).select("fullName handle");
  const referredName = referredProfile?.fullName || referredProfile?.handle || "Creator";
  const refTransactionId = `REF-REW-${referral._id}`;

  try {
    const { transaction } = await creditCreatorWallet({
      creatorId: referral.referrerCreatorId,
      amount: rewardAmount,
      referenceId: refTransactionId,
      description: `Referral Reward for inviting ${referredName}`,
    });

    // Create or update ReferralReward record
    if (!rewardRecord) {
      rewardRecord = await ReferralReward.create({
        referralId: referral._id,
        referrerCreatorId: referral.referrerCreatorId,
        referredCreatorId: referral.referredCreatorId,
        rewardAmount,
        currency: settings.currency || "INR",
        status: "credited",
        walletTransactionId: transaction?._id || null,
        creditedAt: new Date(),
      });
    } else {
      rewardRecord.status = "credited";
      rewardRecord.walletTransactionId = transaction?._id || null;
      rewardRecord.creditedAt = new Date();
      await rewardRecord.save();
    }

    referral.status = "reward_credited";
    referral.rewardCreditedAt = new Date();
    await referral.save();

    // Send reward credited notification
    const rewardText = `Congratulations! You received ₹${rewardAmount} in your Creator Wallet for referring ${referredName}!`;
    await Notification.create({
      recipientId: referral.referrerCreatorId,
      senderId: referral.referredCreatorId,
      type: "referral_reward_credited",
      text: rewardText,
      targetUrl: "/dashboard",
      metadata: {
        referralId: referral._id,
        rewardId: rewardRecord._id,
        rewardAmount,
      },
    });

    sendPushToUser(referral.referrerCreatorId, {
      title: "Referral Reward Credited! 🎁",
      body: rewardText,
      url: "/dashboard",
    }).catch(() => {});

    return {
      success: true,
      message: `Reward of ₹${rewardAmount} successfully credited!`,
      referral,
      reward: rewardRecord,
    };
  } catch (error) {
    console.error("[ReferralService] Error crediting referral reward:", error);
    referral.status = "reward_pending";
    await referral.save();
    return {
      success: false,
      message: "Failed to credit wallet: " + error.message,
    };
  }
};

/**
 * Hook into the project-payout pipeline for creators.
 * Flow:
 * 1. Look up creator.referred_by_user_id (or referredBy).
 * 2. If null, or the matching referral_relationships.status is not "active"
 *    -> skip referral commission, process normal payout (transaction_type = "project_payout").
 * 3. If active:
 *    - commission_amount = gross_payout_amount * (commission_percent / 100).
 *    - creator_net_amount = gross_payout_amount - platform_fee - commission_amount.
 *    - Credit creator with creator_net_amount (transaction_type = "project_payout").
 *    - Credit referrer with commission_amount (transaction_type = "referral_commission",
 *      related_transaction_id = creatorTx._id, related_referral_id = referralRelationship._id).
 *    - Both share common reference prefix for reconciliation.
 * 4. Emit internal event "payout.processed" with full breakdown.
 */
export const processProjectPayoutWithReferral = async ({
  creatorId,
  collaborationId,
  campaignId = null,
  payoutId = null,
  gross_payout_amount,
  platform_fee = 0,
  transactionReference,
  description = "Project payout",
}) => {
  const commonRef = transactionReference || `PAYOUT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // 1. Look up creator
  const creator = await Profile.findById(creatorId);
  if (!creator) {
    throw new Error(`Creator ${creatorId} not found`);
  }

  const referrerUserId = creator.referred_by_user_id || creator.referredBy;

  let referralRelationship = null;
  if (referrerUserId) {
    // 2. Look up matching referral_relationships
    referralRelationship = await ReferralRelationship.findOne({
      referred_id: creator._id,
      status: "active",
    });
  }

  // 2. If null or not active -> process normal payout
  if (!referrerUserId || !referralRelationship || referralRelationship.status !== "active") {
    // creator net = gross_payout_amount - platform_fee
    const creator_net_amount = Math.max(0, gross_payout_amount - platform_fee);

    const creatorResult = await creditCreatorWallet({
      creatorId,
      amount: creator_net_amount,
      collaborationId,
      campaignId,
      payoutId,
      referenceId: commonRef,
      description,
      transaction_type: "project_payout",
    });

    const breakdown = {
      creator_id: creatorId,
      project_id: campaignId || collaborationId || payoutId,
      payout_id: payoutId,
      collaboration_id: collaborationId,
      campaign_id: campaignId,
      common_reference: commonRef,
      gross_payout_amount,
      platform_fee,
      commission_percent: 0,
      commission_amount: 0,
      referrer_name: null,
      creator_net_amount,
      has_active_referral: false,
      referrer_id: null,
      creator_transaction_id: creatorResult?.transaction?._id || null,
      referrer_transaction_id: null,
      referral_relationship_id: null,
    };

    // 4. Emit event
    appEvents.emit("payout.processed", breakdown);

    return {
      creatorResult,
      referrerResult: null,
      breakdown,
    };
  }

  // 3. If active:
  const commissionPercent = typeof referralRelationship.commission_percent === "number"
    ? referralRelationship.commission_percent
    : 5.0;

  const commission_amount = Number((gross_payout_amount * (commissionPercent / 100)).toFixed(2));
  const creator_net_amount = Number(Math.max(0, gross_payout_amount - platform_fee - commission_amount).toFixed(2));

  // Create creator's wallet transaction (transaction_type = "project_payout")
  const creatorTxRef = commonRef;
  const creatorResult = await creditCreatorWallet({
    creatorId,
    amount: creator_net_amount,
    collaborationId,
    campaignId,
    payoutId,
    referenceId: creatorTxRef,
    description: `${description} (Net after ${commissionPercent}% referral commission)`,
    transaction_type: "project_payout",
    related_referral_id: referralRelationship._id,
  });

  const creatorTransactionId = creatorResult?.transaction?._id;

  let referrerName = "Referrer";
  let referrerIsSuspended = false;
  try {
    const referrerProfile = await Profile.findById(referralRelationship.referrer_id).select(
      "fullName isSuspended suspendedUntil"
    );
    if (referrerProfile?.fullName) {
      referrerName = referrerProfile.fullName;
    }
    if (
      referrerProfile?.isSuspended &&
      (!referrerProfile.suspendedUntil || new Date(referrerProfile.suspendedUntil) > new Date())
    ) {
      referrerIsSuspended = true;
    }
  } catch (err) {
    console.warn("Could not fetch referrer profile:", err.message);
  }

  // Create referrer's wallet transaction (transaction_type = "referral_commission")
  // If referrer is suspended: hold in "PENDING" status until account is reinstated or revoked
  const commissionStatus = referrerIsSuspended ? "PENDING" : "COMPLETED";
  const commissionDesc = referrerIsSuspended
    ? `Referral commission (${commissionPercent}%) held in PENDING — referrer account suspended`
    : `Referral commission (${commissionPercent}%) from project payout of ${creator.fullName || "creator"}`;

  const referrerTxRef = `${commonRef}-COMM`;
  const referrerResult = await creditCreatorWallet({
    creatorId: referralRelationship.referrer_id,
    amount: commission_amount,
    collaborationId,
    campaignId,
    payoutId: null, // Payout doc belongs to creator, avoid unique sparse index collision on payoutId
    referenceId: referrerTxRef,
    description: commissionDesc,
    transaction_type: "referral_commission",
    related_transaction_id: creatorTransactionId || null,
    related_referral_id: referralRelationship._id,
    status: commissionStatus,
  });

  // Link creator transaction's related_transaction_id to referrer's transaction if available
  if (creatorResult?.transaction && referrerResult?.transaction) {
    creatorResult.transaction.related_transaction_id = referrerResult.transaction._id;
    await creatorResult.transaction.save();
  }

  const breakdown = {
    creator_id: creatorId,
    project_id: campaignId || collaborationId || payoutId,
    payout_id: payoutId,
    collaboration_id: collaborationId,
    campaign_id: campaignId,
    common_reference: commonRef,
    gross_payout_amount,
    platform_fee,
    commission_percent: commissionPercent,
    commission_amount,
    referrer_name: referrerName,
    creator_net_amount,
    has_active_referral: true,
    referrer_id: referralRelationship.referrer_id,
    creator_transaction_id: creatorTransactionId || null,
    referrer_transaction_id: referrerResult?.transaction?._id || null,
    referral_relationship_id: referralRelationship._id,
  };

  // 4. Emit internal event "payout.processed" with the full breakdown
  appEvents.emit("payout.processed", breakdown);

  return {
    creatorResult,
    referrerResult,
    breakdown,
  };
};

/**
 * Reverse a project payout and any associated referral commission.
 * Logic:
 * 1. Find the original payout's wallet_transactions row.
 * 2. Find any linked referral_commission transaction via related_transaction_id.
 * 3. If found, create an offsetting wallet_transactions row on the referrer's wallet:
 *    transaction_type = "refund_reversal", amount = -[original commission amount],
 *    related_transaction_id = the original referral_commission transaction's id.
 * 4. Mark both the original payout transaction and the original referral_commission transaction as status = "reversed".
 */
export const reversePayoutAndReferralCommission = async ({ payout_id }) => {
  if (!payout_id) {
    throw new Error("payout_id is required");
  }

  // 1. Find original payout wallet transaction
  // Can be linked via payoutId or referenceId or _id
  let payoutTx = await WalletTransaction.findOne({ payoutId: payout_id });
  if (!payoutTx) {
    // Try matching by transaction _id directly
    payoutTx = await WalletTransaction.findById(payout_id);
  }

  if (!payoutTx) {
    return {
      success: false,
      message: `No wallet transaction found for payout ${payout_id}`,
      reversed_payout: false,
      reversed_commission: false,
    };
  }

  // Deduct from creator's wallet if it was previously credited
  if (payoutTx.status !== "reversed" && payoutTx.status !== "REVERSED") {
    await Wallet.findOneAndUpdate(
      { creatorId: payoutTx.creatorId },
      {
        $inc: {
          availableBalance: -payoutTx.amount,
          totalEarned: -payoutTx.amount,
        },
      }
    );
  }

  // 2. Find any linked referral_commission transaction
  let commissionTx = null;
  if (payoutTx.related_transaction_id) {
    commissionTx = await WalletTransaction.findById(payoutTx.related_transaction_id);
  }
  if (!commissionTx) {
    // Check reverse direction: where related_transaction_id = payoutTx._id
    commissionTx = await WalletTransaction.findOne({
      related_transaction_id: payoutTx._id,
      transaction_type: "referral_commission",
    });
  }

  let reversalCommissionTx = null;

  // 3. If linked referral_commission found, create offsetting row on referrer's wallet
  if (commissionTx) {
    const originalCommissionAmount = commissionTx.amount;
    const referrerId = commissionTx.creatorId;

    // Deduct original commission from referrer's wallet if it was credited
    if (commissionTx.status === "COMPLETED") {
      await Wallet.findOneAndUpdate(
        { creatorId: referrerId },
        {
          $inc: {
            availableBalance: -originalCommissionAmount,
            totalEarned: -originalCommissionAmount,
          },
        }
      );
    }

    const reversalRef = `REV-COMM-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Create offsetting row: amount = -[original commission amount]
    reversalCommissionTx = await WalletTransaction.create({
      creatorId: referrerId,
      collaborationId: commissionTx.collaborationId,
      campaignId: commissionTx.campaignId,
      type: "DEBIT",
      transaction_type: "refund_reversal",
      amount: -originalCommissionAmount,
      currency: commissionTx.currency || "INR",
      status: "COMPLETED",
      description: `Reversal of referral commission for refunded/disputed payout`,
      referenceId: reversalRef,
      related_transaction_id: commissionTx._id,
      related_referral_id: commissionTx.related_referral_id,
    });

    // 4. Mark original referral commission transaction as status = "reversed"
    commissionTx.status = "reversed";
    await commissionTx.save();
  }

  // 4. Mark original payout transaction as status = "reversed"
  payoutTx.status = "reversed";
  await payoutTx.save();

  return {
    success: true,
    payout_transaction_id: payoutTx._id,
    commission_transaction_id: commissionTx?._id || null,
    reversal_transaction_id: reversalCommissionTx?._id || null,
    reversed_payout: true,
    reversed_commission: Boolean(commissionTx),
  };
};

