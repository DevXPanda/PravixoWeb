import express from "express";
import ContactInquiry from "../models/ContactInquiry.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public: Submit a contact inquiry
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, email, subject, message) are required.",
      });
    }

    const inquiry = await ContactInquiry.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      status: "unread",
    });

    return res.status(201).json({
      success: true,
      message: "Inquiry received successfully! Our team will get back to you shortly.",
      data: inquiry,
    });
  } catch (error) {
    console.error("Contact inquiry creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while sending inquiry.",
    });
  }
});

// Admin: Get all inquiries
router.get("/admin/all", async (req, res) => {
  try {
    const inquiries = await ContactInquiry.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: inquiries,
    });
  } catch (error) {
    console.error("Fetch inquiries error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact inquiries.",
    });
  }
});

// Admin: Update inquiry status or admin notes
router.patch("/admin/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const updated = await ContactInquiry.findByIdAndUpdate(
      id,
      {
        ...(status && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found.",
      });
    }

    return res.json({
      success: true,
      message: "Inquiry updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Update inquiry error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update inquiry.",
    });
  }
});

// Admin: Delete an inquiry
router.delete("/admin/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ContactInquiry.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found.",
      });
    }

    return res.json({
      success: true,
      message: "Inquiry deleted successfully.",
      data: deleted,
    });
  } catch (error) {
    console.error("Delete inquiry error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete inquiry.",
    });
  }
});

export default router;
