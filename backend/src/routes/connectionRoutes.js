import express from "express";
import { protect, optionalAuth } from "../middleware/auth.js";

import {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getNavbarNotificationCount,
  getRequestsForBrand,
  getRequestsForCreator,
  getConnectionStatus,
  markCreatorNotificationsSeen,
  getAllConnections,
  getMyRequestsForCreator,
  getApprovedCollaborationsForBrand,
  proposeCollaborationAmount,
  agreeCollaborationAmount,
  getCollaborationDetails,
  getCollaborationDeliverables,
  deleteConnection,
  updateShippingAddress,
  updateBarterShipping,
  confirmProductReceived,
} from "../controllers/connectionController.js";

const router = express.Router();

router.post("/request", protect, sendRequest);

router.delete("/:connectionId", protect, deleteConnection);

router.patch("/:connectionId/accept", protect, acceptRequest);

router.patch("/:connectionId/reject", protect, rejectRequest);

router.patch("/:connectionId/propose-amount", protect, proposeCollaborationAmount);

router.patch("/:connectionId/agree-amount", protect, agreeCollaborationAmount);

router.get("/:connectionId/collaboration", protect, getCollaborationDetails);

router.get("/:connectionId/deliverables", protect, getCollaborationDeliverables);

router.patch("/:connectionId/shipping-address", protect, updateShippingAddress);

router.patch("/:connectionId/barter-shipping", protect, updateBarterShipping);

router.patch("/:connectionId/confirm-product-received", protect, confirmProductReceived);

router.get("/collaboration-details", protect, getCollaborationDetails);

router.get("/notification-count", getNavbarNotificationCount);
router.get("/notifications/count", getNavbarNotificationCount);

router.get("/brand/:brandId/requests", getRequestsForBrand);

router.get("/creator/:creatorId/requests", getRequestsForCreator);

router.get("/status", getConnectionStatus);

router.patch(
  "/creator/:creatorId/notifications-seen",
  markCreatorNotificationsSeen
);
router.patch(
  "/creator/:creatorId/seen",
  markCreatorNotificationsSeen
);

router.get("/all", getAllConnections);

router.get(
  "/creator/:creatorId/my-requests",
  getMyRequestsForCreator
);

router.get(
  "/brand/:brandId/approved",
  getApprovedCollaborationsForBrand
);

export default router;