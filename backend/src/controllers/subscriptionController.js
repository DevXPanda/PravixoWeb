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
    const roleQuery = (req.query.role || "").toLowerCase();

    // Default Brand Add-on Services Packages (Basic, Pro, Elite)
    const defaultBrandPackages = [
      {
        name: "Basic",
        price: 5000,
        originalPrice: 10000,
        billingPeriod: "month",
        badge: "50% OFF",
        targetRole: "brand",
        features: [
          "5 Verified Creators Included",
          "Creator Communication & Shortlisting on Brand's behalf",
          "Creative Guidelines & Video Direction Strategy",
          "Milestone & Work Status Quality Checks",
          "Follow-up Analytics & Performance Tracking",
          "Dedicated Campaign Assistance",
        ],
        sortOrder: 1,
        active: true,
      },
      {
        name: "Pro",
        price: 10000,
        originalPrice: 20000,
        billingPeriod: "month",
        badge: "50% OFF POPULAR",
        targetRole: "brand",
        features: [
          "15 Verified Creators Included",
          "End-to-End Creator Outreach & Contract Negotiations",
          "Custom Creative Brief & Script Supervision",
          "Real-time Work Status & Deliverable Review",
          "In-depth Follow-up Analytics & ROI Reporting",
          "Escrow Milestone Payment Security",
          "Priority Brand Support",
        ],
        sortOrder: 2,
        active: true,
      },
      {
        name: "Elite",
        price: 25000,
        originalPrice: 50000,
        billingPeriod: "month",
        badge: "50% OFF ELITE",
        targetRole: "brand",
        features: [
          "50 Verified Creators Included",
          "Full-Service Influencer Management & VIP Shortlisting",
          "Custom Storyboards, Hook & Video Production Guidelines",
          "Live Work Status Monitoring & Multi-tier Quality Audits",
          "Advanced Follow-up Analytics, Heatmaps & Full Report Export",
          "1-on-1 Dedicated Campaign Account Manager",
          "24/7 VIP Priority Support & Legal Escrow Protection",
        ],
        sortOrder: 3,
        active: true,
      },
    ];

    // Default Creator Packages (Basic, Pro, Elite)
    const defaultCreatorPackages = [
      {
        name: "Basic",
        price: 0,
        originalPrice: 0,
        billingPeriod: "free",
        badge: "Free Starter",
        targetRole: "creator",
        features: [
          "Creator Portfolio & Media Kit",
          "Apply up to 5 Campaigns/month",
          "Standard Discovery Listing",
          "5% Tiered Referral Commission",
          "Direct Brand Chat & Collaboration Invitations",
        ],
        sortOrder: 1,
        active: true,
      },
      {
        name: "Pro",
        price: 999,
        originalPrice: 1999,
        billingPeriod: "month",
        badge: "Popular (3 Months Free Trial)",
        targetRole: "creator",
        features: [
          "Verified Blue Tick Badge on Profile & Media Kit",
          "Unlimited Campaign Applications & Priority Bids",
          "7.5% Tiered Referral Commission Income",
          "Featured Top Search Ranking on Brand Explore",
          "Advanced Performance & Analytics Insights",
          "Direct Escrow Payout Protection",
        ],
        sortOrder: 2,
        active: true,
      },
      {
        name: "Elite",
        price: 1999,
        originalPrice: 3999,
        billingPeriod: "month",
        badge: "50% OFF ELITE",
        targetRole: "creator",
        features: [
          "VIP Gold Creator Badge & Spotlight Top Placement",
          "Dedicated Talent Manager & Pitch Assistance",
          "10% Maximum Tiered Referral Commission",
          "Exclusive Direct Brand Invitation Deal Flow",
          "Instant Wallet Payouts & Zero Escrow Hold",
          "24/7 Priority Support",
        ],
        sortOrder: 3,
        active: true,
      },
    ];

    // Wipe any messy duplicates or out-of-sync docs
    const existing = await SubscriptionPackage.find().lean();
    if (!existing || existing.length === 0 || existing.length > 6) {
      await SubscriptionPackage.deleteMany({});
      await SubscriptionPackage.create([...defaultBrandPackages, ...defaultCreatorPackages]);
    } else {
      // Upsert each cleanly
      for (const bPkg of defaultBrandPackages) {
        await SubscriptionPackage.updateOne(
          { name: bPkg.name, targetRole: "brand" },
          { $set: bPkg },
          { upsert: true }
        );
      }
      for (const cPkg of defaultCreatorPackages) {
        await SubscriptionPackage.updateOne(
          { name: cPkg.name, targetRole: "creator" },
          { $set: cPkg },
          { upsert: true }
        );
      }
      // Remove any unwanted remnants with price 5000 under creator or non-conforming
      await SubscriptionPackage.deleteMany({
        $and: [
          { targetRole: { $nin: ["brand", "creator"] } },
          { name: { $nin: ["Basic", "Pro", "Elite"] } },
        ],
      });
    }

    const filter = { active: true };
    if (roleQuery === "brand" || roleQuery === "customer") {
      filter.targetRole = "brand";
    } else if (roleQuery === "creator" || roleQuery === "influencer") {
      filter.targetRole = "creator";
    }

    const packages = await SubscriptionPackage.find(filter)
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

    // Clear any legacy pending subscription requests so users can directly upgrade via payment gateway
    await UserSubscription.updateMany(
      { profileId, status: "pending" },
      { $set: { status: "cancelled" } }
    );

    return res.status(200).json({
      success: true,
      data: activeSubscription ? (activeSubscription.toObject ? activeSubscription.toObject() : activeSubscription) : null,
      pending: null,
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
// =====================================================
// INITIATE SUBSCRIPTION RAZORPAY ORDER
// POST /api/subscriptions/order
// =====================================================

export const createSubscriptionOrder = async (req, res) => {
  try {
    const { profileId, packageId, offerId } = req.body;

    if (!profileId || !packageId) {
      return res.status(400).json({
        success: false,
        message: "Profile ID and Package ID are required.",
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

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    const pkg = await SubscriptionPackage.findOne({ _id: packageId, active: true });
    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: "Subscription package not found or inactive.",
      });
    }

    let finalPrice = Number(pkg.price);

    // Apply offer discount if available
    let appliedOffer = null;
    if (offerId && mongoose.Types.ObjectId.isValid(offerId)) {
      appliedOffer = await SubscriptionOffer.findOne({
        _id: offerId,
        active: true,
        expiryDate: { $gt: Date.now() },
      });
      if (appliedOffer && appliedOffer.discountPercentage) {
        finalPrice = Math.round(finalPrice * (1 - appliedOffer.discountPercentage / 100));
      }
    }

    const receiptId = `SUB-${Date.now()}-${profile._id.toString().slice(-4).toUpperCase()}`;

    // Import createOrder dynamically or use paymentServices
    const { createOrder } = await import("../services/paymentServices.js");
    const order = await createOrder({
      amount: Math.max(1, finalPrice),
      currency: "INR",
      receiptId,
    });

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency || "INR",
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
        package: {
          id: pkg._id,
          name: pkg.name,
          price: finalPrice,
          billingPeriod: pkg.billingPeriod,
        },
        offerId: appliedOffer?._id || undefined,
      },
    });
  } catch (error) {
    console.error("Create subscription order error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to initiate payment gateway for subscription.",
    });
  }
};

