import mongoose from "mongoose";
import Profile from "../models/Profile.js";
import Referral from "../models/Referral.js";
import ReferralReward from "../models/ReferralReward.js";
import ReferralRelationship from "../models/ReferralRelationship.js";
import WalletTransaction from "../models/WalletTransaction.js";
import Connection from "../models/Connection.js";
import Campaign from "../models/Campaign.js";
import { getActiveReferralSettings } from "../services/referralService.js";
import { getUniqueReferralCode, generateTypedReferralCode } from "../utils/referralCode.js";

/**
 * GET /api/referrals/my-referral
 * Returns logged-in creator's referral code, link, rules, and reward details.
 */
export const getMyReferralDetails = async (req, res) => {
  try {
    const creatorId = req.user?._id;
    if (!creatorId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    let profile = await Profile.findById(creatorId).select("referralCode referralCount fullName email role");
    if (!profile) {
      return res.status(404).json({ success: false, message: "Creator profile not found." });
    }

    // Auto-generate referral code for existing creators if they don't have one yet
    if (!profile.referralCode && profile.role === "creator") {
      const newCode = await getUniqueReferralCode();
      profile.referralCode = newCode;
      await profile.save();
    }

    const settings = await getActiveReferralSettings();
    const origin = req.headers.origin || "https://previxo.com";
    const referralLink = `${origin}/register?ref=${profile.referralCode || ""}`;

    return res.status(200).json({
      success: true,
      data: {
        referralCode: profile.referralCode || "",
        referralLink,
        referralCount: profile.referralCount || 0,
        rewardAmount: settings.rewardAmount,
        currency: settings.currency,
        qualificationTrigger: settings.qualificationTrigger,
        isEnabled: settings.isEnabled,
        terms: settings.terms,
      },
    });
  } catch (error) {
    console.error("getMyReferralDetails error:", error);
    return res.status(500).json({ success: false, message: "Failed to load referral details." });
  }
};

/**
 * GET /api/referrals/stats
 * Returns breakdown of user's referrals and earnings.
 */
export const getMyReferralStats = async (req, res) => {
  try {
    const creatorId = req.user?._id;
    if (!creatorId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const [totalReferrals, pendingReferrals, qualifiedReferrals, creditedRewards] = await Promise.all([
      Referral.countDocuments({ referrerCreatorId: creatorId }),
      Referral.countDocuments({
        referrerCreatorId: creatorId,
        status: { $in: ["pending", "registered", "reward_pending"] },
      }),
      Referral.countDocuments({
        referrerCreatorId: creatorId,
        status: { $in: ["qualified", "reward_credited"] },
      }),
      ReferralReward.find({
        referrerCreatorId: creatorId,
        status: "credited",
      }),
    ]);

    const totalRewardsEarned = creditedRewards.reduce((sum, r) => sum + (r.rewardAmount || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        totalReferrals,
        pendingReferrals,
        qualifiedReferrals,
        totalRewardsEarned,
        rewardCount: creditedRewards.length,
      },
    });
  } catch (error) {
    console.error("getMyReferralStats error:", error);
    return res.status(500).json({ success: false, message: "Failed to load referral stats." });
  }
};

/**
 * GET /api/referrals/list
 * Returns paginated list of creators referred by the authenticated creator.
 * Masks sensitive details (email / phone) for privacy.
 */
export const getMyReferralsList = async (req, res) => {
  try {
    const creatorId = req.user?._id;
    if (!creatorId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const search = req.query.search ? req.query.search.trim().toLowerCase() : "";

    const targetObjectId = mongoose.Types.ObjectId.isValid(creatorId)
      ? new mongoose.Types.ObjectId(creatorId)
      : null;

    const userProfile = (targetObjectId ? await Profile.findById(targetObjectId).lean() : null) ||
      (await Profile.findOne({ $or: [{ _id: creatorId }, { userId: creatorId }] }).lean());

    const userCodes = [];
    if (userProfile?.referral_code) userCodes.push(userProfile.referral_code);
    if (userProfile?.referralCode && !userCodes.includes(userProfile.referralCode)) {
      userCodes.push(userProfile.referralCode);
    }

    const matchIds = [creatorId];
    if (targetObjectId) matchIds.push(targetObjectId);
    if (userProfile?._id && !matchIds.includes(userProfile._id)) matchIds.push(userProfile._id);

    // 1. Fetch ReferralRelationships
    const rels = await ReferralRelationship.find({
      $or: [
        { referrer_id: { $in: matchIds } },
        ...(userCodes.length > 0 ? [{ referral_code_used: { $in: userCodes } }] : []),
      ],
    })
      .populate("referred_id", "fullName email handle avatarUrl role createdAt verificationStatus")
      .lean();

    // 2. Fetch Profiles referred directly
    const referredProfiles = await Profile.find({
      $or: [
        { referred_by_user_id: { $in: matchIds } },
        { referredBy: { $in: matchIds } },
      ],
    })
      .select("fullName email handle avatarUrl role createdAt verificationStatus referredBy referred_by_user_id referralCode referral_code")
      .lean();

    // 3. Fetch legacy Referral records
    const legacyReferrals = await Referral.find({
      $or: [
        { referrerCreatorId: { $in: matchIds } },
        ...(userCodes.length > 0 ? [{ referralCode: { $in: userCodes } }] : []),
      ],
    })
      .populate("referredCreatorId", "fullName email handle avatarUrl role createdAt verificationStatus")
      .lean();

    // 4. Merge all referred users by referred profile ID
    const referredMap = new Map();

    // Process ReferralRelationships
    for (const rel of rels) {
      const refUser = rel.referred_id;
      if (!refUser || !refUser._id) continue;
      const uid = refUser._id.toString();
      referredMap.set(uid, {
        _id: refUser._id,
        relationshipId: rel._id,
        fullName: refUser.fullName || "Creator",
        handle: refUser.handle ? `@${refUser.handle.replace(/^@/, "")}` : "",
        email: refUser.email || "",
        avatarUrl: refUser.avatarUrl || "",
        role: refUser.role || rel.referred_type || "creator",
        verificationStatus: refUser.verificationStatus || "pending",
        referralCode: rel.referral_code_used || userCodes[0] || "",
        status: rel.status || "active",
        commissionPercent: rel.commission_percent ?? 5.0,
        date: rel.created_at || rel.createdAt || refUser.createdAt,
      });
    }

    // Process directly referred Profiles
    for (const p of referredProfiles) {
      const uid = p._id.toString();
      if (!referredMap.has(uid)) {
        referredMap.set(uid, {
          _id: p._id,
          relationshipId: null,
          fullName: p.fullName || "Creator",
          handle: p.handle ? `@${p.handle.replace(/^@/, "")}` : "",
          email: p.email || "",
          avatarUrl: p.avatarUrl || "",
          role: p.role || "creator",
          verificationStatus: p.verificationStatus || "pending",
          referralCode: userCodes[0] || "",
          status: "active",
          commissionPercent: 5.0,
          date: p.createdAt || new Date(),
        });
      }
    }

    // Process legacy Referrals
    for (const lr of legacyReferrals) {
      const refUser = lr.referredCreatorId;
      if (!refUser || !refUser._id) continue;
      const uid = refUser._id.toString();
      if (!referredMap.has(uid)) {
        referredMap.set(uid, {
          _id: refUser._id,
          relationshipId: null,
          fullName: refUser.fullName || "Creator",
          handle: refUser.handle ? `@${refUser.handle.replace(/^@/, "")}` : "",
          email: refUser.email || "",
          avatarUrl: refUser.avatarUrl || "",
          role: refUser.role || "creator",
          verificationStatus: refUser.verificationStatus || "pending",
          referralCode: lr.referralCode || userCodes[0] || "",
          status: lr.status === "reward_credited" || lr.status === "qualified" ? "active" : lr.status,
          commissionPercent: 5.0,
          date: lr.createdAt || refUser.createdAt,
        });
      }
    }

    const allReferred = Array.from(referredMap.values());

    // 5. Aggregate earnings per referred user
    // a) Total project payouts completed by referred user
    // b) Total 5% referral commission earned by logged-in referrer from this user
    const referredIds = allReferred.map((r) => r._id);
    const relIds = allReferred.map((r) => r.relationshipId).filter(Boolean);

    // Referred users' completed payouts
    const userPayouts = await WalletTransaction.aggregate([
      {
        $match: {
          creatorId: { $in: referredIds },
          transaction_type: "project_payout",
          status: "COMPLETED",
        },
      },
      {
        $group: {
          _id: "$creatorId",
          totalEarned: { $sum: "$amount" },
          projectCount: { $sum: 1 },
        },
      },
    ]);
    const userPayoutMap = new Map();
    userPayouts.forEach((up) => {
      userPayoutMap.set(up._id.toString(), {
        totalEarned: Number(up.totalEarned.toFixed(2)),
        projectCount: up.projectCount,
      });
    });

    // Commission transactions earned by referrer
    const commTxs = await WalletTransaction.find({
      creatorId: { $in: matchIds },
      transaction_type: "referral_commission",
      status: "COMPLETED",
    }).lean();

    const commissionByReferredUserMap = new Map();
    commTxs.forEach((tx) => {
      let linkedReferredUserId = null;
      if (tx.related_referral_id) {
        const found = allReferred.find(
          (r) => r.relationshipId && r.relationshipId.toString() === tx.related_referral_id.toString()
        );
        if (found) linkedReferredUserId = found._id.toString();
      }

      // Check description text fallback (e.g. "...payout of Pihu")
      if (!linkedReferredUserId && tx.description) {
        for (const ref of allReferred) {
          if (tx.description.toLowerCase().includes(ref.fullName.toLowerCase())) {
            linkedReferredUserId = ref._id.toString();
            break;
          }
        }
      }

      if (linkedReferredUserId) {
        const curr = commissionByReferredUserMap.get(linkedReferredUserId) || 0;
        commissionByReferredUserMap.set(linkedReferredUserId, curr + tx.amount);
      }
    });

    // Attach aggregated stats to each referred creator
    let enrichedList = allReferred.map((ref) => {
      const payoutStats = userPayoutMap.get(ref._id.toString()) || { totalEarned: 0, projectCount: 0 };
      const commEarned = Number((commissionByReferredUserMap.get(ref._id.toString()) || 0).toFixed(2));

      return {
        ...ref,
        referredUserEarnings: payoutStats.totalEarned,
        projectCount: payoutStats.projectCount,
        commissionEarned: commEarned,
      };
    });

    // Apply search filter if provided
    if (search) {
      enrichedList = enrichedList.filter((r) =>
        r.fullName.toLowerCase().includes(search) ||
        r.handle.toLowerCase().includes(search) ||
        r.email.toLowerCase().includes(search) ||
        r.referralCode.toLowerCase().includes(search)
      );
    }

    // Sort by date descending
    enrichedList.sort((a, b) => new Date(b.date) - new Date(a.date));

    const total = enrichedList.length;
    const skip = (page - 1) * limit;
    const paginated = enrichedList.slice(skip, skip + limit);

    const totalCommissionEarned = enrichedList.reduce((sum, r) => sum + r.commissionEarned, 0);

    return res.status(200).json({
      success: true,
      data: {
        referrals: paginated,
        total,
        totalCommissionEarned: Number(totalCommissionEarned.toFixed(2)),
        activeCount: enrichedList.filter((r) => r.status === "active").length,
        pagination: {
          total,
          page,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (error) {
    console.error("getMyReferralsList error:", error);
    return res.status(500).json({ success: false, message: "Failed to load referrals list." });
  }
};

/**
 * POST /api/referrals/validate
 * Public endpoint to validate a referral code during signup or pre-check.
 */
export const validateReferralCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ success: false, valid: false, message: "Referral code is required." });
    }

    const normalizedCode = code.trim().toUpperCase();
    const referrer = await Profile.findOne({ referralCode: normalizedCode }).select("fullName role verificationStatus");

    if (!referrer) {
      return res.status(404).json({ success: false, valid: false, message: "Invalid referral code." });
    }

    const settings = await getActiveReferralSettings();
    if (!settings.isEnabled) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Referral campaign is currently paused.",
      });
    }

    // Mask referrer name
    const parts = (referrer.fullName || "Creator").split(" ");
    const referrerDisplayName = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];

    return res.status(200).json({
      success: true,
      valid: true,
      data: {
        referralCode: normalizedCode,
        referrerName: referrerDisplayName,
        rewardAmount: settings.rewardAmount,
        currency: settings.currency,
      },
    });
  } catch (error) {
    console.error("validateReferralCode error:", error);
    return res.status(500).json({ success: false, valid: false, message: "Error validating code." });
  }
};

