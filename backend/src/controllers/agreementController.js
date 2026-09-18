import mongoose from "mongoose";
import Agreement from "../models/Agreement.js";
import Connection from "../models/Connection.js";
import Campaign from "../models/Campaign.js";
import Profile from "../models/Profile.js";
import Notification from "../models/Notification.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { buildAgreementPdfBuffer, uploadAgreementPdf } from "../services/agreementPdfService.js";

/**
 * Standard legal and operational terms for Pravixo Platform Collaborations
 */
const generateAgreementTerms = (brandName, creatorName, campaignTitle, creatorAmount, pravixoFee, brandTotal) => [
  {
    sectionNumber: 1,
    title: "1. Parties to the Agreement",
    content: `This Collaboration Agreement ("Agreement") is entered into between ${brandName} ("Brand") and ${creatorName} ("Creator"), facilitated and administered through the Pravixo Platform ("Pravixo").`,
  },
  {
    sectionNumber: 2,
    title: "2. Campaign & Scope of Work",
    content: `The Creator agrees to produce, deliver, and publish original promotional content for the "${campaignTitle}" campaign in accordance with the specified deliverables schedule and guidelines.`,
  },
  {
    sectionNumber: 3,
    title: "3. Deliverables & Specifications",
    content: `The Creator shall complete and submit all agreed deliverable items (Reels, Posts, Stories, and/or Videos) through the Pravixo Deliverables Portal before the agreed campaign deadline.`,
  },
  {
    sectionNumber: 4,
    title: "4. Creator Compensation",
    content: `Upon satisfactory completion and Brand approval of all required deliverables, Creator is entitled to receive full agreed net compensation of ₹${Number(creatorAmount).toLocaleString("en-IN")} (80% net payout after 20% Pravixo platform service fee deduction from total campaign budget).`,
  },
  {
    sectionNumber: 5,
    title: "5. Pravixo Platform Service Fee",
    content: `Pravixo charges a 20% platform administration and escrow guarantee service fee of ₹${Number(pravixoFee).toLocaleString("en-IN")}, deducted from the total campaign budget of ₹${Number(brandTotal).toLocaleString("en-IN")}.`,
  },
  {
    sectionNumber: 6,
    title: "6. Total Brand Payment & Escrow Security",
    content: `The Brand shall deposit total funding of ₹${Number(brandTotal).toLocaleString("en-IN")} into Pravixo Escrow prior to creator work commencement. Funds remain secured until completion and review criteria are fulfilled.`,
  },
  {
    sectionNumber: 7,
    title: "7. Content Submission & Review Process",
    content: `Creator must upload deliverable drafts or media proof via the Pravixo submission system. Brand shall review each submission within the standard turnaround period and either approve or request rework with constructive feedback.`,
  },
  {
    sectionNumber: 8,
    title: "8. Revisions & Rework",
    content: `If a deliverable is rejected by the Brand with specific feedback, Creator agrees to make reasonable corrections and submit a revised version in a timely manner.`,
  },
  {
    sectionNumber: 9,
    title: "9. Approval & 72-Hour Protection Review Period",
    content: `Upon 100% approval of all deliverables by the Brand, a 72-hour escrow review period commences. Following expiration of this review window, payment becomes fully eligible for platform release to the Creator's wallet.`,
  },
  {
    sectionNumber: 10,
    title: "10. Intellectual Property & Usage Rights",
    content: `Creator grants the Brand a non-exclusive, worldwide license to use, display, and repost the approved collaboration content for promotional purposes during the campaign duration.`,
  },
  {
    sectionNumber: 11,
    title: "11. Confidentiality & Non-Disclosure",
    content: `Both Parties agree to keep non-public campaign details, pricing terms, unreleased products, and proprietary marketing strategies strictly confidential.`,
  },
  {
    sectionNumber: 12,
    title: "12. General Terms & Dispute Resolution",
    content: `This Agreement is governed by the laws of India. Any disputes arising from this collaboration shall first be mediated through Pravixo Platform Support and Resolution Services.`,
  },
];

/**
 * Generate a unique authoritative Agreement Reference ID
 * Format: PRV-AGR-YYYY-XXXXXX
 */
