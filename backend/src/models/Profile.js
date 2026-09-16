import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["creator", "brand", "admin"],
      required: true,
    },

    handle: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    startingPrice: {
      type: Number,
      default: 0,
    },

    avatarUrl: {
      type: String,
      default: "",
    },

    coverUrl: {
      type: String,
      default: "",
    },

    profileViews: {
      type: Number,
      default: 0,
    },

    clicks: {
      type: Number,
      default: 0,
    },

    bookings: {
      type: Number,
      default: 0,
    },

    instagramHandle: {
      type: String,
      default: "",
    },

    instagramFollowers: {
      type: Number,
      default: 0,
    },

    facebookHandle: {
      type: String,
      default: "",
    },

    facebookFollowers: {
      type: Number,
      default: 0,
    },

    linkedinHandle: {
      type: String,
      default: "",
    },

    linkedinFollowers: {
      type: Number,
      default: 0,
    },

    youtubeHandle: {
      type: String,
      default: "",
    },

    youtubeFollowers: {
      type: Number,
      default: 0,
    },

    quoraHandle: {
      type: String,
      default: "",
    },

    quoraFollowers: {
      type: Number,
      default: 0,
    },

    twitterHandle: {
      type: String,
      default: "",
    },

    twitterFollowers: {
      type: Number,
      default: 0,
    },

    prefNiches: {
      type: String,
      default: "",
    },

    prefBudget: {
      type: String,
      default: "",
    },

    prefReach: {
      type: String,
      default: "",
    },

    prefRegions: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    companySize: {
      type: String,
      default: "",
    },

    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },

    isSuspended: {
      type: Boolean,
      default: false,
    },

    suspensionReason: {
      type: String,
      default: "",
    },

    suspendedUntil: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deleteReason: {
      type: String,
      default: "",
    },

    gstNumber: {
      type: String,
      default: "",
    },

    gstCertificateStorageId: {
      type: String,
      default: "",
    },

    gstCertificateUrl: {
      type: String,
      default: "",
    },

    aadharStorageId: {
      type: String,
      default: "",
    },

    panStorageId: {
      type: String,
      default: "",
    },

    aadharUrl: {
      type: String,
      default: "",
    },

    panUrl: {
      type: String,
      default: "",
    },

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },

    referral_code: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      default: null,
      index: true,
    },

    referred_by_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      default: null,
      index: true,
    },

    referred_at: {
      type: Date,
      default: null,
    },

    referralCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

profileSchema.index({ role: 1 });
profileSchema.index({ email: 1 });

profileSchema.index({
  fullName: "text",
  handle: "text",
  category: "text",
});

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;