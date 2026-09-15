import Profile from "../models/Profile.js";
import Referral from "../models/Referral.js";
import ReferralReward from "../models/ReferralReward.js";
import { getActiveReferralSettings } from "../services/referralService.js";
import { getUniqueReferralCode } from "../utils/referralCode.js";

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