const generateUniqueAgreementId = async () => {
  const year = new Date().getFullYear();
  const count = await Agreement.countDocuments();
  const sequence = String(count + 1).padStart(6, "0");
  let candidate = `PRV-AGR-${year}-${sequence}`;

  // Ensure uniqueness
  let exists = await Agreement.findOne({ agreementId: candidate });
  let counter = 1;
  while (exists) {
    candidate = `PRV-AGR-${year}-${String(count + 1 + counter).padStart(6, "0")}`;
    exists = await Agreement.findOne({ agreementId: candidate });
    counter++;
  }
  return candidate;
};

/**
 * 1. Generate or Retrieve Agreement for a Collaboration
 * POST /api/agreements/collaboration/:connectionId/generate
 */
export const generateAgreement = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { forceRegenerate } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(connectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid collaboration connection ID.",
      });
    }

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Collaboration connection not found.",
      });
    }

    // Authorization check: Must be Brand, Creator, or Admin
    if (req.user && req.user.role !== "admin") {
      const isBrand = String(connection.brandId) === String(req.user._id);
      const isCreator = String(connection.creatorId) === String(req.user._id);
      if (!isBrand && !isCreator) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: You are not a participant in this collaboration.",
        });
      }
    }

    // Validate collaboration state
    if (connection.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Agreements can only be generated for accepted collaborations.",
      });
    }

    // Fetch Brand and Creator profiles
    const [brandProfile, creatorProfile] = await Promise.all([
      Profile.findById(connection.brandId),
      Profile.findById(connection.creatorId),
    ]);

    if (!brandProfile) {
      return res.status(404).json({
        success: false,
        message: "Brand profile not found.",
      });
    }
    if (!creatorProfile) {
      return res.status(404).json({
        success: false,
        message: "Creator profile not found.",
      });
    }

    // Fetch Campaign
    let campaign = null;
    if (connection.campaignId) {
      campaign = await Campaign.findById(connection.campaignId);
    }

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign associated with this collaboration was not found.",
      });
    }

    // Financial calculations & validation
    const brandTotal = Number(connection.brandTotal) || (Number(connection.creatorAmount) ? Math.round(Number(connection.creatorAmount) / 0.8) : 0);
    if (brandTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot generate agreement: Collaboration budget amount has not been agreed or is ₹0.",
      });
    }

    const pravixoFee = Number(connection.pravixoFee) || Math.round(brandTotal * 0.20);
    const creatorAmount = Number(connection.creatorAmount) || (brandTotal - pravixoFee);

    // Deliverables snapshot preparation
    let deliverablesSnapshot = [];
    if (connection.deliverablesTracking && connection.deliverablesTracking.length > 0) {
      deliverablesSnapshot = connection.deliverablesTracking
        .filter((d) => d.requiredQuantity > 0)
        .map((d) => ({
          type: d.type,
          requiredQuantity: d.requiredQuantity,
          status: d.status || "PENDING",
          notes: "",
        }));
    } else if (campaign.deliverables) {
      const { reels = 0, posts = 0, stories = 0, videos = 0, notes = "" } = campaign.deliverables;
      if (reels > 0) deliverablesSnapshot.push({ type: "REEL", requiredQuantity: reels, status: "PENDING", notes });
      if (posts > 0) deliverablesSnapshot.push({ type: "POST", requiredQuantity: posts, status: "PENDING", notes });
      if (stories > 0) deliverablesSnapshot.push({ type: "STORY", requiredQuantity: stories, status: "PENDING", notes });
      if (videos > 0) deliverablesSnapshot.push({ type: "VIDEO", requiredQuantity: videos, status: "PENDING", notes });
    }

    if (deliverablesSnapshot.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot generate agreement: No deliverables configured for this collaboration.",
      });
    }

    // Check if an existing agreement already exists for this collaboration
    const existingAgreements = await Agreement.find({ collaborationId: connection._id }).sort({ version: -1 });
    const latestAgreement = existingAgreements[0] || null;

    if (latestAgreement && !forceRegenerate) {
      // Return existing generated agreement snapshot
      return res.status(200).json({
        success: true,
        message: "Existing agreement retrieved successfully.",
        data: latestAgreement,
        isExisting: true,
      });
    }

    // Determine version number
    const nextVersion = latestAgreement ? latestAgreement.version + 1 : 1;
    const agreementId = await generateUniqueAgreementId();

    // Prepare Brand Snapshot
    const brandSnapshot = {
      brandId: String(brandProfile._id),
      fullName: brandProfile.fullName || "Brand",
      handle: brandProfile.handle || "",
      email: brandProfile.email || "",
      phone: brandProfile.phone || "",
      location: brandProfile.location || "",
      companySize: brandProfile.companySize || "",
      website: brandProfile.website || "",
      gstNumber: brandProfile.gstNumber || "",
      avatarUrl: brandProfile.avatarUrl || "",
    };

    // Prepare Creator Snapshot
    const creatorSnapshot = {
      creatorId: String(creatorProfile._id),
      fullName: creatorProfile.fullName || "Creator",
      handle: creatorProfile.handle || "",
      email: creatorProfile.email || "",
      phone: creatorProfile.phone || "",
      location: creatorProfile.location || "",
      category: creatorProfile.category || "",
      instagramHandle: creatorProfile.instagramHandle || "",
      youtubeHandle: creatorProfile.youtubeHandle || "",
      avatarUrl: creatorProfile.avatarUrl || "",
    };

    // Prepare Campaign Snapshot
    const campaignSnapshot = {
      campaignId: String(campaign._id),
      title: campaign.title || "Campaign",
      description: campaign.description || "",
      category: campaign.category || "",
      location: campaign.location || "Pan India",
      startDate: campaign.startDate || Date.now(),
      endDate: campaign.endDate || Date.now(),
      totalBudget: campaign.totalBudget || 0,
    };

    // Prepare Financials Snapshot
    const financialsSnapshot = {
      creatorAmount,
      pravixoFee,
      brandTotal,
      currency: "INR",
    };

    // Generate Standard Terms
    const terms = generateAgreementTerms(
      brandSnapshot.fullName,
      creatorSnapshot.fullName,
      campaignSnapshot.title,
      creatorAmount,
      pravixoFee,
      brandTotal
    );

    const agreement = await Agreement.create({
      agreementId,
      collaborationId: connection._id,
      campaignId: campaign._id,
      brandId: brandProfile._id,
      creatorId: creatorProfile._id,
      version: nextVersion,
      status: "GENERATED",
      brandSnapshot,
      creatorSnapshot,
      campaignSnapshot,
      deliverablesSnapshot,
      financialsSnapshot,
      terms,
      generatedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    res.status(201).json({
      success: true,
      message: `Collaboration agreement ${agreement.agreementId} (v${agreement.version}) generated successfully.`,
      data: agreement,
      isExisting: false,
    });
  } catch (error) {
    console.error("Generate agreement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate collaboration agreement.",
      error: error.message,
    });
  }
};

