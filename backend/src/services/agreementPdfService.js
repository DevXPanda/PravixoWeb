import PDFDocument from "pdfkit";
import cloudinary from "../config/cloudinary.js";

/**
 * Generate a PDF Buffer from a fully signed Agreement snapshot
 * @param {Object} agreement - The Agreement mongoose document
 * @returns {Promise<Buffer>}
 */
export const buildAgreementPdfBuffer = (agreement) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
        info: {
          Title: `Pravixo Agreement - ${agreement.agreementId} (v${agreement.version})`,
          Author: "Pravixo Influencer Marketing Platform",
          Subject: "Collaboration Agreement",
        },
      });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // --- COLORS & STYLING TOKENS ---
      const primaryColor = "#4F46E5"; // Pravixo indigo
      const darkColor = "#111827";
      const grayColor = "#4B5563";
      const lightBg = "#F3F4F6";
      const greenColor = "#059669";
      const borderColor = "#E5E7EB";

      // --- HEADER SECTION ---
      doc.rect(40, 40, 515, 60).fill(lightBg);

      doc.fillColor(primaryColor).fontSize(20).font("Helvetica-Bold").text("PRAVIXO", 55, 52);
      doc.fillColor(darkColor).fontSize(10).font("Helvetica-Bold").text("COLLABORATION AGREEMENT", 55, 75);

      doc.fillColor(darkColor).fontSize(9).font("Helvetica-Bold").text(`REF: ${agreement.agreementId}`, 360, 52, { align: "right", width: 180 });
      doc.fillColor(grayColor).fontSize(8).font("Helvetica").text(`Version ${agreement.version} • Fully Signed`, 360, 65, { align: "right", width: 180 });
      doc.text(`Generated: ${new Date(agreement.generatedAt || Date.now()).toLocaleDateString()}`, 360, 77, { align: "right", width: 180 });

      doc.moveDown(2);
      let currentY = 115;

      // --- 1. PARTIES ---
      doc.fillColor(primaryColor).fontSize(11).font("Helvetica-Bold").text("1. PARTIES TO THE AGREEMENT", 40, currentY);
      currentY += 16;

      // Brand Box
      doc.rect(40, currentY, 250, 75).stroke(borderColor);
      doc.fillColor(darkColor).fontSize(9).font("Helvetica-Bold").text("BRAND / SPONSOR", 50, currentY + 8);
      doc.fillColor(grayColor).fontSize(8).font("Helvetica")
        .text(`Name: ${agreement.brandSnapshot?.fullName || "—"}`, 50, currentY + 22)
        .text(`Email: ${agreement.brandSnapshot?.email || "—"}`, 50, currentY + 34)
        .text(`Location: ${agreement.brandSnapshot?.location || "—"}`, 50, currentY + 46)
        .text(`GSTIN: ${agreement.brandSnapshot?.gstNumber || "N/A"}`, 50, currentY + 58);

      // Creator Box
      doc.rect(305, currentY, 250, 75).stroke(borderColor);
      doc.fillColor(darkColor).fontSize(9).font("Helvetica-Bold").text("CREATOR / INFLUENCER", 315, currentY + 8);
      doc.fillColor(grayColor).fontSize(8).font("Helvetica")
        .text(`Name: ${agreement.creatorSnapshot?.fullName || "—"}`, 315, currentY + 22)
        .text(`Handle: @${agreement.creatorSnapshot?.handle || agreement.creatorSnapshot?.instagramHandle || "—"}`, 315, currentY + 34)
        .text(`Niche / Category: ${agreement.creatorSnapshot?.category || "—"}`, 315, currentY + 46)
        .text(`Location: ${agreement.creatorSnapshot?.location || "—"}`, 315, currentY + 58);

      currentY += 88;

      // --- 2. CAMPAIGN SCOPE ---
      doc.fillColor(primaryColor).fontSize(11).font("Helvetica-Bold").text("2. CAMPAIGN SCOPE & DETAILS", 40, currentY);
      currentY += 16;

      doc.rect(40, currentY, 515, 45).stroke(borderColor);
      doc.fillColor(darkColor).fontSize(9).font("Helvetica-Bold").text(agreement.campaignSnapshot?.title || "Campaign", 50, currentY + 8);
      doc.fillColor(grayColor).fontSize(8).font("Helvetica")
        .text(agreement.campaignSnapshot?.description || "No description provided.", 50, currentY + 20, { width: 495, height: 20 });

      currentY += 56;

      // --- 3. DELIVERABLES ---
      doc.fillColor(primaryColor).fontSize(11).font("Helvetica-Bold").text("3. AGREED DELIVERABLES", 40, currentY);
      currentY += 16;

      // Table Header
      doc.rect(40, currentY, 515, 18).fill(lightBg);
      doc.fillColor(darkColor).fontSize(8).font("Helvetica-Bold")
        .text("DELIVERABLE TYPE", 50, currentY + 5)
        .text("REQUIRED QUANTITY", 250, currentY + 5, { align: "center", width: 120 })
        .text("STATUS", 420, currentY + 5, { align: "right", width: 120 });

      currentY += 18;

      const deliverables = agreement.deliverablesSnapshot || [];
      deliverables.forEach((item) => {
        doc.rect(40, currentY, 515, 18).stroke(borderColor);
        doc.fillColor(grayColor).fontSize(8).font("Helvetica")
          .text(item.type, 50, currentY + 5)
          .text(String(item.requiredQuantity || 1), 250, currentY + 5, { align: "center", width: 120 })
          .text(item.status || "APPROVED", 420, currentY + 5, { align: "right", width: 120 });
        currentY += 18;
      });

      currentY += 10;

      // --- 4. FINANCIAL STRUCTURE ---
      doc.fillColor(primaryColor).fontSize(11).font("Helvetica-Bold").text("4. FINANCIAL TERMS & ESCROW SUMMARY", 40, currentY);
      currentY += 16;

      const fin = agreement.financialsSnapshot || {};
      doc.rect(40, currentY, 165, 48).stroke(borderColor);
      doc.fillColor(grayColor).fontSize(7).font("Helvetica").text("CREATOR RECEIVES", 48, currentY + 8);
      doc.fillColor(greenColor).fontSize(13).font("Helvetica-Bold").text(`Rs. ${Number(fin.creatorAmount || 0).toLocaleString("en-IN")}`, 48, currentY + 20);
      doc.fillColor(grayColor).fontSize(6.5).font("Helvetica").text("80% Net Creator Compensation", 48, currentY + 36);

      doc.rect(215, currentY, 165, 48).stroke(borderColor);
      doc.fillColor(grayColor).fontSize(7).font("Helvetica").text("PRAVIXO FEE (20%)", 223, currentY + 8);
      doc.fillColor(darkColor).fontSize(13).font("Helvetica-Bold").text(`Rs. ${Number(fin.pravixoFee || 0).toLocaleString("en-IN")}`, 223, currentY + 20);
      doc.fillColor(grayColor).fontSize(6.5).font("Helvetica").text("Platform escrow & admin fee", 223, currentY + 36);

      doc.rect(390, currentY, 165, 48).stroke(borderColor);
      doc.fillColor(grayColor).fontSize(7).font("Helvetica").text("TOTAL BRAND PAYMENT", 398, currentY + 8);
      doc.fillColor(primaryColor).fontSize(13).font("Helvetica-Bold").text(`Rs. ${Number(fin.brandTotal || 0).toLocaleString("en-IN")}`, 398, currentY + 20);
      doc.fillColor(grayColor).fontSize(6.5).font("Helvetica").text("Total escrow deposit required", 398, currentY + 36);

      currentY += 58;

      // --- 5. SIGNATURES RECORD ---
      doc.fillColor(primaryColor).fontSize(11).font("Helvetica-Bold").text("5. COMPLETED DIGITAL SIGNATURES", 40, currentY);
      currentY += 16;

      // Signatures 3-Column Block
      const sigs = [
        { role: "BRAND", sig: agreement.brandSignature, label: agreement.brandSnapshot?.fullName },
        { role: "CREATOR", sig: agreement.creatorSignature, label: agreement.creatorSnapshot?.fullName },
        { role: "PRAVIXO ADMIN", sig: agreement.adminSignature, label: agreement.adminSignature?.name || "Compliance Officer" },
      ];

      sigs.forEach((item, idx) => {
        const x = 40 + idx * 175;
        doc.rect(x, currentY, 165, 65).fillAndStroke(lightBg, borderColor);

        doc.fillColor(darkColor).fontSize(8).font("Helvetica-Bold").text(item.role, x + 8, currentY + 8);
        doc.fillColor(greenColor).fontSize(7.5).font("Helvetica-Bold").text("[X] ELECTRONICALLY ACCEPTED", x + 8, currentY + 20);
        doc.fillColor(grayColor).fontSize(7).font("Helvetica")
          .text(`Signer: ${item.sig?.name || item.label || "—"}`, x + 8, currentY + 32)
          .text(`Date: ${item.sig?.signedAt ? new Date(item.sig.signedAt).toLocaleDateString() : "—"}`, x + 8, currentY + 42)
          .text(`Method: ${item.sig?.signatureMethod || "DIGITAL_ACCEPTANCE"}`, x + 8, currentY + 52);
      });

      // --- PAGE 2: TERMS AND CONDITIONS ---
      doc.addPage();

      doc.fillColor(primaryColor).fontSize(12).font("Helvetica-Bold").text("STANDARD PLATFORM COLLABORATION TERMS", 40, 40);
      doc.fillColor(grayColor).fontSize(8).font("Helvetica").text(`Document Reference: ${agreement.agreementId} • Version ${agreement.version}`, 40, 54);
      doc.moveDown(1.5);

      let termY = 70;
      (agreement.terms || []).forEach((term) => {
        doc.fillColor(darkColor).fontSize(8.5).font("Helvetica-Bold").text(term.title, 40, termY);
        termY += 12;
        doc.fillColor(grayColor).fontSize(7.5).font("Helvetica").text(term.content, 40, termY, {
          width: 515,
          align: "justify",
        });
        termY += doc.heightOfString(term.content, { width: 515 }) + 8;
      });

      // Footer note
      doc.fontSize(7).fillColor(grayColor).text(
        `Certified by Pravixo Platform. Digitally executed and locked on ${new Date(agreement.fullySignedAt || Date.now()).toISOString()}.`,
        40,
        780,
        { align: "center", width: 515 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Upload a PDF Buffer to Cloudinary as an authenticated raw/pdf resource
 * @param {Buffer} buffer - PDF Buffer
 * @param {string} publicId - Deterministic filename / public ID
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadAgreementPdf = (buffer, publicId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "agreements",
        public_id: publicId,
        resource_type: "raw",
        format: "pdf",
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};
