import mongoose from "mongoose";
import crypto from "crypto";

import Profile from "../models/Profile.js";
import Review from "../models/Review.js";
import Otp from "../models/Otp.js";

// =====================================================
// LIST PROFILES
// Convex: profiles.list
// =====================================================

export const listProfiles = async (req, res) => {
  try {
    const { search, category, role } = req.query;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (category && category !== "All") {
      filter.category = { $regex: category.trim(), $options: "i" };
    }

    // Always exclude soft-deleted and suspended profiles
    filter.isDeleted = { $ne: true };
    filter.isSuspended = { $ne: true };
    filter.email = { $not: /@pravixo\.test|@test\.com/i };

    let profiles = await Profile.find(filter).sort({ createdAt: -1 }).lean();

    // Filter out dummy/test profile names
    profiles = profiles.filter(
      (p) =>
        !/task20|impostor|suspended|test brand|dummy|alice referrer|bob creator|charlie creator/i.test(
          p.fullName || ""
        )
    );

    // Search fullName, handle and category
    if (search) {
      const s = search.toLowerCase().trim();

      profiles = profiles.filter(
        (profile) =>
          profile.fullName?.toLowerCase().includes(s) ||
          profile.handle?.toLowerCase().includes(s) ||
          profile.category?.toLowerCase().includes(s)
      );
    }

    const results = await Promise.all(
      profiles.map(async (profile) => {
        const reviews = await Review.find({
          creatorId: profile._id,
          visible: true,
        }).lean();

        if (reviews.length === 0) {
          return {
            ...profile,
            rating: 5.0,
            reviewsCount: 0,
          };
        }

        const totalRating = reviews.reduce(
          (sum, review) => sum + Number(review.rating || 0),
          0
        );

        const rating =
          Math.round(
            (totalRating / reviews.length) * 10
          ) / 10;

        return {
          ...profile,
          rating,
          reviewsCount: reviews.length,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("List profiles error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profiles.",
    });
  }
};

// =====================================================
// GET PROFILE BY USER ID
// Convex: profiles.getByUserId
// =====================================================

export const getByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const profile = await Profile.findOne({
      userId,
    }).lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    let brandCampaigns = [];
    let hiredCount = 0;
    if (profile.role === "brand") {
      const Campaign = mongoose.model("Campaign");
      const Connection = mongoose.model("Connection");
      brandCampaigns = await Campaign.find({
        brandId: profile._id,
      }).sort({ createdAt: -1 }).lean();

      hiredCount = await Connection.countDocuments({
        brandId: profile._id,
        status: { $in: ["accepted", "completed"] },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...profile,
        campaigns: brandCampaigns,
        campaignsCount: brandCampaigns.length,
        hiredCount,
      },
    });
  } catch (error) {
    console.error("Get profile by user ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
    });
  }
};

// =====================================================
// GET PROFILE BY ID
// Convex: profiles.getById
// =====================================================

export const getById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID.",
      });
    }

    const profile = await Profile.findById(id).lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    // If profile is a brand, attach live campaigns and counts
    let brandCampaigns = [];
    let hiredCount = 0;
    if (profile.role === "brand") {
      const Campaign = mongoose.model("Campaign");
      const Connection = mongoose.model("Connection");
      brandCampaigns = await Campaign.find({
        brandId: profile._id,
      }).sort({ createdAt: -1 }).lean();

      hiredCount = await Connection.countDocuments({
        brandId: profile._id,
        status: { $in: ["accepted", "completed"] },
      });
    }

    const reviews = await Review.find({
      creatorId: profile._id,
      visible: true,
    }).lean();

    const rating =
      reviews.length === 0
        ? 5.0
        : Math.round(
            (
              reviews.reduce(
                (sum, review) =>
                  sum + Number(review.rating || 0),
                0
              ) / reviews.length
            ) * 10
          ) / 10;

    return res.status(200).json({
      success: true,
      data: {
        ...profile,
        campaigns: brandCampaigns,
        campaignsCount: brandCampaigns.length,
        hiredCount,
        rating,
        reviewsCount: reviews.length,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
    });
  }
};

// =====================================================
// CREATE PROFILE
// Convex: profiles.create
// =====================================================