/**
 * 2. Get latest agreement for a collaboration
 * GET /api/agreements/collaboration/:connectionId
 */
export const getAgreementByCollaboration = async (req, res) => {
  try {
    const { connectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(connectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid collaboration connection ID.",
      });
    }

    const connection = await Connection.findById(connectionId).lean();
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Collaboration connection not found.",
      });
    }

    // Security check: Brand, Creator, or Admin
    if (req.user && req.user.role !== "admin") {
      const isBrand = String(connection.brandId) === String(req.user._id);
      const isCreator = String(connection.creatorId) === String(req.user._id);
      if (!isBrand && !isCreator) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: You do not have permission to access this agreement.",
        });
      }
    }

    const agreement = await Agreement.findOne({ collaborationId: connection._id }).sort({ version: -1 });

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: "No agreement found for this collaboration.",
      });
    }

    res.status(200).json({
      success: true,
      data: agreement,
    });
  } catch (error) {
    console.error("Get agreement by collaboration error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch collaboration agreement.",
      error: error.message,
    });
  }
};

/**
 * 3. Get all agreement versions for a collaboration
 * GET /api/agreements/collaboration/:connectionId/versions
 */
export const getAgreementVersions = async (req, res) => {
  try {
    const { connectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(connectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid collaboration connection ID.",
      });
    }

    const connection = await Connection.findById(connectionId).lean();
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Collaboration connection not found.",
      });
    }

    // Security check: Brand, Creator, or Admin
    if (req.user && req.user.role !== "admin") {
      const isBrand = String(connection.brandId) === String(req.user._id);
      const isCreator = String(connection.creatorId) === String(req.user._id);
      if (!isBrand && !isCreator) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: You do not have permission to view agreement history.",
        });
      }
    }

    const versions = await Agreement.find({ collaborationId: connection._id }).sort({ version: -1 });

    res.status(200).json({
      success: true,
      data: versions,
    });
  } catch (error) {
    console.error("Get agreement versions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch agreement versions.",
      error: error.message,
    });
  }
};