/**
 * Helper to check if referredUser was already referred by referringUser
 * or if there exists a chain where referredUser already referred referringUser (preventing circular loops).
 */
const hasCircularReferralChain = async (potentialReferrerId, redeemingUserId) => {
  let currentId = potentialReferrerId;
  const visited = new Set();

  while (currentId) {
    if (currentId.toString() === redeemingUserId.toString()) {
      return true; // Cycle detected: potentialReferrer traces back to redeemingUser
    }
    if (visited.has(currentId.toString())) {
      break;
    }
    visited.add(currentId.toString());

    // Check relationship table or user referred_by_user_id
    const referrerProfile = await Profile.findById(currentId).select(
      "referred_by_user_id referredBy"
    );
    if (!referrerProfile) break;

    currentId = referrerProfile.referred_by_user_id || referrerProfile.referredBy;
  }

  return false;
};

/**
 * GET /api/v1/referrals/my-code (or /api/referrals/my-code)
 * Generates (if not exists) and returns the logged-in user's unique referral code.
 * Format: 2-letter type prefix (BR for brand, CR for creator) + 5 random alphanumeric chars.
 * Response: { "referral_code": "BR-K9X2Q", "referral_link": "https://platform.com/join?ref=BR-K9X2Q" }
 */
export const getMyReferralCode = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const profile = await Profile.findById(userId);
    if (!profile) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    let code = profile.referral_code || profile.referralCode;

    // Check if existing code already matches the 2-letter prefix + 5 chars pattern
    const rolePrefix = profile.role === "brand" ? "BR" : "CR";
    const pattern = new RegExp(`^${rolePrefix}-[A-Z0-9]{5}$`);

    if (!code || !pattern.test(code)) {
      code = await generateTypedReferralCode(profile.role);
      profile.referral_code = code;
      profile.referralCode = code; // keep both in sync
      await profile.save();
    }

    const origin =
      process.env.FRONTEND_URL ||
      req.headers.origin ||
      "https://platform.com";
    const cleanOrigin = origin.replace(/\/+$/, "");
    const referral_link = `${cleanOrigin}/join?ref=${code}`;

    const codeData = {
      referral_code: code,
      referral_link,
    };

    return res.status(200).json({
      success: true,
      data: codeData,
      ...codeData,
    });
  } catch (error) {
    console.error("getMyReferralCode error:", error);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};

