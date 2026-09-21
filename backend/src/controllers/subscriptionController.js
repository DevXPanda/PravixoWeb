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
    let packages = await SubscriptionPackage.find({
      active: true,
    })
      .sort({ sortOrder: 1 })
      .lean();

    const defaultPackages = [
      {
        name: "Starter",
        price: 0,
        billingPeriod: "year",
        badge: "Free",
        features: [
          "Campaign Limits: 2/month",
          "Chat Access: Limited Basic Messages",
          "Support Tier: Standard Support",
          "Refer & Earn Income: 5%",
          "Standard Discovery Visibility"
        ],
        sortOrder: 1,
        active: true,
      },
      {
        name: "Pro",
        price: 999,
        billingPeriod: "year",
        badge: "3 Months Free Trial",
        features: [
          "Campaign Limits: 15/month",
          "Verified Blue Badge & Unlimited Chat",
          "Support Tier: Priority Support",
          "Refer & Earn Income: 7.5%",
          "Complimentary 3-Month Free Welcome for Creators",
          "High Discovery Visibility & Advanced Analytics"
        ],
        sortOrder: 2,
        active: true,
      },
      {
        name: "Elite",
        price: 1999,
        billingPeriod: "year",
        badge: "50% OFF",
        features: [
          "Campaign Limits: Unlimited Campaigns",
          "Elite Gold Badge & Unlimited Chat Access",
          "Support Tier: 24/7 VIP Priority",
          "Refer & Earn Income: 10% (Max Tier)",
          "1-on-1 Dedicated Account Manager",
          "Top Featured Placement in Brand Discovery",
          "Real-time Live Analytics & Export Reports"
        ],
        sortOrder: 3,
        active: true,
      },
    ];

    // If packages empty, seed standard Starter, Pro, Elite packages
    if (!packages || packages.length === 0) {
      await SubscriptionPackage.create(defaultPackages);
      packages = await SubscriptionPackage.find({ active: true }).sort({ sortOrder: 1 }).lean();
    } else {
      // Sync prices and features if they still hold legacy prices
      for (const defPkg of defaultPackages) {
        await SubscriptionPackage.updateOne(
          { name: new RegExp(`^${defPkg.name}$`, "i") },
          {
            $set: {
              price: defPkg.price,
              billingPeriod: defPkg.billingPeriod,
              badge: defPkg.badge,
              features: defPkg.features,
              sortOrder: defPkg.sortOrder,
              active: true,
            },
          }
        );
      }
      packages = await SubscriptionPackage.find({ active: true }).sort({ sortOrder: 1 }).lean();
    }

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

    let offers = await SubscriptionOffer.find({
      active: true,
      expiryDate: {
        $gt: now,
      },
    })
      .populate("packageId")
      .sort({ expiryDate: 1 })
      .lean();

    // If no active offer exists, create default 50% OFF promo on Elite package
    if (!offers || offers.length === 0) {
      const elitePkg = await SubscriptionPackage.findOne({ name: /^Elite$/i });
      if (elitePkg) {
        const promoExpiry = Date.now() + 90 * 24 * 60 * 60 * 1000; // 90 days validity
        await SubscriptionOffer.create({
          packageId: elitePkg._id,
          name: "Elite 50% OFF Launch Promo",
          description: "Get 50% discount on the Elite Annual Plan. Unlock unlimited campaigns & dedicated manager for just ₹999/year!",
          discountPercentage: 50,
          targetUsers: "both",
          expiryDate: promoExpiry,
          buttonText: "Claim 50% Off",
          active: true,
        });

        offers = await SubscriptionOffer.find({
          active: true,
          expiryDate: { $gt: now },
        })
          .populate("packageId")
          .sort({ expiryDate: 1 })
          .lean();
      }
    }

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

    let activeSubscription = await UserSubscription.findOne({
      profileId,
      status: "active",
    })
      .populate("packageId")
      .populate("offerId")
      .sort({ createdAt: -1 });

    // Check if subscription has expired (e.g. 3-month trial or 1-year plan elapsed)
    if (activeSubscription && activeSubscription.expiryDate && activeSubscription.expiryDate < Date.now()) {
      activeSubscription.status = "expired";
      await activeSubscription.save();
      activeSubscription = null; // Reverts back to Starter plan automatically
    }

    const pendingSubscription = await UserSubscription.findOne({
      profileId,
      status: "pending",
    })
      .populate("packageId")
      .populate("offerId")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: activeSubscription ? (activeSubscription.toObject ? activeSubscription.toObject() : activeSubscription) : null,
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