import mongoose from "mongoose";
import AddonService from "../models/AddonService.js";
import AddonBooking from "../models/AddonBooking.js";
import Profile from "../models/Profile.js";
import Notification from "../models/Notification.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

// List Addon Services with role-based visibility
// - Brands & Public: only enabled + approved services
// - Creators: approved services from platform + their own submitted services (any status)
// - Admins: all services
export const listAddonServices = async (req, res) => {
  try {
    const { profileId, role, status } = req.query;
    const enabledOnly = req.query.enabledOnly === "true";

    const isAdmin =
      role === "admin" ||
      req.user?.role === "admin" ||
      req.profile?.role === "admin";

    const effectiveProfileId = profileId || req.user?.profileId || req.user?._id;
    const isCreator =
      (role === "creator" || req.user?.role === "creator" || req.profile?.role === "creator") &&
      effectiveProfileId;

    let filter = {};

    if (isAdmin) {
      if (status && status !== "all") {
        filter.approvalStatus = status;
      }
      if (enabledOnly) {
        filter.enabled = true;
      }
    } else if (isCreator) {
      // Creator sees all approved services + their own submissions (pending, approved, rejected)
      filter = {
        $or: [
          { approvalStatus: "approved", enabled: true },
          { creatorId: effectiveProfileId },
        ],
      };
    } else {
      // Brands or general public: only approved and enabled services
      filter = {
        approvalStatus: "approved",
        enabled: true,
      };
    }

    const services = await AddonService.find(filter)
      .populate("creatorId", "fullName email role avatarUrl handle")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("List addon services error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch addon services.",
    });
  }
};

// Create Addon Service (Created by Creator or Admin)
export const createAddonService = async (req, res) => {
  try {
    let { name, description, imageUrl, price, enabled, creatorId, role } = req.body;

    if (req.file) {
      imageUrl = req.file.path || `/uploads/${req.file.filename}`;
    }

    const isAdmin = role === "admin" || (!creatorId && req.user?.role === "admin");
    const isCreator = role === "creator" || Boolean(creatorId);

    // If submitted by creator, approvalStatus starts as 'pending'. If added directly by admin, it's 'approved'.
    const approvalStatus = isAdmin ? "approved" : "pending";

    const service = await AddonService.create({
      name,
      description,
      imageUrl,
      price: Number(price) || 0,
      enabled: enabled !== undefined ? (enabled === "true" || enabled === true) : true,
      creatorId: isCreator ? creatorId : null,
      approvalStatus,
      rejectionReason: "",
      createdAt: Date.now(),
    });

    const populatedService = await AddonService.findById(service._id)
      .populate("creatorId", "fullName email role avatarUrl handle");

    // If created by creator, notify all admins about pending service approval
    if (isCreator && creatorId) {
      try {
        const creatorProfile = await Profile.findById(creatorId).select("fullName");
        const creatorName = creatorProfile ? creatorProfile.fullName : "A creator";
        const admins = await Profile.find({ role: "admin" }).select("_id");

        for (const admin of admins) {
          await Notification.create({
            recipientId: admin._id,
            senderId: creatorId,
            type: "addon_service_submitted",
            text: `New Add-on Service Submission: ${creatorName} submitted "${name}" (₹${Number(price).toLocaleString("en-IN")}) for approval.`,
            link: "/bookings",
            read: false,
            createdAt: Date.now(),
          });
        }
      } catch (notifErr) {
        console.error("Error creating creator addon notification for admin:", notifErr);
      }
    }

    res.status(201).json({
      success: true,
      data: populatedService,
      message: isCreator
        ? "Add-on service submitted successfully! It will be visible to brands once approved by admin."
        : "Add-on service created successfully!",
    });
  } catch (error) {
    console.error("Create addon service error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create addon service.",
    });
  }
};