export const createProfile = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      role,
      isLogin,
      email,
      otpCode,
    } = req.body;

    // Basic validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    if (!role || !["creator", "brand"].includes(role)) {
      return res.status(400).json({
        success: false,
        message:
          "Role must be either creator or brand.",
      });
    }

    // -------------------------------------------------
    // CHECK EXISTING PROFILE
    // -------------------------------------------------

    const existing = await Profile.findOne({
      userId,
    });

    // -------------------------------------------------
    // LOGIN FLOW
    // Convex:
    // if (args.isLogin)
    // -------------------------------------------------

    if (isLogin) {
      if (!existing) {
        return res.status(404).json({
          success: false,
          message:
            "This email is not registered. Please create an account first.",
        });
      }

      if (existing.role !== role) {
        return res.status(400).json({
          success: false,
          message:
            `This account is registered as a ${existing.role}. ` +
            `Please log in as a ${existing.role}.`,
        });
      }

      return res.status(200).json({
        success: true,
        data: existing,
      });
    }

    // -------------------------------------------------
    // SIGNUP - PROFILE ALREADY EXISTS
    // -------------------------------------------------

    if (existing) {
      return res.status(200).json({
        success: true,
        data: existing,
      });
    }

    // -------------------------------------------------
    // SIGNUP REQUIRES EMAIL + OTP
    // -------------------------------------------------

    if (!email || !otpCode) {
      return res.status(400).json({
        success: false,
        message:
          "Email and verification code are required for registration.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // -------------------------------------------------
    // FIND OTP
    // -------------------------------------------------

    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message:
          "No verification code request was found for this email.",
      });
    }

    // -------------------------------------------------
    // CHECK OTP EXPIRY
    // -------------------------------------------------

    if (
      Date.now() >
      new Date(otpRecord.expiresAt).getTime()
    ) {
      await Otp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        success: false,
        message:
          "Verification code has expired. Please request a new one.",
      });
    }

    // -------------------------------------------------
    // HASH ENTERED OTP
    // -------------------------------------------------

    const inputHash = crypto
      .createHash("sha256")
      .update(String(otpCode))
      .digest("hex");

    // -------------------------------------------------
    // VERIFY OTP
    // -------------------------------------------------

    if (inputHash !== otpRecord.codeHash) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid verification code. Please try again.",
      });
    }

    // -------------------------------------------------
    // DELETE OTP AFTER SUCCESSFUL VERIFICATION
    // Prevent OTP reuse
    // -------------------------------------------------

    await Otp.deleteOne({
      _id: otpRecord._id,
    });

    // -------------------------------------------------
    // CREATE PROFILE
    // -------------------------------------------------

    const profile = await Profile.create({
      userId,
      fullName,
      role,
      email: normalizedEmail,
      profileViews: 0,
      clicks: 0,
      bookings: 0,
    });

    return res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Create profile error:", error);

    // Duplicate userId
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A profile already exists for this user.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to create profile.",
    });
  }
};

// =====================================================
// UPDATE PROFILE
// Convex: profiles.update
// =====================================================

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID.",
      });
    }

    // Fields allowed by Convex profiles.update
    const allowedFields = [
      "fullName",
      "handle",
      "gender",
      "phone",
      "category",
      "location",
      "bio",
      "startingPrice",
      "avatarUrl",
      "coverUrl",

      // Stats
      "profileViews",
      "clicks",
      "bookings",

      // Instagram
      "instagramHandle",
      "instagramFollowers",

      // Facebook
      "facebookHandle",
      "facebookFollowers",

      // LinkedIn
      "linkedinHandle",
      "linkedinFollowers",

      // YouTube
      "youtubeHandle",
      "youtubeFollowers",

      // Quora
      "quoraHandle",
      "quoraFollowers",

      // Twitter
      "twitterHandle",
      "twitterFollowers",

      // Brand preferences
      "prefNiches",
      "prefBudget",
      "prefReach",
      "prefRegions",

      "website",
      "companySize",
      "isBarterAllowed",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update.",
      });
    }

    const profile =
      await Profile.findByIdAndUpdate(
        id,
        updates,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to update profile.",
    });
  }
};

// =====================================================
// UPLOAD AVATAR IMAGE
// POST /api/profiles/:id/avatar
// =====================================================
export const uploadAvatar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Avatar image file is required.",
      });
    }

    const getFileUrl = (file) => {
      if (!file) return null;
      if (file.path && (file.path.startsWith("http://") || file.path.startsWith("https://"))) {
        return file.path;
      }
      return `/uploads/${file.filename}`;
    };

    const avatarUrl = getFileUrl(req.file);

    const profile = await Profile.findByIdAndUpdate(
      id,
      { avatarUrl },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully.",
      avatarUrl,
      data: profile,
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload avatar.",
      error: error.message,
    });
  }
};