/**
 * 4. Get agreement by unique Agreement ID or Mongo ID
 * GET /api/agreements/:agreementId
 */
export const getAgreementById = async (req, res) => {
  try {
    const { agreementId } = req.params;

    let agreement = null;
    if (mongoose.Types.ObjectId.isValid(agreementId)) {
      agreement = await Agreement.findById(agreementId);
    }
    if (!agreement) {
      agreement = await Agreement.findOne({ agreementId });
    }

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: "Agreement document not found.",
      });
    }

    // Security check
    if (req.user && req.user.role !== "admin") {
      const isBrand = String(agreement.brandId) === String(req.user._id);
      const isCreator = String(agreement.creatorId) === String(req.user._id);
      if (!isBrand && !isCreator) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: You are not authorized to view this agreement.",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: agreement,
    });
  } catch (error) {
    console.error("Get agreement by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch agreement.",
      error: error.message,
    });
  }
};

/**
 * 5. Sign / Accept Agreement (Brand, Creator, or Admin)
 * POST /api/agreements/:agreementId/sign
 */
export const signAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const { signatureMethod = "DIGITAL_ACCEPTANCE" } = req.body || {};

    let agreement = null;
    if (mongoose.Types.ObjectId.isValid(agreementId)) {
      agreement = await Agreement.findById(agreementId);
    }
    if (!agreement) {
      agreement = await Agreement.findOne({ agreementId });
    }

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: "Agreement document not found.",
      });
    }

    const userId = req.user._id;
    const userRole = req.user.role;
    const isBrand = String(agreement.brandId) === String(userId) && userRole === "brand";
    const isCreator = String(agreement.creatorId) === String(userId) && userRole === "creator";
    const isAdmin = userRole === "admin";

    if (!isBrand && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not have permission to sign this agreement.",
      });
    }

    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    const now = Date.now();
    let notificationRecipients = [];
    let notificationText = "";
    let notificationType = "";

    if (isBrand) {
      if (agreement.brandSignature && agreement.brandSignature.signed) {
        return res.status(400).json({
          success: false,
          message: "You have already signed this agreement version.",
          data: agreement,
        });
      }
      agreement.brandSignature = {
        signed: true,
        userId,
        name: req.user.fullName || agreement.brandSnapshot?.fullName || "Brand Representative",
        signedAt: now,
        signatureMethod,
        ipAddress,
      };
      notificationType = "agreement_signed_brand";
      notificationText = `The Brand has signed the collaboration agreement for "${agreement.campaignSnapshot?.title}".`;
      notificationRecipients.push(agreement.creatorId);
    } else if (isCreator) {
      if (agreement.creatorSignature && agreement.creatorSignature.signed) {
        return res.status(400).json({
          success: false,
          message: "You have already signed this agreement version.",
          data: agreement,
        });
      }
      agreement.creatorSignature = {
        signed: true,
        userId,
        name: req.user.fullName || agreement.creatorSnapshot?.fullName || "Creator",
        signedAt: now,
        signatureMethod,
        ipAddress,
      };
      notificationType = "agreement_signed_creator";
      notificationText = `The Creator has signed the collaboration agreement for "${agreement.campaignSnapshot?.title}".`;
      notificationRecipients.push(agreement.brandId);
    } else if (isAdmin) {
      if (agreement.adminSignature && agreement.adminSignature.signed) {
        return res.status(400).json({
          success: false,
          message: "Admin signature is already recorded for this agreement version.",
          data: agreement,
        });
      }
      agreement.adminSignature = {
        signed: true,
        userId,
        name: req.user.fullName || "Pravixo Compliance Admin",
        signedAt: now,
        signatureMethod: "ADMIN_APPROVAL",
        ipAddress,
      };
    }

    // Determine overall signatureStatus
    const brandSigned = Boolean(agreement.brandSignature?.signed);
    const creatorSigned = Boolean(agreement.creatorSignature?.signed);
    const adminSigned = Boolean(agreement.adminSignature?.signed);

    if (brandSigned && creatorSigned && adminSigned) {
      agreement.signatureStatus = "FULLY_SIGNED";
      agreement.fullySignedAt = now;
      notificationType = "agreement_fully_signed";
      notificationText = `The collaboration agreement for "${agreement.campaignSnapshot?.title}" is now fully signed by all parties.`;
      
      const adminProfiles = await Profile.find({ role: "admin" }).select("_id").lean();
      const adminIds = adminProfiles.map((a) => a._id);
      
      notificationRecipients = [agreement.brandId, agreement.creatorId, ...adminIds];
    } else {
      agreement.signatureStatus = "PARTIALLY_SIGNED";
    }

    agreement.updatedAt = now;
    await agreement.save();

    // Send notifications to counterparties
    if (notificationRecipients.length > 0 && notificationText && notificationType) {
      try {
        const notifDocs = notificationRecipients
          .filter((recipientId) => String(recipientId) !== String(userId))
          .map((recipientId) => ({
            recipientId,
            senderId: userId,
            type: notificationType,
            text: notificationText,
            targetUrl: "/messages",
            metadata: { agreementId: agreement._id, version: agreement.version },
            read: false,
            createdAt: now,
          }));
        if (notifDocs.length > 0) {
          await Notification.insertMany(notifDocs);
        }
      } catch (notifErr) {
        console.error("Failed to send signature notification:", notifErr);
      }
    }

    res.status(200).json({
      success: true,
      message:
        agreement.signatureStatus === "FULLY_SIGNED"
          ? "Agreement signed successfully! The agreement is now FULLY_SIGNED."
          : "Agreement signature recorded successfully.",
      data: agreement,
    });
  } catch (error) {
    console.error("Sign agreement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record agreement signature.",
      error: error.message,
    });
  }
};

