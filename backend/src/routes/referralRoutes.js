import express from "express";
import { protect, optionalAuth } from "../middleware/auth.js";
import {
  getMyReferralDetails,
  getMyReferralStats,
  getMyReferralsList,
  validateReferralCode,
} from "../controllers/referralController.js";

const router = express.Router();

// Public validation
router.post("/validate", optionalAuth, validateReferralCode);

// Authenticated Creator routes
router.get("/my-referral", protect, getMyReferralDetails);
router.get("/stats", protect, getMyReferralStats);
router.get("/list", protect, getMyReferralsList);

export default router;