// Update Addon Service
export const updateAddonService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID.",
      });
    }

    let { name, description, imageUrl, price, enabled, approvalStatus, rejectionReason } = req.body;

    if (req.file) {
      imageUrl = req.file.path || `/uploads/${req.file.filename}`;
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (imageUrl !== undefined) updateFields.imageUrl = imageUrl;
    if (price !== undefined) updateFields.price = Number(price);
    if (enabled !== undefined) updateFields.enabled = enabled === "true" || enabled === true;
    if (approvalStatus !== undefined) updateFields.approvalStatus = approvalStatus;
    if (rejectionReason !== undefined) updateFields.rejectionReason = rejectionReason;

    const existingService = await AddonService.findById(id);
    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: "Addon service not found.",
      });
    }

    const service = await AddonService.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    ).populate("creatorId", "fullName email role avatarUrl handle");

    // If admin approved or rejected creator's service, send notification to creator
    if (
      existingService.creatorId &&
      approvalStatus &&
      approvalStatus !== existingService.approvalStatus
    ) {
      try {
        const isApproved = approvalStatus === "approved";
        const admins = await Profile.find({ role: "admin" }).select("_id");
        const adminSenderId = admins[0]?._id || existingService.creatorId;

        await Notification.create({
          recipientId: existingService.creatorId,
          senderId: adminSenderId,
          type: isApproved ? "addon_service_approved" : "addon_service_rejected",
          text: isApproved
            ? `Your Add-on service "${service.name}" has been approved by admin and is now live for brands!`
            : `Your Add-on service "${service.name}" was rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ""}`,
          link: "/addons",
          read: false,
          createdAt: Date.now(),
        });
      } catch (notifErr) {
        console.error("Error creating creator approval notification:", notifErr);
      }
    }

    res.status(200).json({
      success: true,
      data: service,
      message: "Addon service updated successfully.",
    });
  } catch (error) {
    console.error("Update addon service error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update addon service.",
    });
  }
};

// Delete Addon Service
export const deleteAddonService = async (req, res) => {
  try {
    const { id } = req.params;

    await AddonService.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Addon service deleted.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete addon service.",
    });
  }
};

// List Addon Bookings with role-based filtering:
// - Brands: see bookings they placed
// - Creators: see bookings placed by brands for their services (+ any bookings they placed)
// - Admin: see all bookings
export const listAddonBookings = async (req, res) => {
  try {
    const { profileId, role } = req.query;

    let filter = {};

    if (role === "admin" || !profileId) {
      // Admin gets all bookings
      filter = {};
    } else if (role === "creator") {
      // Find all services owned by this creator
      const creatorServices = await AddonService.find({ creatorId: profileId }).select("_id");
      const creatorServiceIds = creatorServices.map((s) => s._id);

      // Show bookings placed for this creator's services OR bookings made by this creator
      filter = {
        $or: [
          { serviceId: { $in: creatorServiceIds } },
          { profileId: profileId },
        ],
      };
    } else {
      // Brands: see bookings they created
      filter = { profileId };
    }

    const bookings = await AddonBooking.find(filter)
      .populate({
        path: "serviceId",
        populate: {
          path: "creatorId",
          select: "fullName email role avatarUrl handle",
        },
      })
      .populate("profileId", "fullName email role handle avatarUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("List addon bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch addon bookings.",
    });
  }
};

