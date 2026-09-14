import mongoose from "mongoose";

import SubscriptionPackage from "../models/SubscriptionPackage.js";
import SubscriptionOffer from "../models/SubscriptionOffer.js";
import UserSubscription from "../models/UserSubscription.js";
import Profile from "../models/Profile.js";
import Notification from "../models/Notification.js";

// =====================================================
// GET SUBSCRIPTION PACKAGES
// GET /api/subscriptions/packages
// =====================================================

export const getPackages = async (req, res) => {
  try {
    const packages = await SubscriptionPackage.find({
      active: true,
    })
      .sort({ sortOrder: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (error) {
    console.error("Get subscription packages error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription packages.",
    });
  }
};

// =====================================================
// GET SUBSCRIPTION OFFERS
// GET /api/subscriptions/offers
// =====================================================

export const getOffers = async (req, res) => {
  try {
    const now = Date.now();

    const offers = await SubscriptionOffer.find({
      active: true,
      expiryDate: {
        $gt: now,
      },
    })
      .populate("packageId")
      .sort({ expiryDate: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: offers,
    });
  } catch (error) {
    console.error("Get subscription offers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription offers.",
    });
  }
};

// =====================================================
// GET USER SUBSCRIPTION
// GET /api/subscriptions/user/:profileId
// =====================================================

export const getUserSubscription = async (req, res) => {
  try {
    const { profileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID.",
      });
    }

    const [activeSubscription, pendingSubscription] = await Promise.all([
      UserSubscription.findOne({
        profileId,
        status: "active",
      })
        .populate("packageId")
        .populate("offerId")
        .sort({ createdAt: -1 })
        .lean(),
      UserSubscription.findOne({
        profileId,
        status: "pending",
      })
        .populate("packageId")
        .populate("offerId")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: activeSubscription,
      pending: pendingSubscription || null,
    });
  } catch (error) {
    console.error("Get user subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user subscription.",
    });
  }
};

// =====================================================
// CREATE SUBSCRIPTION (REQUEST UPGRADE - PENDING ADMIN APPROVAL)
// POST /api/subscriptions
// =====================================================

export const createSubscription = async (req, res) => {
  try {
    const {
      profileId,
      packageId,
      offerId,
    } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "Profile ID is required.",
      });
    }

    if (!packageId) {
      return res.status(400).json({
        success: false,
        message: "Package ID is required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(profileId) ||
      !mongoose.Types.ObjectId.isValid(packageId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID or package ID.",
      });
    }

    if (
      offerId &&
      !mongoose.Types.ObjectId.isValid(offerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid offer ID.",
      });
    }

    // -----------------------------
    // Check Profile
    // -----------------------------
    const profile = await Profile.findById(profileId).select("fullName role email handle avatarUrl");
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    // -----------------------------
    // Check package
    // -----------------------------

    const subscriptionPackage =
      await SubscriptionPackage.findOne({
        _id: packageId,
        active: true,
      });

    if (!subscriptionPackage) {
      return res.status(404).json({
        success: false,
        message: "Subscription package not found or inactive.",
      });
    }

    // Check if user already has an active subscription to this exact package
    const existingActive = await UserSubscription.findOne({
      profileId,
      status: "active",
      packageId,
    });
    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: `You are already subscribed to the ${subscriptionPackage.name} plan.`,
      });
    }

    // Check if user already has a pending upgrade request
    const existingPending = await UserSubscription.findOne({
      profileId,
      status: "pending",
    }).populate("packageId");

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: `You already have a pending upgrade request for ${existingPending.packageId?.name || "a package"}. Please wait for admin approval.`,
        data: existingPending,
      });
    }

    // -----------------------------
    // Check offer if provided
    // -----------------------------

    let offer = null;

    if (offerId) {
      offer = await SubscriptionOffer.findOne({
        _id: offerId,
        active: true,
        expiryDate: {
          $gt: Date.now(),
        },
      });

      if (!offer) {
        return res.status(404).json({
          success: false,
          message: "Subscription offer not found or expired.",
        });
      }

      if (
        offer.packageId.toString() !==
        packageId.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "The selected offer does not belong to this package.",
        });
      }
    }

    // -----------------------------
    // Calculate dates (to be activated on admin approval)
    // -----------------------------

    const startDate = Date.now();

    let expiryDate;

    const billingPeriod =
      subscriptionPackage.billingPeriod.toLowerCase();

    if (
      billingPeriod.includes("year") ||
      billingPeriod.includes("annual")
    ) {
      expiryDate =
        startDate +
        365 * 24 * 60 * 60 * 1000;
    } else if (
      billingPeriod.includes("month")
    ) {
      expiryDate =
        startDate +
        30 * 24 * 60 * 60 * 1000;
    } else if (
      billingPeriod.includes("week")
    ) {
      expiryDate =
        startDate +
        7 * 24 * 60 * 60 * 1000;
    } else if (
      billingPeriod.includes("day")
    ) {
      expiryDate =
        startDate +
        24 * 60 * 60 * 1000;
    } else {
      // Default = 30 days
      expiryDate =
        startDate +
        30 * 24 * 60 * 60 * 1000;
    }

    // -----------------------------
    // Create subscription with status: "pending"
    // -----------------------------

    const subscription =
      await UserSubscription.create({
        profileId,
        packageId,
        offerId: offer ? offer._id : undefined,
        startDate,
        expiryDate,
        status: "pending",
      });

    // -----------------------------
    // Notify Admins
    // -----------------------------
    try {
      const admins = await Profile.find({ role: "admin" }).select("_id").lean();
      const userTypeLabel = profile.role === "creator" ? "Creator" : profile.role === "brand" ? "Brand" : "User";
      const notifText = `${userTypeLabel} "${profile.fullName}" requested to upgrade to the "${subscriptionPackage.name}" plan (₹${subscriptionPackage.price}/${subscriptionPackage.billingPeriod}).`;

      for (const admin of admins) {
        await Notification.create({
          recipientId: admin._id,
          senderId: profile._id,
          type: "subscription_upgrade_requested",
          text: notifText,
          targetUrl: "/subscriptions",
          metadata: {
            subscriptionId: subscription._id,
            packageId: subscriptionPackage._id,
            packageName: subscriptionPackage.name,
            profileId: profile._id,
            profileName: profile.fullName,
            role: profile.role,
          },
          createdAt: Date.now(),
        });
      }
    } catch (notifErr) {
      console.error("Failed to create admin notification for subscription request:", notifErr);
    }

    // Populate response
    const populatedSubscription =
      await UserSubscription.findById(
        subscription._id
      )
        .populate("packageId")
        .populate("offerId")
        .lean();

    return res.status(201).json({
      success: true,
      message: "Upgrade request submitted successfully. Waiting for admin approval.",
      data: populatedSubscription,
    });
  } catch (error) {
    console.error("Create subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create subscription request.",
    });
  }
};

// =====================================================
// CANCEL SUBSCRIPTION
// PATCH /api/subscriptions/:subscriptionId/cancel
// =====================================================

export const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        subscriptionId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID.",
      });
    }

    const subscription =
      await UserSubscription.findById(
        subscriptionId
      );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found.",
      });
    }

    if (subscription.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Subscription is already cancelled.",
      });
    }

    subscription.status = "cancelled";

    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully.",
      data: subscription,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel subscription.",
    });
  }
};