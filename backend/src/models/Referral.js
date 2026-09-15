import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
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
      unique: true, // A creator can only be referred once in their lifetime
      index: true,
    },

    referralCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "registered",
        "qualified",
        "reward_pending",
        "reward_credited",
        "rejected",
        "expired",
      ],
      default: "registered",
      index: true,
    },

    qualificationCondition: {
      type: String,
      default: "profile_verified",
    },

    qualifiedAt: {
      type: Date,
      default: null,
    },

    rewardCreditedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

referralSchema.index({ referrerCreatorId: 1, status: 1 });
referralSchema.index({ referrerCreatorId: 1, createdAt: -1 });

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;
