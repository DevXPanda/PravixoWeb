import Profile from "../models/Profile.js";
import Referral from "../models/Referral.js";
import ReferralReward from "../models/ReferralReward.js";
import ReferralRelationship from "../models/ReferralRelationship.js";
import WalletTransaction from "../models/WalletTransaction.js";
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

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const referrals = await Referral.find({ referrerCreatorId: creatorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("referredCreatorId", "fullName handle avatarUrl verificationStatus createdAt")
      .lean();

    const total = await Referral.countDocuments({ referrerCreatorId: creatorId });

    // Fetch corresponding rewards
    const referralIds = referrals.map((r) => r._id);
    const rewards = await ReferralReward.find({ referralId: { $in: referralIds } }).lean();
    const rewardsMap = new Map(rewards.map((rw) => [rw.referralId.toString(), rw]));

    // Format output with privacy masking
    const formattedList = referrals.map((ref) => {
      const referred = ref.referredCreatorId || {};
      const reward = rewardsMap.get(ref._id.toString());

      // Mask creator name for privacy: "John Doe" -> "John D."
      const fullName = referred.fullName || "Previxo Creator";
      const parts = fullName.trim().split(" ");
      const maskedName = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];

      return {
        _id: ref._id,
        referredCreator: {
          name: maskedName,
          handle: referred.handle ? `@${referred.handle}` : "",
          avatarUrl: referred.avatarUrl || "",
          verificationStatus: referred.verificationStatus || "pending",
        },
        referralCode: ref.referralCode,
        status: ref.status,
        date: ref.createdAt,
        qualifiedAt: ref.qualifiedAt,
        rewardAmount: reward ? reward.rewardAmount : null,
        rewardStatus: reward ? reward.status : (ref.status === "reward_credited" ? "credited" : "pending"),
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        referrals: formattedList,
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

    return res.status(200).json({
      referral_code: code,
      referral_link,
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
      : userId;

    // 1. Calculate active referrals count where current user is referrer
    const relCount = await ReferralRelationship.countDocuments({
      $or: [
        { referrer_id: targetObjectId },
        { referrer_id: userId },
      ],
      status: "active",
    });

    const profileRefCount = await Profile.countDocuments({
      $or: [
        { referred_by_user_id: targetObjectId },
        { referred_by_user_id: userId },
        { referredBy: targetObjectId },
        { referredBy: userId },
      ],
    });

    const active_referrals_count = Math.max(relCount, profileRefCount);

    // 2. Aggregate total commission earned by current user
    const totalEarnedAgg = await WalletTransaction.aggregate([
      {
        $match: {
          $or: [
            { creatorId: targetObjectId },
            { creatorId: userId.toString() },
          ],
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
      $or: [
        { creatorId: targetObjectId },
        { creatorId: userId.toString() },
      ],
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

    return res.status(200).json({
      total_earned,
      active_referrals_count,
      earnings,
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
    const { status } = req.query;
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const relationships = await ReferralRelationship.find(filter)
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

    const data = relationships.map((rel) => {
      const referrer = rel.referrer_id;
      const referred = rel.referred_id;

      return {
        id: rel._id,
        referrer_name: referrer?.fullName || referrer?.handle || "Unknown Referrer",
        referrer_type: rel.referrer_type,
        referred_name: referred?.fullName || referred?.handle || "Unknown Referred",
        referred_type: rel.referred_type,
        status: rel.status,
        commission_percent: rel.commission_percent ?? 5.0,
        total_commission_paid: commissionMap.get(rel._id.toString()) || 0.0,
        created_at: rel.created_at || rel.createdAt,
        revoke_reason: rel.revoke_reason || null,
        revoked_at: rel.revoked_at || null,
      };
    });

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

