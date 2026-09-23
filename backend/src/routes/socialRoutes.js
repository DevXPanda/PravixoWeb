import express from "express";

import {
  getConnections,
  getConnectionById,
  getHistory,
  saveConnection,
  updateConnectionStats,
  disconnectPlatform,
  getOAuthClientIds,
  exchangeOAuthCode,
  verifyAndConnectPlatform,
  syncLivePlatformStats,
} from "../controllers/socialController.js";

const router = express.Router();

// =====================================================
// OAUTH
// =====================================================

router.get(
  "/oauth/client-ids",
  getOAuthClientIds
);

router.post(
  "/oauth/exchange",
  exchangeOAuthCode
);

// Instant Verification & Live Re-Sync
router.post(
  "/verify-connect",
  verifyAndConnectPlatform
);

router.post(
  "/:connectionId/sync-live",
  syncLivePlatformStats
);

// =====================================================
// SOCIAL CONNECTIONS
// =====================================================

// Get all connections of a profile
router.get(
  "/profile/:profileId",
  getConnections
);

// Get single connection
router.get(
  "/:connectionId",
  getConnectionById
);

// Get analytics history
router.get(
  "/:connectionId/history",
  getHistory
);

// Save / update social connection
router.post(
  "/",
  saveConnection
);

// Update social connection statistics
router.patch(
  "/:connectionId/stats",
  updateConnectionStats
);

// Disconnect social platform
router.delete(
  "/:connectionId",
  disconnectPlatform
);

export default router;



// --------------------------------------------------------------------------------------




