import express from "express";
import {
  toggleFollow,
  checkFollowStatus,
  getFollowers,
  getFollowing,
} from "../controllers/followController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/toggle", optionalAuth, toggleFollow);
router.get("/status", optionalAuth, checkFollowStatus);
router.get("/followers/:profileId", getFollowers);
router.get("/following/:profileId", getFollowing);

export default router;