// Create Addon Booking (Brand or User books a service)
export const createAddonBooking = async (req, res) => {
  try {
    const { profileId, serviceId, notes } = req.body;

    const booking = await AddonBooking.create({
      profileId,
      serviceId,
      notes,
      bookingDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
      status: "pending",
      createdAt: Date.now(),
    });

    const populatedBooking = await AddonBooking.findById(booking._id)
      .populate({
        path: "serviceId",
        populate: {
          path: "creatorId",
          select: "fullName email role avatarUrl handle",
        },
      })
      .populate("profileId", "fullName email role handle avatarUrl");

    const service = await AddonService.findById(serviceId).populate("creatorId");
    const requester = await Profile.findById(profileId).select("fullName role");
    const serviceName = service ? service.name : "Add-on Service";
    const requesterName = requester ? requester.fullName : "A user";
    const requesterRole = requester?.role || "brand";

    // 1. Notify Admins about new booking
    try {
      const admins = await Profile.find({ role: "admin" }).select("_id");
      for (const admin of admins) {
        await Notification.create({
          recipientId: admin._id,
          senderId: profileId,
          type: "addon_booking",
          text: `New Add-on Booking: ${requesterName} (${requesterRole}) booked "${serviceName}".`,
          link: "/bookings",
          read: false,
          createdAt: Date.now(),
        });
      }
    } catch (notifErr) {
      console.error("Error creating admin booking notification:", notifErr);
    }

    // 2. If the service is owned by a Creator, notify Creator and initiate direct chat!
    let conversationId = null;
    if (service?.creatorId?._id && String(service.creatorId._id) !== String(profileId)) {
      try {
        await Notification.create({
          recipientId: service.creatorId._id,
          senderId: profileId,
          type: "addon_booking",
          text: `🎉 Good news! ${requesterName} (${requesterRole}) booked your service "${serviceName}". Discuss schedule and details in Messages.`,
          link: "/addons",
          read: false,
          createdAt: Date.now(),
        });

        // Initialize or find direct conversation between Brand and Creator
        let conversation = await Conversation.findOne({
          creatorId: service.creatorId._id,
          brandId: profileId,
          conversationType: "brand_creator",
        });

        if (!conversation) {
          conversation = await Conversation.create({
            creatorId: service.creatorId._id,
            brandId: profileId,
            conversationType: "brand_creator",
            status: "active",
          });
        }

        if (conversation) {
          conversationId = conversation._id;
          const initialChatText = `👋 Hello! I just booked your add-on service "${serviceName}" (₹${Number(service.price || 0).toLocaleString("en-IN")}).${notes ? `\n\nBooking Notes: "${notes}"` : ""}\n\nLet's coordinate the timing, requirements, and deliverables here.`;

          await Message.create({
            conversationId: conversation._id,
            senderId: profileId,
            text: initialChatText,
            read: false,
            messageType: "text",
          });
        }
      } catch (creatorNotifErr) {
        console.error("Error setting up creator booking chat/notif:", creatorNotifErr);
      }
    }

    res.status(201).json({
      success: true,
      data: populatedBooking,
      conversationId,
      message: service?.creatorId?.fullName
        ? `Booking request sent to ${service.creatorId.fullName}! A direct conversation has been started in Messages.`
        : `Booking request for ${serviceName} submitted successfully!`,
    });
  } catch (error) {
    console.error("Create addon booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create addon booking.",
    });
  }
};

// Update Addon Booking Status (Confirmed / Cancelled / Pending)
export const updateAddonBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value.",
      });
    }

    const booking = await AddonBooking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate({
        path: "serviceId",
        populate: {
          path: "creatorId",
          select: "fullName email role avatarUrl handle",
        },
      })
      .populate("profileId", "fullName email role avatarUrl handle");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking request not found.",
      });
    }

    // Notify the Brand/Customer who placed the booking
    try {
      const admins = await Profile.find({ role: "admin" }).select("_id");
      const adminSenderId = admins[0]?._id || booking.profileId?._id;
      const serviceName = booking.serviceId?.name || "Add-on Service";

      await Notification.create({
        recipientId: booking.profileId._id,
        senderId: adminSenderId,
        type: status === "confirmed" ? "addon_booking_confirmed" : "addon_booking_cancelled",
        text: status === "confirmed"
          ? `Your booking request for "${serviceName}" has been confirmed!`
          : `Your booking request for "${serviceName}" has been updated to ${status}.`,
        link: "/addons",
        read: false,
        createdAt: Date.now(),
      });

      // If creator owns this service, notify creator as well about confirmation/cancellation
      if (booking.serviceId?.creatorId?._id) {
        await Notification.create({
          recipientId: booking.serviceId.creatorId._id,
          senderId: adminSenderId,
          type: status === "confirmed" ? "addon_booking_confirmed" : "addon_booking_cancelled",
          text: `Booking for your service "${serviceName}" by ${booking.profileId?.fullName} is now ${status}.`,
          link: "/addons",
          read: false,
          createdAt: Date.now(),
        });
      }
    } catch (notifErr) {
      console.error("Error creating booking status notification:", notifErr);
    }

    res.status(200).json({
      success: true,
      data: booking,
      message: `Booking marked as ${status}.`,
    });
  } catch (error) {
    console.error("Update addon booking status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking status.",
    });
  }
};

// Delete Addon Booking
export const deleteAddonBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await AddonBooking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking request not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking request deleted successfully.",
    });
  } catch (error) {
    console.error("Delete addon booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete booking request.",
    });
  }
};