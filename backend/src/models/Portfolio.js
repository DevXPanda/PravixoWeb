import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    cloudinaryPublicId: {
      type: String,
      default: "",
    },

    mediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },

    type: {
      type: String,
      enum: ["post", "reel", "story", "video"],
      default: "post",
    },

    caption: {
      type: String,
      default: "",
      trim: true,
    },

    brandTag: {
      type: String,
      default: "",
      trim: true,
    },

    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    sharesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    aspectRatio: {
      type: String,
      enum: ["1:1", "9:16", "4:5", "16:9"],
      default: "1:1",
    },

    likedByUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        userName: {
          type: String,
          default: "Anonymous",
        },
        userAvatar: {
          type: String,
          default: "",
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

portfolioSchema.index({
  profileId: 1,
  sortOrder: 1,
});

export default mongoose.model(
  "Portfolio",
  portfolioSchema
);