/**
 * POST /api/v1/referrals/redeem (or /api/referrals/redeem)
 * Body: { "referral_code": "BR-K9X2Q" }
 * Validates the code and creates a referral_relationships row linking the redeeming user to the code owner.
 */
export const redeemReferralCode = async (req, res) => {
  try {
    const redeemingUserId = req.user?._id;
    if (!redeemingUserId) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const { referral_code } = req.body;
    if (!referral_code || typeof referral_code !== "string") {
      return res
        .status(400)
        .json({ error: "INVALID_REFERRAL", reason: "missing_code" });
    }

    const normalizedCode = referral_code.trim().toUpperCase();

    // 1. Fetch the redeeming user
    const redeemingUser = await Profile.findById(redeemingUserId);
    if (!redeemingUser) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    // Rule 1: A user can only be referred once
    if (redeemingUser.referred_by_user_id || redeemingUser.referredBy) {
      return res.status(409).json({ error: "USER_ALREADY_REFERRED" });
    }

    // 2. Find code owner (referrer)
    const referrer = await Profile.findOne({
      $or: [{ referral_code: normalizedCode }, { referralCode: normalizedCode }],
    });

    if (!referrer) {
      return res
        .status(400)
        .json({ error: "INVALID_REFERRAL", reason: "invalid_code" });
    }

    // Rule 2: Block self-referral
    if (referrer._id.toString() === redeemingUser._id.toString()) {
      return res
        .status(400)
        .json({ error: "INVALID_REFERRAL", reason: "self_referral" });
    }

    // Rule 3: Block circular referrals (if A referred B, B cannot refer A back)
    const isCircular = await hasCircularReferralChain(
      referrer._id,
      redeemingUser._id
    );
    if (isCircular) {
      return res
        .status(400)
        .json({ error: "INVALID_REFERRAL", reason: "circular_referral" });
    }

    // Map referrer_type and referred_type
    const referrerType = referrer.role === "brand" ? "brand" : "creator";
    const referredType = redeemingUser.role === "brand" ? "brand" : "creator";
    const settingKey = `${referrerType}_to_${referredType}`;

    // Get commission percent from referral_settings
    let commissionPercent = 5.0;
    const activeSettings = await getActiveReferralSettings();
    if (
      activeSettings &&
      typeof activeSettings.commission_percent === "number"
    ) {
      commissionPercent = activeSettings.commission_percent;
    }

    // Create the referral_relationships record
    const referralRelationship = await ReferralRelationship.create({
      referrer_id: referrer._id,
      referrer_type: referrerType,
      referred_id: redeemingUser._id,
      referred_type: referredType,
      referral_code_used: normalizedCode,
      status: "active",
      commission_percent: commissionPercent,
      expires_at: null,
    });

    // Update redeeming user
    const now = new Date();
    redeemingUser.referred_by_user_id = referrer._id;
    redeemingUser.referredBy = referrer._id;
    redeemingUser.referred_at = now;
    await redeemingUser.save();

    // Increment referrer's count
    await Profile.findByIdAndUpdate(referrer._id, {
      $inc: { referralCount: 1 },
    });

    // Success response format specified by user
    return res.status(200).json({
      success: true,
      referral_relationship_id: referralRelationship._id,
      referrer: {
        id: referrer._id,
        name: referrer.fullName,
        type: referrerType,
      },
      commission_percent: commissionPercent,
    });
  } catch (error) {
    console.error("redeemReferralCode error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ error: "USER_ALREADY_REFERRED" });
    }
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};

/**
 * GET /api/v1/referrals/earnings?page=1&limit=20
 * Returns for the logged-in user:
 * {
 *   "total_earned": 12500.00,
 *   "active_referrals_count": 8,
 *   "earnings": [
 *     { "referred_user_name": "Jane Creator", "project_id": "uuid", "commission_amount": 500.00, "date": "ISO8601" }
 *   ]
 * }
 */
export const getReferralEarnings = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const targetObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : null;

    const userProfile = (targetObjectId ? await Profile.findById(targetObjectId).lean() : null) ||
      (await Profile.findOne({ $or: [{ _id: userId }, { userId: userId }] }).lean());

    const userCodes = [];
    if (userProfile?.referral_code) userCodes.push(userProfile.referral_code);
    if (userProfile?.referralCode && !userCodes.includes(userProfile.referralCode)) {
      userCodes.push(userProfile.referralCode);
    }
    if (userProfile?.userId && !userCodes.includes(userProfile.userId)) {
      userCodes.push(userProfile.userId);
    }

    const validObjectIds = [];
    if (targetObjectId) validObjectIds.push(targetObjectId);
    if (userProfile?._id) {
      const pId = mongoose.Types.ObjectId.isValid(userProfile._id) ? new mongoose.Types.ObjectId(userProfile._id) : null;
      if (pId && !validObjectIds.some((id) => id.equals(pId))) validObjectIds.push(pId);
    }

    // 1. Calculate active referrals count where current user is referrer (by ID or code)
    const relCount = await ReferralRelationship.countDocuments({
      $or: [
        ...(validObjectIds.length > 0 ? [{ referrer_id: { $in: validObjectIds } }] : []),
        ...(userCodes.length > 0 ? [{ referral_code_used: { $in: userCodes } }] : []),
      ],
      status: "active",
    });

    const profileRefCount = validObjectIds.length > 0
      ? await Profile.countDocuments({
          $or: [
            { referred_by_user_id: { $in: validObjectIds } },
            { referredBy: { $in: validObjectIds } },
          ],
        })
      : 0;

    const active_referrals_count = Math.max(relCount, profileRefCount);

    // 2. Aggregate total commission earned by current user
    const totalEarnedAgg = await WalletTransaction.aggregate([
      {
        $match: {
          creatorId: { $in: validObjectIds },
          transaction_type: "referral_commission",
          status: "COMPLETED",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const total_earned = totalEarnedAgg.length > 0 ? Number(totalEarnedAgg[0].total.toFixed(2)) : 0.0;

    // 3. Paginated list of commission transactions
    const commissionTxs = await WalletTransaction.find({
      creatorId: { $in: validObjectIds },
      transaction_type: "referral_commission",
      status: "COMPLETED",
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "related_referral_id",
        populate: {
          path: "referred_id",
          select: "fullName handle",
        },
      })
      .lean();

    const earnings = commissionTxs.map((tx) => {
      const referralRel = tx.related_referral_id;
      const referredUser = referralRel?.referred_id;
      const referred_user_name =
        referredUser?.fullName || referredUser?.handle || "Referred User";

      return {
        referred_user_name,
        project_id: (tx.campaignId || tx.collaborationId || "").toString(),
        commission_amount: Number(tx.amount.toFixed(2)),
        date: tx.createdAt ? new Date(tx.createdAt).toISOString() : new Date().toISOString(),
      };
    });

    const payload = {
      total_earned,
      active_referrals_count,
      earnings,
    };

    return res.status(200).json({
      success: true,
      data: payload,
      ...payload,
    });
  } catch (error) {
    console.error("getReferralEarnings error:", error);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};

/**
 * POST /api/v1/admin/referrals/:id/revoke (admin auth only)
 * Body: { "reason": "fraud_suspected" }
 * Sets the referral_relationships.status to "revoked".
 * Once revoked, no further commissions are calculated for that relationship.
 * Response: { "status": "revoked" }
 */
export const revokeReferralRelationship = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = "admin_action" } = req.body;

    const relationship = await ReferralRelationship.findById(id);
    if (!relationship) {
      return res.status(404).json({ error: "REFERRAL_RELATIONSHIP_NOT_FOUND" });
    }

    relationship.status = "revoked";
    relationship.revoke_reason = reason;
    relationship.revoked_at = new Date();
    await relationship.save();

    return res.status(200).json({ status: "revoked" });
  } catch (error) {
    console.error("revokeReferralRelationship error:", error);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};

/**
 * GET /api/v1/admin/referrals
 * Admin listing of all referral_relationships with:
 * referrer name/type, referred user name/type, status, commission_percent,
 * total commission paid to date, created_at. Includes status filter.
 */
export const listAdminReferralRelationships = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    let relationships = await ReferralRelationship.find(filter)
      .populate("referrer_id", "fullName email role handle")
      .populate("referred_id", "fullName email role handle")
      .sort({ created_at: -1 })
      .lean();

    // Compute total commission paid to date for each referral relationship
    const relationshipIds = relationships.map((r) => r._id);
    const commissionTotals = await WalletTransaction.aggregate([
      {
        $match: {
          related_referral_id: { $in: relationshipIds },
          transaction_type: "referral_commission",
          status: "COMPLETED",
        },
      },
      {
        $group: {
          _id: "$related_referral_id",
          totalCommission: { $sum: "$amount" },
        },
      },
    ]);

    const commissionMap = new Map();
    commissionTotals.forEach((item) => {
      commissionMap.set(item._id.toString(), Number(item.totalCommission.toFixed(2)));
    });

    let data = relationships.map((rel) => {
      const referrer = rel.referrer_id;
      const referred = rel.referred_id;

      return {
        id: rel._id,
        referrer_id: referrer?._id || null,
        referrer_name: referrer?.fullName || referrer?.handle || "Unknown Referrer",
        referrer_email: referrer?.email || "",
        referrer_handle: referrer?.handle ? `@${referrer.handle.replace(/^@/, "")}` : "",
        referrer_type: rel.referrer_type,
        referred_id: referred?._id || null,
        referred_name: referred?.fullName || referred?.handle || "Unknown Referred",
        referred_email: referred?.email || "",
        referred_handle: referred?.handle ? `@${referred.handle.replace(/^@/, "")}` : "",
        referred_type: rel.referred_type,
        referral_code_used: rel.referral_code_used || "N/A",
        status: rel.status,
        commission_percent: rel.commission_percent ?? 5.0,
        total_commission_paid: commissionMap.get(rel._id.toString()) || 0.0,
        created_at: rel.created_at || rel.createdAt,
        revoke_reason: rel.revoke_reason || null,
        revoked_at: rel.revoked_at || null,
      };
    });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(
        (r) =>
          r.referrer_name.toLowerCase().includes(q) ||
          r.referrer_email.toLowerCase().includes(q) ||
          r.referred_name.toLowerCase().includes(q) ||
          r.referred_email.toLowerCase().includes(q) ||
          r.referral_code_used.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      relationships: data,
    });
  } catch (error) {
    console.error("listAdminReferralRelationships error:", error);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};

