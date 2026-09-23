import express from "express";
import { generatePitch, getSmartMatches } from "../controllers/aiController.js";

const router = express.Router();

// Generate contextual AI Pitch
router.post("/pitch", generatePitch);

// Get AI Smart Matches for Brands & Campaigns
router.get("/smart-matches", getSmartMatches);

export default router;
