import express from "express";

import {
  getByProfile,
  addImage,
  removeImage,
  toggleLike,
  addComment,
  deleteComment,
  updateItem,
} from "../controllers/portfoliocontroller.js";

import upload from "../middleware/upload.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Get all portfolio images
router.get(
  "/profile/:profileId",
  getByProfile
);

// Upload/add portfolio item (post/reel/story/video)
router.post(
  "/",
  upload.single("image"),
  addImage
);

// Toggle like on portfolio item
router.post(
  "/:id/like",
  optionalAuth,
  toggleLike
);

// Add comment to portfolio item
router.post(
  "/:id/comments",
  optionalAuth,
  addComment
);

// Delete comment on portfolio item
router.delete(
  "/:id/comments/:commentId",
  optionalAuth,
  deleteComment
);

// Update portfolio item
router.put(
  "/:id",
  updateItem
);

// Delete portfolio item
router.delete(
  "/:id",
  removeImage
);

export default router;