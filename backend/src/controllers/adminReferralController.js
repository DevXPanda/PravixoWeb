import Referral from "../models/Referral.js";
import ReferralReward from "../models/ReferralReward.js";
import ReferralSetting from "../models/ReferralSetting.js";
import Profile from "../models/Profile.js";
import {
  getActiveReferralSettings,
  processReferralQualification,
} from "../services/referralService.js";

/**
 * GET /api/admin/referrals
 * List all referrals with pagination, filter by status, search by creator name or code.
 */
export const adminListReferrals = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      const matchingProfiles = await Profile.find({
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { handle: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const profileIds = matchingProfiles.map((p) => p._id);
      query.$or = [
        { referralCode: { $regex: search, $options: "i" } },
        { referrerCreatorId: { $in: profileIds } },
        { referredCreatorId: { $in: profileIds } },
      ];
    }

    const [referrals, total] = await Promise.all([
      Referral.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("referrerCreatorId", "fullName email handle avatarUrl")
        .populate("referredCreatorId", "fullName email handle avatarUrl verificationStatus")
        .lean(),
      Referral.countDocuments(query),
    ]);

    // Attach rewards
    const referralIds = referrals.map((r) => r._id);
    const rewards = await ReferralReward.find({ referralId: { $in: referralIds } }).lean();
    const rewardsMap = new Map(rewards.map((rw) => [rw.referralId.toString(), rw]));

    const data = referrals.map((r) => ({
      ...r,
      reward: rewardsMap.get(r._id.toString()) || null,
    }));

    return res.status(200).json({
      success: true,
      data: {
        referrals: data,
        pagination: {
          total,
          page,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (error) {
    console.error("adminListReferrals error:", error);
    return res.status(500).json({ success: false, message: "Failed to list referrals." });
  }
};

/**
 * GET /api/admin/referrals/stats
 * Overview analytics for admin referral management.
 */
export const adminGetReferralStats = async (req, res) => {
  try {
    const [
      totalReferrals,
      registeredCount,
      qualifiedCount,
      rewardCreditedCount,
      rejectedCount,
      totalRewardsData,
      totalReferrers,
    ] = await Promise.all([
      Referral.countDocuments(),
      Referral.countDocuments({ status: "registered" }),
      Referral.countDocuments({ status: "qualified" }),
      Referral.countDocuments({ status: "reward_credited" }),
      Referral.countDocuments({ status: "rejected" }),
      ReferralReward.aggregate([
        { $match: { status: "credited" } },
        { $group: { _id: null, totalAmount: { $sum: "$rewardAmount" } } },
      ]),
      Referral.distinct("referrerCreatorId"),
    ]);

    const totalRewardsDisbursed = totalRewardsData[0]?.totalAmount || 0;

    return res.status(200).json({
      success: true,
      data: {
        totalReferrals,
        registeredCount,
        qualifiedCount,
        rewardCreditedCount,
        rejectedCount,
        totalRewardsDisbursed,
        totalUniqueReferrers: totalReferrers.length,
      },
    });
  } catch (error) {
    console.error("adminGetReferralStats error:", error);
    return res.status(500).json({ success: false, message: "Failed to load referral stats." });
  }
};

/**
 * GET /api/admin/referrals/settings
 * Fetch current referral campaign settings.
 */
export const adminGetReferralSettings = async (req, res) => {
  try {
    const settings = await getActiveReferralSettings();
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("adminGetReferralSettings error:", error);
    return res.status(500).json({ success: false, message: "Failed to load settings." });
  }
};

/**
 * PUT /api/admin/referrals/settings
 * Update referral campaign settings.
 */
export const adminUpdateReferralSettings = async (req, res) => {
  try {
    const {
      isEnabled,
      rewardAmount,
      qualificationTrigger,
      maxReferralsPerUser,
      campaignExpiryDate,
      terms,
    } = req.body;

    let settings = await ReferralSetting.findOne();
    if (!settings) {
      settings = new ReferralSetting();
    }

    if (typeof isEnabled === "boolean") settings.isEnabled = isEnabled;
    if (typeof rewardAmount === "number" && rewardAmount >= 0) settings.rewardAmount = rewardAmount;
    if (qualificationTrigger) settings.qualificationTrigger = qualificationTrigger;
    if (typeof maxReferralsPerUser === "number") settings.maxReferralsPerUser = maxReferralsPerUser;
    if (campaignExpiryDate !== undefined) settings.campaignExpiryDate = campaignExpiryDate ? new Date(campaignExpiryDate) : null;
    if (Array.isArray(terms)) settings.terms = terms;

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Referral settings updated successfully.",
      data: settings,
    });
  } catch (error) {
    console.error("adminUpdateReferralSettings error:", error);
    return res.status(500).json({ success: false, message: "Failed to update settings." });
  }
};

/**
 * POST /api/admin/referrals/:id/qualify
 * Manually qualify a referral and disburse reward immediately.
 */
export const adminManuallyQualifyReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const referral = await Referral.findById(id);
    if (!referral) {
      return res.status(404).json({ success: false, message: "Referral not found." });
    }

    const result = await processReferralQualification({
      referredCreatorId: referral.referredCreatorId,
      triggerType: "admin_manual",
      adminOverride: true,
      notes: "Manually qualified by Admin",
    });

    if (!result.success && !result.alreadyCredited) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("adminManuallyQualifyReferral error:", error);
    return res.status(500).json({ success: false, message: "Failed to manually qualify referral." });
  }
};

/**
 * POST /api/admin/referrals/:id/reject
 * Reject a referral for fraud / violation.
 */
export const adminRejectReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const referral = await Referral.findById(id);
    if (!referral) {
      return res.status(404).json({ success: false, message: "Referral not found." });
    }

    if (referral.status === "reward_credited") {
      return res.status(400).json({
        success: false,
        message: "Cannot reject a referral whose reward has already been credited.",
      });
    }

    referral.status = "rejected";
    referral.rejectionReason = reason || "Rejected by administrator";
    await referral.save();

    return res.status(200).json({
      success: true,
      message: "Referral rejected successfully.",
      data: referral,
    });
  } catch (error) {
    console.error("adminRejectReferral error:", error);
    return res.status(500).json({ success: false, message: "Failed to reject referral." });
  }
};