// =====================================================
// VERIFY SUBSCRIPTION PAYMENT & DIRECT ACTIVATION
// POST /api/subscriptions/verify
// =====================================================

export const verifySubscriptionPayment = async (req, res) => {
  try {
    const {
      profileId,
      packageId,
      offerId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!profileId || !packageId) {
      return res.status(400).json({
        success: false,
        message: "Profile ID and Package ID are required.",
      });
    }

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    const pkg = await SubscriptionPackage.findById(packageId);
    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: "Subscription package not found.",
      });
    }

    // Optional signature verification
    const { verifySignature } = await import("../services/paymentServices.js");
    if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const isValid = verifySignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      });
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Payment signature verification failed.",
        });
      }
    }

    // Calculate duration
    const startDate = Date.now();
    let expiryDate;
    const billingPeriod = (pkg.billingPeriod || "month").toLowerCase();

    if (billingPeriod.includes("year") || billingPeriod.includes("annual")) {
      expiryDate = startDate + 365 * 24 * 60 * 60 * 1000;
    } else if (billingPeriod.includes("month")) {
      expiryDate = startDate + 30 * 24 * 60 * 60 * 1000;
    } else if (billingPeriod.includes("week")) {
      expiryDate = startDate + 7 * 24 * 60 * 60 * 1000;
    } else {
      expiryDate = startDate + 30 * 24 * 60 * 60 * 1000;
    }

    // Deactivate previous active subscriptions
    await UserSubscription.updateMany(
      { profileId, status: "active" },
      { $set: { status: "expired" } }
    );

    // Create activated subscription directly
    const subscription = await UserSubscription.create({
      profileId,
      packageId: pkg._id,
      offerId: offerId || undefined,
      startDate,
      expiryDate,
      status: "active",
      amountPaid: Number(pkg.price),
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
      razorpaySignature: razorpaySignature || null,
    });

    // Notify Admins about plan purchase
    try {
      const admins = await Profile.find({ role: "admin" }).select("_id").lean();
      const userTypeLabel = profile.role === "creator" ? "Creator" : profile.role === "brand" ? "Brand" : "User";
      const notifText = `🎉 ${userTypeLabel} "${profile.fullName}" purchased the "${pkg.name}" plan (₹${pkg.price}/${pkg.billingPeriod}) via direct payment!`;

      for (const admin of admins) {
        await Notification.create({
          recipientId: admin._id,
          senderId: profile._id,
          type: "subscription_activated",
          text: notifText,
          targetUrl: "/subscriptions",
          metadata: {
            subscriptionId: subscription._id,
            packageId: pkg._id,
            packageName: pkg.name,
            profileId: profile._id,
            profileName: profile.fullName,
            role: profile.role,
            amountPaid: pkg.price,
            paymentId: razorpayPaymentId,
          },
          createdAt: Date.now(),
        });
      }
    } catch (notifErr) {
      console.error("Failed to notify admins of subscription purchase:", notifErr);
    }

    const populatedSub = await UserSubscription.findById(subscription._id)
      .populate("packageId")
      .populate("offerId")
      .lean();

    return res.status(200).json({
      success: true,
      message: `Congratulations! Your ${pkg.name} plan has been activated successfully.`,
      data: populatedSub,
    });
  } catch (error) {
    console.error("Verify subscription payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to activate subscription.",
    });
  }
};

