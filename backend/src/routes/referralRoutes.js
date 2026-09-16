import express from "express";
import { protect, optionalAuth } from "../middleware/auth.js";
import {
  getMyReferralDetails,
  getMyReferralStats,
  getMyReferralsList,
  validateReferralCode,
  getMyReferralCode,
  redeemReferralCode,
  getReferralEarnings,
} from "../controllers/referralController.js";

const router = express.Router();

// New Refer & Earn API endpoints
router.get("/my-code", protect, getMyReferralCode);
router.post("/redeem", protect, redeemReferralCode);
router.get("/earnings", protect, getReferralEarnings);

// Public validation
router.post("/validate", optionalAuth, validateReferralCode);

// Authenticated Creator routes
router.get("/my-referral", protect, getMyReferralDetails);
router.get("/stats", protect, getMyReferralStats);
router.get("/list", protect, getMyReferralsList);

export default router;
