import mongoose from "mongoose";
import Portfolio from "../models/Portfolio.js";
import cloudinary from "../config/cloudinary.js";

// =====================================================
// GET PORTFOLIO BY PROFILE
// Convex: getByProfile
// =====================================================

export const getByProfile = async (req, res) => {
  try {
    const { profileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID.",
      });
    }

    const images = await Portfolio.find({
      profileId,
    })
      .sort({ sortOrder: 1 })
      .lean();

    const results = images.map((image) => ({
      ...image,
      url: image.imageUrl,
    }));

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Get portfolio error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch portfolio.",
    });
  }
};

// =====================================================
// ADD PORTFOLIO IMAGE
// Convex: addImage
//
// Cloudinary upload is handled through multer.
// =====================================================

export const addImage = async (req, res) => {
  try {
    const {
      profileId,
      sortOrder,
      type,
      caption,
      brandTag,
      likesCount,
      viewsCount,
      aspectRatio,
      mediaType,
    } = req.body;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "Profile ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Portfolio media file is required.",
      });
    }

    const getFileUrl = (file) => {
      if (!file) return null;
      if (file.path && (file.path.startsWith("http://") || file.path.startsWith("https://"))) {
        return file.path;
      }
      return `/uploads/${file.filename}`;
    };

    // Determine media type from mime or file extension
    const mime = req.file.mimetype || "";
    const isVideo = mime.startsWith("video/") || /\.(mp4|mov|avi|webm|mkv)$/i.test(req.file.originalname || "");
    const finalMediaType = mediaType || (isVideo ? "video" : "image");
    const finalType = type || (finalMediaType === "video" ? "reel" : "post");

    const portfolioImage = await Portfolio.create({
      profileId,
      imageUrl: getFileUrl(req.file),
      cloudinaryPublicId: req.file.filename || "",
      mediaType: finalMediaType,
      type: finalType,
      caption: caption || "",
      brandTag: brandTag || "",
      likesCount: Number(likesCount) || 0,
      viewsCount: Number(viewsCount) || (finalType === "reel" ? Math.floor(Math.random() * 2000) + 500 : 0),
      commentsCount: 0,
      sharesCount: 0,
      aspectRatio: aspectRatio || (finalType === "reel" || finalType === "story" ? "9:16" : "1:1"),
      sortOrder: Number(sortOrder) || 0,
    });

    return res.status(201).json({
      success: true,
      data: {
        ...portfolioImage.toObject(),
        url: portfolioImage.imageUrl,
      },
    });
  } catch (error) {
    console.error("Add portfolio image error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add portfolio image.",
    });
  }
};

// =====================================================
// TOGGLE LIKE ON PORTFOLIO ITEM
// =====================================================
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid portfolio ID.",
      });
    }

    const item = await Portfolio.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Portfolio item not found.",
      });
    }

    let isLiked = false;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const userIdx = item.likedByUsers.findIndex((u) => u.toString() === userId.toString());
      if (userIdx > -1) {
        item.likedByUsers.splice(userIdx, 1);
        item.likesCount = Math.max(0, (item.likesCount || 1) - 1);
        isLiked = false;
      } else {
        item.likedByUsers.push(userObjectId);
        item.likesCount = (item.likesCount || 0) + 1;
        isLiked = true;
      }
    } else {
      // Guest like increment
      item.likesCount = (item.likesCount || 0) + 1;
      isLiked = true;
    }

    await item.save();

    return res.status(200).json({
      success: true,
      data: {
        likesCount: item.likesCount,
        isLiked,
      },
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update like status.",
    });
  }
};

// =====================================================
// ADD COMMENT ON PORTFOLIO ITEM
// =====================================================
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, userName, userAvatar } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid portfolio ID.",
      });
    }

    const item = await Portfolio.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Portfolio item not found.",
      });
    }

    const newComment = {
      userId: userId && mongoose.Types.ObjectId.isValid(userId) ? userId : undefined,
      userName: userName || (req.user?.name || req.user?.fullName || "Pravixo User"),
      userAvatar: userAvatar || (req.user?.avatar || req.user?.avatarUrl || ""),
      text: text.trim(),
      createdAt: new Date(),
    };

    item.comments.push(newComment);
    item.commentsCount = item.comments.length;
    await item.save();

    return res.status(201).json({
      success: true,
      data: item.comments,
      commentsCount: item.commentsCount,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to post comment.",
    });
  }
};

// =====================================================
// UPDATE PORTFOLIO ITEM
// =====================================================
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, brandTag, type, aspectRatio } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid portfolio ID.",
      });
    }

    const item = await Portfolio.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Portfolio item not found.",
      });
    }

    if (caption !== undefined) item.caption = caption;
    if (brandTag !== undefined) item.brandTag = brandTag;
    if (type !== undefined) item.type = type;
    if (aspectRatio !== undefined) item.aspectRatio = aspectRatio;

    await item.save();

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Update portfolio item error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update portfolio item.",
    });
  }
};

// =====================================================
// REMOVE PORTFOLIO IMAGE
// Convex: removeImage
// =====================================================

export const removeImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid portfolio image ID.",
      });
    }

    const image = await Portfolio.findById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Portfolio image not found.",
      });
    }

    // Delete from Cloudinary if set
    if (image.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(
          image.cloudinaryPublicId,
          {
            resource_type: image.mediaType === "video" ? "video" : "image",
          }
        );
      } catch (err) {
        console.warn("Cloudinary delete ignored:", err.message);
      }
    }

    // Delete from MongoDB
    await Portfolio.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Portfolio item removed successfully.",
    });
  } catch (error) {
    console.error(
      "Remove portfolio image error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to remove portfolio image.",
    });
  }
};