import express from "express";
import { protect, adminProtect, optionalAuth } from "../middleware/auth.js";
import {
  createOffer,
  approveOffer,
  rejectOffer,
  getActiveOffers,
  getMyOffers,
  getAllOffersAdmin,
  deleteOffer,
} from "../controllers/offerController.js";

const router = express.Router();

// Active offers for sidebars / dashboards
router.get("/active", optionalAuth, getActiveOffers);

// Creator & Brand routes
router.post("/", protect, createOffer);
router.get("/mine/:profileId", protect, getMyOffers);

// Admin moderation routes
router.get("/admin/all", adminProtect, getAllOffersAdmin);
router.put("/:offerId/approve", adminProtect, approveOffer);
router.put("/:offerId/reject", adminProtect, rejectOffer);
router.delete("/:offerId", protect, deleteOffer);

export default router;