// =====================================================
// CREATE SUBSCRIPTION (DIRECT ACTIVATION FALLBACK)
// POST /api/subscriptions
// =====================================================

export const createSubscription = async (req, res) => {
  try {
    const {
      profileId,
      packageId,
      offerId,
    } = req.body;

    if (!profileId || !packageId) {
      return res.status(400).json({
        success: false,
        message: "Profile ID and Package ID are required.",
      });
    }

    const profile = await Profile.findById(profileId).select("fullName role email handle avatarUrl");
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    const subscriptionPackage = await SubscriptionPackage.findOne({
      _id: packageId,
      active: true,
    });

    if (!subscriptionPackage) {
      return res.status(404).json({
        success: false,
        message: "Subscription package not found or inactive.",
      });
    }

    const startDate = Date.now();
    let expiryDate;
    const billingPeriod = (subscriptionPackage.billingPeriod || "month").toLowerCase();

    if (billingPeriod.includes("year") || billingPeriod.includes("annual")) {
      expiryDate = startDate + 365 * 24 * 60 * 60 * 1000;
    } else if (billingPeriod.includes("month")) {
      expiryDate = startDate + 30 * 24 * 60 * 60 * 1000;
    } else {
      expiryDate = startDate + 30 * 24 * 60 * 60 * 1000;
    }

    // Deactivate previous active subscriptions
    await UserSubscription.updateMany(
      { profileId, status: "active" },
      { $set: { status: "expired" } }
    );

    // Direct active creation
    const subscription = await UserSubscription.create({
      profileId,
      packageId,
      offerId: offerId || undefined,
      startDate,
      expiryDate,
      status: "active",
      amountPaid: Number(subscriptionPackage.price),
    });

    // Notify Admins
    try {
      const admins = await Profile.find({ role: "admin" }).select("_id").lean();
      const userTypeLabel = profile.role === "creator" ? "Creator" : profile.role === "brand" ? "Brand" : "User";
      const notifText = `🎉 ${userTypeLabel} "${profile.fullName}" activated the "${subscriptionPackage.name}" plan (₹${subscriptionPackage.price}/${subscriptionPackage.billingPeriod}).`;

      for (const admin of admins) {
        await Notification.create({
          recipientId: admin._id,
          senderId: profile._id,
          type: "subscription_activated",
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
      console.error("Failed to create admin notification:", notifErr);
    }

    const populatedSubscription = await UserSubscription.findById(subscription._id)
      .populate("packageId")
      .populate("offerId")
      .lean();

    return res.status(201).json({
      success: true,
      message: `Your ${subscriptionPackage.name} plan is now active!`,
      data: populatedSubscription,
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create subscription.",
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