/**
 * 6. Get signatures details for an agreement
 * GET /api/agreements/:agreementId/signatures
 */
export const getAgreementSignatures = async (req, res) => {
  try {
    const { agreementId } = req.params;

    let agreement = null;
    if (mongoose.Types.ObjectId.isValid(agreementId)) {
      agreement = await Agreement.findById(agreementId).lean();
    }
    if (!agreement) {
      agreement = await Agreement.findOne({ agreementId }).lean();
    }

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: "Agreement document not found.",
      });
    }

    // Security check
    if (req.user && req.user.role !== "admin") {
      const isBrand = String(agreement.brandId) === String(req.user._id);
      const isCreator = String(agreement.creatorId) === String(req.user._id);
      if (!isBrand && !isCreator) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: You are not authorized to view this agreement's signatures.",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        agreementId: agreement.agreementId,
        version: agreement.version,
        signatureStatus: agreement.signatureStatus || "PENDING_SIGNATURES",
        fullySignedAt: agreement.fullySignedAt,
        brandSignature: agreement.brandSignature || { signed: false },
        creatorSignature: agreement.creatorSignature || { signed: false },
        adminSignature: agreement.adminSignature || { signed: false },
      },
    });
  } catch (error) {
    console.error("Get agreement signatures error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch agreement signatures.",
      error: error.message,
    });
  }
};

/**
 * 7. Generate or Retrieve Final Signed Agreement PDF
 * POST /api/agreements/:agreementId/generate-pdf
 */