// =====================================================
// UPLOAD COVER IMAGE
// POST /api/profiles/:id/cover
// =====================================================
export const uploadCover = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Cover image file is required.",
      });
    }

    const getFileUrl = (file) => {
      if (!file) return null;
      if (file.path && (file.path.startsWith("http://") || file.path.startsWith("https://"))) {
        return file.path;
      }
      return `/uploads/${file.filename}`;
    };

    const coverUrl = getFileUrl(req.file);

    const profile = await Profile.findByIdAndUpdate(
      id,
      { coverUrl },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cover photo updated successfully.",
      coverUrl,
      data: profile,
    });
  } catch (error) {
    console.error("Upload cover error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload cover image.",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE / RESET AVATAR
// DELETE /api/profiles/:id/avatar
// =====================================================
export const deleteAvatar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID.",
      });
    }

    const profile = await Profile.findByIdAndUpdate(
      id,
      { avatarUrl: "" },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Avatar removed successfully.",
      data: profile,
    });
  } catch (error) {
    console.error("Delete avatar error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove avatar.",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE / RESET COVER BANNER
// DELETE /api/profiles/:id/cover
// =====================================================
export const deleteCover = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID.",
      });
    }

    const profile = await Profile.findByIdAndUpdate(
      id,
      { coverUrl: "" },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cover banner removed successfully.",
      data: profile,
    });
  } catch (error) {
    console.error("Delete cover error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove cover banner.",
      error: error.message,
    });
  }
};

// =====================================================
// UPLOAD KYC DOCUMENTS
// POST /api/profiles/:id/kyc-documents
// =====================================================
export const uploadKycDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID.",
      });
    }

    const getFileUrl = (file) => {
      if (!file) return null;
      if (file.path && (file.path.startsWith("http://") || file.path.startsWith("https://"))) {
        return file.path;
      }
      return `/uploads/${file.filename}`;
    };

    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    const updates = {};

    if (req.files) {
      if (req.files.aadhar && req.files.aadhar[0]) {
        updates.aadharUrl = getFileUrl(req.files.aadhar[0]);
        updates.aadharStorageId = req.files.aadhar[0].filename;
      }
      if (req.files.pan && req.files.pan[0]) {
        updates.panUrl = getFileUrl(req.files.pan[0]);
        updates.panStorageId = req.files.pan[0].filename;
      }
      if (req.files.gstCertificate && req.files.gstCertificate[0]) {
        updates.gstCertificateUrl = getFileUrl(req.files.gstCertificate[0]);
        updates.gstCertificateStorageId = req.files.gstCertificate[0].filename;
      }
    }

    if (req.body.gstNumber) {
      updates.gstNumber = req.body.gstNumber;
    }

    const updatedProfile = await Profile.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "KYC documents uploaded successfully for verification.",
      data: updatedProfile,
    });

  } catch (error) {
    console.error("Upload KYC documents error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload KYC documents.",
      error: error.message,
    });
  }
};

// =====================================================
// UNSUBSCRIBE EMAIL NOTIFICATIONS
// POST or GET /api/profiles/unsubscribe
// =====================================================
export const unsubscribeEmailNotifications = async (req, res) => {
  try {
    const { email, token } = req.query.email ? req.query : req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to unsubscribe.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const query = { email: normalizedEmail };

    if (token) {
      query.$or = [{ unsubscribeToken: token }, { _id: mongoose.Types.ObjectId.isValid(token) ? token : null }];
    }

    const profile = await Profile.findOneAndUpdate(
      query,
      { $set: { emailNotificationsEnabled: false } },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found or invalid token.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "You have been successfully unsubscribed from campaign email notifications.",
      data: { email: profile.email, emailNotificationsEnabled: false },
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process unsubscribe request.",
      error: error.message,
    });
  }
};

// =====================================================
// TOGGLE EMAIL NOTIFICATIONS PREFERENCE (Authenticated)
// PATCH /api/profiles/email-notifications
// =====================================================
export const toggleEmailNotifications = async (req, res) => {
  try {
    const profileId = req.user?._id || req.user?.profileId;
    const { enabled } = req.body;

    if (!profileId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const profile = await Profile.findByIdAndUpdate(
      profileId,
      { $set: { emailNotificationsEnabled: Boolean(enabled) } },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Campaign email notifications have been ${enabled ? "enabled" : "disabled"}.`,
      data: { emailNotificationsEnabled: profile.emailNotificationsEnabled },
    });
  } catch (error) {
    console.error("Toggle email notifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notification settings.",
      error: error.message,
    });
  }
};