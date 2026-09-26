import express from "express";
import upload from "../middleware/upload.js";
import { optionalAuth } from "../middleware/auth.js";

import {
  listAddonServices,
  createAddonService,
  updateAddonService,
  deleteAddonService,
  listAddonBookings,
  createAddonBooking,
  updateAddonBookingStatus,
  deleteAddonBooking,
} from "../controllers/addonServicesController.js";

const router = express.Router();

router.get("/services", optionalAuth, listAddonServices);
router.post("/services", optionalAuth, upload.single("image"), createAddonService);
router.patch("/services/:id", optionalAuth, upload.single("image"), updateAddonService);
router.delete("/services/:id", optionalAuth, deleteAddonService);

router.get("/bookings", optionalAuth, listAddonBookings);
router.post("/bookings", optionalAuth, createAddonBooking);
router.patch("/bookings/:id", optionalAuth, updateAddonBookingStatus);
router.delete("/bookings/:id", optionalAuth, deleteAddonBooking);

export default router;