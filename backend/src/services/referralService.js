import mongoose from "mongoose";
import Referral from "../models/Referral.js";
import ReferralReward from "../models/ReferralReward.js";
import ReferralSetting from "../models/ReferralSetting.js";
import Profile from "../models/Profile.js";
import Notification from "../models/Notification.js";
import { creditCreatorWallet } from "../controllers/walletController.js";
import { sendPushToUser } from "../utils/webPush.js";

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
