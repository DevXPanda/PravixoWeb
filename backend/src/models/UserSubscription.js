import mongoose from "mongoose";

const userSubscriptionSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPackage",
      required: true,
    },

    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionOffer",
    },

    startDate: {
      type: Number,
      required: true,
    },

    expiryDate: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled", "rejected"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserSubscription = mongoose.model(
  "UserSubscription",
  userSubscriptionSchema
);

export default UserSubscription;