import express from "express";

import {
  getPackages,
  getOffers,
  getUserSubscription,
  createSubscription,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  cancelSubscription,
} from "../controllers/subscriptionController.js";

const router = express.Router();

router.get("/packages", getPackages);

router.get("/offers", getOffers);

router.get("/user/:profileId", getUserSubscription);

router.post("/order", createSubscriptionOrder);

router.post("/verify", verifySubscriptionPayment);

router.post("/", createSubscription);

router.patch("/:subscriptionId/cancel", cancelSubscription);

export default router;