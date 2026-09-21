import express from "express";

import {
  listProfiles,
  getByUserId,
  getById,
  createProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  uploadCover,
  deleteCover,
  uploadKycDocuments,
  unsubscribeEmailNotifications,
  toggleEmailNotifications,
} from "../controllers/profileController.js";

import {
  submitVerification,
  submitBrandVerification,
} from "../controllers/profileVerificationController.js";

import upload from "../middleware/upload.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/unsubscribe", unsubscribeEmailNotifications);
router.post("/unsubscribe", unsubscribeEmailNotifications);
router.patch("/email-notifications", protect, toggleEmailNotifications);
router.get("/", listProfiles);
router.get("/user/:userId", getByUserId);
router.get("/:id", getById);

router.post("/", createProfile);
router.put("/:id", updateProfile);
router.patch("/:id", updateProfile);

// Avatar upload & delete
router.post("/:id/avatar", upload.single("image"), uploadAvatar);
router.delete("/:id/avatar", deleteAvatar);

// Cover photo upload & delete
router.post("/:id/cover", upload.single("image"), uploadCover);
router.delete("/:id/cover", deleteCover);

// KYC documents upload (multipart)
router.post(
  "/:id/kyc-documents",
  upload.fields([
    { name: "aadhar", maxCount: 1 },
    { name: "pan", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
  ]),
  uploadKycDocuments
);

router.post("/verification", submitVerification);

router.post("/brand-verification", submitBrandVerification);

export default router;