export const generateAgreementPdf = async (req, res) => {
  try {
    const { agreementId } = req.params;

    let agreement = null;
    if (mongoose.Types.ObjectId.isValid(agreementId)) {
      agreement = await Agreement.findById(agreementId);
    }
    if (!agreement) {
      agreement = await Agreement.findOne({ agreementId });
    }

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: "Agreement document not found.",
      });
    }

    // Security check: Must be Brand, Creator, or Admin
    if (req.user && req.user.role !== "admin") {
      const isBrand = String(agreement.brandId) === String(req.user._id);
      const isCreator = String(agreement.creatorId) === String(req.user._id);
      if (!isBrand && !isCreator) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: You do not have permission to access this agreement's PDF.",
        });
      }
    }

    // Task 17 Eligibility Rule: Must be FULLY_SIGNED
    if (agreement.signatureStatus !== "FULLY_SIGNED") {
      return res.status(400).json({
        success: false,
        message: "Cannot generate final PDF: Agreement has not been fully signed by Brand, Creator, and Admin.",
        signatureStatus: agreement.signatureStatus,
      });
    }

    // Duplicate Generation Protection: If PDF already exists for this exact version, return existing
    if (agreement.pdfUrl && agreement.pdfVersion === agreement.version) {
      return res.status(200).json({
        success: true,
        message: "Existing final signed agreement PDF retrieved successfully.",
        data: {
          agreementId: agreement.agreementId,
          version: agreement.version,
          pdfUrl: agreement.pdfUrl,
          pdfGeneratedAt: agreement.pdfGeneratedAt,
          isExisting: true,
        },
      });
    }

    // Generate PDF Buffer
    const pdfBuffer = await buildAgreementPdfBuffer(agreement);
    const deterministicFilename = `${agreement.agreementId}-v${agreement.version}`;

    let uploadedUrl = "";
    let uploadedPublicId = "";

    try {
      const uploadResult = await uploadAgreementPdf(pdfBuffer, deterministicFilename);
      uploadedUrl = uploadResult.secure_url || uploadResult.url;
      uploadedPublicId = uploadResult.public_id;
    } catch (uploadError) {
      console.warn("Cloudinary upload failed, falling back to base64 data URI:", uploadError.message);
      uploadedUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
      uploadedPublicId = deterministicFilename;
    }

    // Save PDF reference on agreement
    agreement.pdfUrl = uploadedUrl;
    agreement.pdfPublicId = uploadedPublicId;
    agreement.pdfGeneratedAt = Date.now();
    agreement.pdfVersion = agreement.version;
    await agreement.save();

    res.status(200).json({
      success: true,
      message: "Final signed agreement PDF generated successfully.",
      data: {
        agreementId: agreement.agreementId,
        version: agreement.version,
        pdfUrl: agreement.pdfUrl,
        pdfGeneratedAt: agreement.pdfGeneratedAt,
        isExisting: false,
      },
    });
  } catch (error) {
    console.error("Generate agreement PDF error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate signed agreement PDF.",
      error: error.message,
    });
  }
};

/**
 * 8. Get / Stream Agreement PDF
 * GET /api/agreements/:agreementId/pdf
 */
export const getAgreementPdf = async (req, res) => {
  try {
    const { agreementId } = req.params;

    let agreement = null;
    if (mongoose.Types.ObjectId.isValid(agreementId)) {
      agreement = await Agreement.findById(agreementId);
    }
    if (!agreement) {
      agreement = await Agreement.findOne({ agreementId });
    }

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: "Agreement document not found.",
      });
    }

    // Security check
    if (req.user && req.user.role !== "admin") {
      const isBrand = String(agreement.brandId) === String(req.user._id);
      const isCreator = String(agreement.creatorId) === String(req.user._id);
      if (!isBrand && !isCreator) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: You do not have permission to view this PDF.",
        });
      }
    }

    if (!agreement.pdfUrl) {
      return res.status(404).json({
        success: false,
        message: "Signed PDF has not been generated for this agreement yet.",
      });
    }

    // If Cloudinary URL, redirect to CDN asset
    if (agreement.pdfUrl.startsWith("http")) {
      return res.redirect(agreement.pdfUrl);
    }

    // Otherwise return PDF info JSON
    res.status(200).json({
      success: true,
      data: {
        agreementId: agreement.agreementId,
        version: agreement.version,
        pdfUrl: agreement.pdfUrl,
        pdfGeneratedAt: agreement.pdfGeneratedAt,
      },
    });
  } catch (error) {
    console.error("Get agreement PDF error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve agreement PDF.",
      error: error.message,
    });
  }
};

/**
 * 9. Send Final Signed Agreement PDF to Collaboration Chat
 * POST /api/agreements/:agreementId/send-chat
 */
