// Ye file reviews ka MongoDB/Mongoose model define karti hai.

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // Who is receiving the review (can be creator or brand)
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      index: true,
    },

    // Who wrote the review
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      index: true,
    },

    // Role of reviewer ("brand" or "creator")
    reviewerRole: {
      type: String,
      enum: ["brand", "creator"],
      default: "brand",
    },

    // Backward compatibility fields
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      index: true,
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      index: true,
    },

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: false,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    campaignRef: {
      type: String,
    },

    // Admin moderation status: default approved so reviews display immediately
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },

    visible: {
      type: Boolean,
      default: true,
    },

    createdAt: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;