import mongoose from "mongoose";

const subscriptionPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
  },

    price: {
      type: Number,
      required: true,
    },

    originalPrice: {
      type: Number,
      default: 0,
    },

    billingPeriod: {
      type: String,
      required: true,
      trim: true,
    },

    badge: {
      type: String,
      required: true,
      trim: true,
    },

    features: {
      type: [String],
      required: true,
    },

    active: {
      type: Boolean,
      required: true,
      default: true,
    },

    sortOrder: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const SubscriptionPackage = mongoose.model(
  "SubscriptionPackage",
  subscriptionPackageSchema
);

export default SubscriptionPackage;