/**
 * GET /api/v1/admin/referrals/relationships/:id/transactions
 * Retrieve all wallet commission transactions associated with a referral relationship.
 */
export const getAdminRelationshipTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const relationship = await ReferralRelationship.findById(id)
      .populate("referrer_id", "fullName email role handle avatarUrl")
      .populate("referred_id", "fullName email role handle avatarUrl")
      .lean();

    if (!relationship) {
      return res.status(404).json({ success: false, message: "Referral relationship not found" });
    }

    const commissionTxs = await WalletTransaction.find({
      $or: [
        { related_referral_id: id },
        ...(relationship.referrer_id?._id
          ? [
              {
                creatorId: relationship.referrer_id._id,
                transaction_type: "referral_commission",
                ...(relationship.referred_id?.fullName
                  ? { description: { $regex: new RegExp(relationship.referred_id.fullName, "i") } }
                  : {}),
              },
            ]
          : []),
      ],
    })
      .sort({ createdAt: -1 })
      .populate("collaborationId", "title")
      .populate("campaignId", "title")
      .lean();

    const transactions = commissionTxs.map((tx) => ({
      _id: tx._id,
      amount: tx.amount,
      currency: tx.currency,
      type: tx.type,
      transaction_type: tx.transaction_type,
      status: tx.status,
      referenceId: tx.referenceId,
      description: tx.description,
      date: tx.createdAt,
      projectTitle: tx.collaborationId?.title || tx.campaignId?.title || "Project Collaboration",
    }));

    return res.status(200).json({
      success: true,
      relationship,
      transactions,
    });
  } catch (error) {
    console.error("getAdminRelationshipTransactions error:", error);
    return res.status(500).json({ success: false, message: "Failed to load relationship transactions." });
  }
};

