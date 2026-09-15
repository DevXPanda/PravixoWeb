import mongoose from "mongoose";

const referralRewardSchema = new mongoose.Schema(
  {
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      required: true,
      unique: true, // Guarantees idempotency: exactly one reward record per referral
      index: true,
    },

    referrerCreatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    referredCreatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    rewardAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },

    status: {
      type: String,
      enum: ["pending", "credited", "failed", "cancelled"],
      default: "credited",
      index: true,
    },

    walletTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletTransaction",
      default: null,
    },

    creditedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

referralRewardSchema.index({ referrerCreatorId: 1, createdAt: -1 });

const ReferralReward = mongoose.model(
  "ReferralReward",
  referralRewardSchema
);

export default ReferralReward;