export const sendAgreementPdfToChat = async (req, res) => {
  try {
    const { agreementId } = req.params;

    let agreement = null;
    if (mongoose.Types.ObjectId.isValid(agreementId)) {
      agreement = await Agreement.findById(agreementId);
    }
    if (!agreement) {
      agreement = await Agreement.findOne({ agreementId });
    }

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: "Agreement document not found.",
      });
    }

    // Security check: Must be Brand, Creator, or Admin
    const userId = req.user?._id;
    const userRole = req.user?.role;
    const isBrand = String(agreement.brandId) === String(userId);
    const isCreator = String(agreement.creatorId) === String(userId);
    const isAdmin = userRole === "admin";

    if (!isBrand && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not have permission to send this agreement to chat.",
      });
    }

    // Requirement: Must be FULLY_SIGNED
    if (agreement.signatureStatus !== "FULLY_SIGNED") {
      return res.status(400).json({
        success: false,
        message: "Cannot send agreement to chat: Agreement has not been fully signed yet.",
      });
    }

    // Requirement: PDF must exist
    if (!agreement.pdfUrl) {
      return res.status(400).json({
        success: false,
        message: "Cannot send agreement to chat: Final PDF has not been generated yet.",
      });
    }

    // Find Collaboration Conversation
    const convFilter = {
      creatorId: agreement.creatorId,
      brandId: agreement.brandId,
    };
    if (agreement.campaignId) {
      convFilter.campaignId = agreement.campaignId;
    }

    let conversation = await Conversation.findOne(convFilter);
    if (!conversation) {
      conversation = await Conversation.create({
        creatorId: agreement.creatorId,
        brandId: agreement.brandId,
        campaignId: agreement.campaignId || null,
        status: "active",
      });
    }

    // Idempotency / Duplicate check: Check if this agreement version has already been sent to this conversation
    const existingAgreementMessage = await Message.findOne({
      conversationId: conversation._id,
      messageType: "agreement_document",
      "metadata.agreementId": agreement.agreementId,
      "metadata.version": agreement.version,
    });

    if (existingAgreementMessage) {
      return res.status(200).json({
        success: true,
        message: "Agreement PDF was already sent to this conversation.",
        data: existingAgreementMessage,
        isExisting: true,
      });
    }

    const now = Date.now();
    const senderName = req.user?.fullName || (isAdmin ? "Pravixo Admin" : isBrand ? "Brand" : "Creator");

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: userId,
      text: `📄 [Official Collaboration Agreement] ${agreement.title || "Pravixo Collaboration Agreement"} (${agreement.agreementId} v${agreement.version}) has been fully signed by all parties.`,
      messageType: "agreement_document",
      metadata: {
        agreementId: agreement.agreementId,
        version: agreement.version,
        title: agreement.title,
        pdfUrl: agreement.pdfUrl,
        sentAt: now,
        sentBy: senderName,
        signatureStatus: "FULLY_SIGNED",
        brandName: agreement.brandSnapshot?.fullName || "Brand",
        creatorName: agreement.creatorSnapshot?.fullName || "Creator",
        campaignTitle: agreement.campaignSnapshot?.title || "Campaign",
      },
      read: false,
    });

    // Notify the counterparties
    const recipients = [];
    if (String(agreement.brandId) !== String(userId)) recipients.push(agreement.brandId);
    if (String(agreement.creatorId) !== String(userId)) recipients.push(agreement.creatorId);

    for (const rId of recipients) {
      await Notification.create({
        recipientId: rId,
        senderId: userId,
        type: "agreement_shared_in_chat",
        text: `The fully signed agreement for "${agreement.campaignSnapshot?.title || "campaign"}" has been posted in your collaboration chat.`,
        targetUrl: "/messages",
        metadata: { agreementId: agreement._id, messageId: message._id },
        read: false,
        createdAt: now,
      }).catch((e) => console.warn("Failed to send notification for chat agreement:", e.message));
    }

    return res.status(201).json({
      success: true,
      message: "Final signed agreement PDF successfully sent to chat.",
      data: message,
      isExisting: false,
    });
  } catch (error) {
    console.error("sendAgreementPdfToChat error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send agreement to chat.",
      error: error.message,
    });
  }
};


