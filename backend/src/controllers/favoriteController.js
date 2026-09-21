import mongoose from "mongoose";
import Favorite from "../models/Favorite.js";
import Profile from "../models/Profile.js";

export const listFavorites = async (req, res) => {
  try {
    const { brandId } = req.query;

    if (!brandId) {
      return res.status(400).json({
        success: false,
        message: "brandId is required.",
      });
    }

    const favorites = await Favorite.find({ brandId });

    // Populate creator profiles
    const populatedFavorites = await Promise.all(
      favorites.map(async (fav) => {
        let creatorData = null;
        if (mongoose.Types.ObjectId.isValid(fav.creatorId)) {
          const profile = await Profile.findById(fav.creatorId).select("fullName name avatar avatarUrl category followers gender role");
          if (profile) {
            creatorData = {
              name: profile.fullName || profile.name,
              avatar: profile.avatarUrl || profile.avatar || null,
              avatarUrl: profile.avatarUrl || null,
              category: profile.category || "Creator",
              followers: profile.followers || "0",
              gender: profile.gender || "",
              role: profile.role || "creator",
            };
          }
        }
        
        return {
          id: fav.creatorId,
          isLive: !!creatorData,
          name: creatorData?.name || `Creator ${fav.creatorId.slice(0, 4)}`,
          avatar: creatorData?.avatar || null,
          avatarUrl: creatorData?.avatarUrl || null,
          category: creatorData?.category || "Creator",
          followers: creatorData?.followers || "10k+",
          gender: creatorData?.gender || "",
          role: creatorData?.role || "creator",
        };
      })
    );

    res.status(200).json({
      success: true,
      data: populatedFavorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch favorites.",
    });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { brandId, creatorId } = req.body;

    if (!brandId || !creatorId) {
      return res.status(400).json({
        success: false,
        message: "brandId and creatorId are required.",
      });
    }

    const existing = await Favorite.findOne({
      brandId,
      creatorId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Creator is already in favorites.",
      });
    }

    const favorite = await Favorite.create({
      brandId,
      creatorId,
    });

    res.status(201).json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add favorite.",
    });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { brandId, creatorId } = req.body;

    const favorite = await Favorite.findOneAndDelete({
      brandId,
      creatorId,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Favorite removed successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove favorite.",
    });
  }
};

export const checkFavorite = async (req, res) => {
  try {
    const { brandId, creatorId } = req.query;

    if (!brandId || !creatorId) {
      return res.status(400).json({
        success: false,
        message: "brandId and creatorId are required.",
      });
    }

    const favorite = await Favorite.findOne({
      brandId,
      creatorId,
    });

    res.status(200).json({
      success: true,
      data: {
        isFavorite: !!favorite,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check favorite.",
    });
  }
};