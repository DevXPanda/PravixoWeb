import mongoose from "mongoose";

const addonServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
    },

    enabled: {
      type: Boolean,
      required: true,
      default: true,
    },

    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      default: null,
      index: true,
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved", // Existing or admin-created services are approved by default
      index: true,
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    createdAt: {
      type: Number,
      required: true,
      default: () => Date.now(),
    },
  }
);

const AddonService = mongoose.model("AddonService", addonServiceSchema);

export default AddonService;