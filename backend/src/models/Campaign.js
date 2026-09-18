import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    startDate: {
      type: Number,
      required: true,
      default: Date.now,
    },

    endDate: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      default: "Pan India",
      trim: true,
    },

    totalBudget: {
      type: Number,
      required: true,
      default: 0,
    },

    minBudgetPerCreator: {
      type: Number,
      default: 0,
    },

    maxBudgetPerCreator: {
      type: Number,
      default: 0,
    },

    minFollowers: {
      type: Number,
      default: 0,
    },

    tiers: [
      {
        minFollowers: { type: Number, default: 0 },
        reward: { type: String, default: "" },
        cashAmount: { type: Number, default: 0 },
        perks: { type: String, default: "" },
      },
    ],

    deliverables: {
      reels: { type: Number, default: 0 },
      posts: { type: Number, default: 0 },
      stories: { type: Number, default: 0 },
      videos: { type: Number, default: 0 },
      notes: { type: String, default: "" },
    },

    budget: {
      type: String,
      default: "",
    },

    duration: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["PENDING_VERIFICATION", "APPROVED", "REJECTED"],
      default: "PENDING_VERIFICATION",
      index: true,
    },

    verificationFeedback: {
      type: String,
      default: "",
    },

    active: {
      type: Boolean,
      required: true,
      default: true,
    },

    createdAt: {
      type: Number,
      required: true,
      default: Date.now,
    },

    updatedAt: {
      type: Number,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

campaignSchema.index({ status: 1, active: 1, endDate: 1 });

const Campaign = mongoose.model("Campaign", campaignSchema);

export default Campaign;