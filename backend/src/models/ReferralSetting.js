import mongoose from "mongoose";

const referralSettingSchema = new mongoose.Schema(
  {
    isEnabled: {
      type: Boolean,
      default: true,
    },

    rewardAmount: {
      type: Number,
      default: 500, // ₹500 default reward
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },

    qualificationTrigger: {
      type: String,
      enum: [
        "on_register",
        "profile_verified",
        "first_collaboration_completed",
        "admin_manual",
      ],
      default: "profile_verified",
    },

    maxReferralsPerUser: {
      type: Number,
      default: 0, // 0 means unlimited
      min: 0,
    },

    campaignExpiryDate: {
      type: Date,
      default: null,
    },

    terms: {
      type: [String],
      default: [
        "Invite other creators to Previxo using your unique referral link.",
        "When the referred creator registers and completes profile verification, your reward is credited.",
        "Rewards are credited directly to your Previxo Creator Wallet.",
        "Self-referrals and duplicate accounts are strictly prohibited and will be disqualified.",
      ],
    },
  },
  {
    timestamps: true,
  }
);

const ReferralSetting = mongoose.model(
  "ReferralSetting",
  referralSettingSchema
);

export default ReferralSetting;
