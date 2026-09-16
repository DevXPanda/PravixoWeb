import mongoose from "mongoose";

const referralRelationshipSchema = new mongoose.Schema(
  {
    referrer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },
    referrer_type: {
      type: String,
      enum: ["brand", "creator"],
      required: true,
    },
    referred_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      unique: true,
      index: true,
    },
    referred_type: {
      type: String,
      enum: ["brand", "creator"],
      required: true,
    },
    referral_code_used: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "revoked"],
      default: "active",
      index: true,
    },
    commission_percent: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 100,
    },
    expires_at: {
      type: Date,
      default: null,
    },
    revoke_reason: {
      type: String,
      default: null,
    },
    revoked_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

referralRelationshipSchema.index({ referrer_id: 1, status: 1 });

const ReferralRelationship =
  mongoose.models.ReferralRelationship ||
  mongoose.model("ReferralRelationship", referralRelationshipSchema);

export default ReferralRelationship;
