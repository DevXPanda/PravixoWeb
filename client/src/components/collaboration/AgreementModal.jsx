import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Sparkles,
  Building,
  User,
  ExternalLink,
  Layers,
  Clock,
  PenTool,
  Check,
  AlertCircle,
  Download,
  FileCheck,
  RotateCcw,
  CheckCheck,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";

export function AgreementModal({ isOpen, onClose, connectionId }) {
  const { profile, user } = useAuth();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signing, setSigning] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [signatureType, setSignatureType] = useState("DIGITAL_ACCEPTANCE"); // "DIGITAL_ACCEPTANCE" | "DRAWN_SIGNATURE"
  const [signatureName, setSignatureName] = useState("");

  const fetchAgreement = async () => {
    if (!connectionId) return;
    try {
      setLoading(true);
      const res = await api.post(`/api/agreements/collaboration/${connectionId}/generate`);
      if (res.data?.success && res.data.data) {
        setAgreement(res.data.data);
        setSelectedVersion(res.data.data.version);
      }

      const versionsRes = await api.get(`/api/agreements/collaboration/${connectionId}/versions`);
      if (versionsRes.data?.success) {
        setVersions(versionsRes.data.data || []);
      }
    } catch (err) {
      console.error("Fetch agreement error:", err);
      toast.error(err.response?.data?.message || "Failed to load collaboration agreement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && connectionId) {
      fetchAgreement();
      setAgreedToTerms(false);
    }
  }, [isOpen, connectionId]);

  const handlePrint = () => {
    window.print();
  };

  const handleVersionChange = (vNum) => {
    const found = versions.find((v) => v.version === Number(vNum));
    if (found) {
      setAgreement(found);
      setSelectedVersion(found.version);
      setAgreedToTerms(false);
    }
  };

  const handleSignAgreement = async () => {
    if (!agreement?._id) return;
    if (!agreedToTerms) {
      toast.error("Please confirm that you agree to the agreement terms before signing.");
      return;
    }

    try {
      setSigning(true);
      const res = await api.post(`/api/agreements/${agreement._id}/sign`, {
        signatureMethod: signatureType === "DRAWN_SIGNATURE" ? "DRAWN_SIGNATURE" : "DIGITAL_ACCEPTANCE",
        signatureName: signatureName?.trim() || undefined,
      });
      if (res.data?.success && res.data.data) {
        setAgreement(res.data.data);
        toast.success(res.data.message || "Agreement signed successfully!");
        
        const versionsRes = await api.get(`/api/agreements/collaboration/${connectionId}/versions`);
        if (versionsRes.data?.success) {
          setVersions(versionsRes.data.data || []);
        }
      }
    } catch (err) {
      console.error("Sign agreement error:", err);
      toast.error(err.response?.data?.message || "Failed to sign agreement.");
    } finally {
      setSigning(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!agreement?._id) return;
    try {
      setGeneratingPdf(true);
      const res = await api.post(`/api/agreements/${agreement._id}/generate-pdf`);
      if (res.data?.success && res.data.data) {
        setAgreement(res.data.data);
        toast.success("Final Signed PDF generated successfully!");
        if (res.data.data.pdfUrl) {
          window.open(res.data.data.pdfUrl, "_blank");
        }
      }
    } catch (err) {
      console.error("Generate PDF error:", err);
      toast.error(err.response?.data?.message || "Failed to generate agreement PDF.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const currentUserId = profile?._id || user?._id || user?.id;
  const currentUserRole = profile?.role || user?.role;
  const isBrand = currentUserRole === "brand";
  const isCreator = currentUserRole === "creator";

  const brandSigned = Boolean(agreement?.brandSignature?.signed);
  const creatorSigned = Boolean(agreement?.creatorSignature?.signed);
  const adminSigned = Boolean(agreement?.adminSignature?.signed);
  const isFullySigned = agreement?.signatureStatus === "FULLY_SIGNED";

  const hasCurrentUserSigned = (isBrand && brandSigned) || (isCreator && creatorSigned);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border border-border bg-card shadow-2xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-base font-bold text-foreground">
                Pravixo Collaboration Agreement
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground">
                Official verified platform contract & snapshot terms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {versions.length > 1 && (
              <div className="flex items-center gap-1.5 mr-2">
                <span className="text-xs text-muted-foreground font-medium">Version:</span>
                <select
                  value={selectedVersion || ""}
                  onChange={(e) => handleVersionChange(e.target.value)}
                  className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground outline-none"
                >
                  {versions.map((v) => (
                    <option key={v._id} value={v.version}>
                      v{v.version} ({v.signatureStatus === "FULLY_SIGNED" ? "✓ Fully Signed" : v.signatureStatus === "PARTIALLY_SIGNED" ? "Partially Signed" : "Pending"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isFullySigned && (
              agreement.pdfUrl ? (
                <Button
                  size="sm"
                  onClick={() => window.open(agreement.pdfUrl, "_blank")}
                  className="rounded-full text-xs font-bold gap-1.5 h-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  View Signed PDF
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleGeneratePdf}
                  disabled={generatingPdf}
                  className="rounded-full text-xs font-bold gap-1.5 h-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                >
                  <FileCheck className="h-3.5 w-3.5" />
                  {generatingPdf ? "Generating PDF..." : "Generate Signed PDF"}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="rounded-full text-xs font-semibold gap-1.5 h-8 border-border"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-xs font-medium">Loading official agreement snapshot...</p>
          </div>
        ) : !agreement ? (
          <div className="py-16 text-center text-muted-foreground space-y-2">
            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
            <p className="text-sm font-semibold text-foreground">No Agreement Found</p>
            <p className="text-xs">
              Agreement can only be generated once campaign collaboration terms are accepted.
            </p>
          </div>
        ) : (
          <div className="p-6 sm:p-10 space-y-6 text-foreground print:p-0 print:space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-foreground">
                    PRAVIXO
                  </h3>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Verified Platform Agreement
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Creator & Brand Influencer Marketing Agreement
                </p>
              </div>

              <div className="text-left sm:text-right text-xs space-y-1 bg-secondary/30 sm:bg-transparent p-3 sm:p-0 rounded-2xl sm:rounded-none">
                <div className="font-mono font-bold text-sm text-foreground">
                  {agreement.agreementId}
                </div>
                <div className="text-muted-foreground flex items-center sm:justify-end gap-1 text-[11px]">
                  <Calendar className="h-3 w-3" />
                  Generated: {new Date(agreement.generatedAt || agreement.createdAt).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })}
                </div>
                <div className="text-primary font-semibold text-[11px]">
                  Version {agreement.version} (Immutable Snapshot)
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <PenTool className="h-3.5 w-3.5 text-primary" /> Agreement Signatures & Acceptance
                </span>
                {agreement.signatureStatus === "FULLY_SIGNED" ? (
                  <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 rounded-full font-bold text-xs px-3 py-1">
                    ✓ FULLY SIGNED
                  </Badge>
                ) : agreement.signatureStatus === "PARTIALLY_SIGNED" ? (
                  <Badge className="bg-blue-500/15 text-blue-700 border-blue-500/30 rounded-full font-bold text-xs px-3 py-1">
                    PARTIALLY SIGNED
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 rounded-full font-bold text-xs px-3 py-1">
                    PENDING SIGNATURES
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  brandSigned ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-secondary/15"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Brand</span>
                    {brandSigned ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                        <Check className="h-3.5 w-3.5" /> Signed
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium flex items-center gap-1 text-[11px]">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground truncate font-medium">
                    {agreement.brandSnapshot?.fullName}
                  </p>
                  {brandSigned && agreement.brandSignature?.signedAt && (
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {new Date(agreement.brandSignature.signedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  creatorSigned ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-secondary/15"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Creator</span>
                    {creatorSigned ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                        <Check className="h-3.5 w-3.5" /> Signed
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium flex items-center gap-1 text-[11px]">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground truncate font-medium">
                    {agreement.creatorSnapshot?.fullName}
                  </p>
                  {creatorSigned && agreement.creatorSignature?.signedAt && (
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {new Date(agreement.creatorSignature.signedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  adminSigned ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-secondary/15"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Pravixo Admin</span>
                    {adminSigned ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                        <Check className="h-3.5 w-3.5" /> Signed
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium flex items-center gap-1 text-[11px]">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground truncate font-medium">
                    {adminSigned ? agreement.adminSignature?.name : "Pravixo Compliance"}
                  </p>
                  {adminSigned && agreement.adminSignature?.signedAt && (
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {new Date(agreement.adminSignature.signedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {!hasCurrentUserSigned && (isBrand || isCreator) && (
                <div className="pt-3 border-t border-border/60 space-y-4 print:hidden bg-secondary/10 -mx-4 -mb-4 p-4 sm:-mx-5 sm:-mb-5 rounded-b-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground">Choose Signature Method:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSignatureType("DIGITAL_ACCEPTANCE")}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                          signatureType === "DIGITAL_ACCEPTANCE"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-background border border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        ⚡ 1-Click Acceptance
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSignatureType("DRAWN_SIGNATURE");
                          if (!signatureName) setSignatureName(profile?.fullName || user?.fullName || "");
                        }}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                          signatureType === "DRAWN_SIGNATURE"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-background border border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        ✍️ Legal E-Signature
                      </button>
                    </div>
                  </div>

                  {signatureType === "DRAWN_SIGNATURE" && (
                    <div className="space-y-2 p-3 bg-card border border-border rounded-xl">
                      <label className="text-[11px] font-semibold text-muted-foreground block">
                        Type Your Legal Full Name:
                      </label>
                      <input
                        type="text"
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        placeholder="Enter full legal name"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-1 focus:ring-primary outline-none"
                      />
                      {signatureName && (
                        <div className="mt-2 p-3 bg-secondary/20 rounded-lg border border-border/50 text-center">
                          <span className="text-[10px] text-muted-foreground block mb-0.5">E-Signature Preview:</span>
                          <span className="font-serif italic text-lg text-primary tracking-wide">
                            {signatureName}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-foreground select-none">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="leading-snug text-muted-foreground">
                      I have read, understood, and legally agree to the terms of this Collaboration Agreement (Version {agreement.version}).
                    </span>
                  </label>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSignAgreement}
                      disabled={signing || !agreedToTerms || (signatureType === "DRAWN_SIGNATURE" && !signatureName.trim())}
                      className="rounded-full px-6 text-xs font-bold h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md gap-1.5"
                    >
                      {signing ? (
                        <>Signing Agreement...</>
                      ) : (
                        <>
                          <PenTool className="h-3.5 w-3.5" /> Confirm & Legally Sign
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {hasCurrentUserSigned && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold flex items-center justify-between gap-2 print:hidden">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>You have successfully signed this agreement version (v{agreement.version}).</span>
                  </div>
                  {isFullySigned && agreement.pdfUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(agreement.pdfUrl, "_blank")}
                      className="h-7 text-xs border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/20 rounded-lg gap-1 font-bold"
                    >
                      <Download className="h-3 w-3" /> PDF Document
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Building className="h-3.5 w-3.5 text-primary" /> Brand / Sponsor
                </div>
                <div className="font-display font-bold text-base text-foreground">
                  {agreement.brandSnapshot?.fullName || "Brand Name"}
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {agreement.brandSnapshot?.email && <p>Email: {agreement.brandSnapshot.email}</p>}
                  {agreement.brandSnapshot?.location && <p>Location: {agreement.brandSnapshot.location}</p>}
                  {agreement.brandSnapshot?.companySize && <p>Company Size: {agreement.brandSnapshot.companySize}</p>}
                  {agreement.brandSnapshot?.gstNumber && <p className="font-mono text-[11px]">GSTIN: {agreement.brandSnapshot.gstNumber}</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <User className="h-3.5 w-3.5 text-primary" /> Creator / Influencer
                </div>
                <div className="font-display font-bold text-base text-foreground">
                  {agreement.creatorSnapshot?.fullName || "Creator Name"}
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {agreement.creatorSnapshot?.handle && <p>Handle: @{agreement.creatorSnapshot.handle}</p>}
                  {agreement.creatorSnapshot?.category && <p>Niche: {agreement.creatorSnapshot.category}</p>}
                  {agreement.creatorSnapshot?.instagramHandle && <p>Instagram: @{agreement.creatorSnapshot.instagramHandle}</p>}
                  {agreement.creatorSnapshot?.location && <p>Location: {agreement.creatorSnapshot.location}</p>}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-secondary/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Campaign Scope
                </span>
                <Badge variant="outline" className="text-[10px] font-semibold">
                  {agreement.campaignSnapshot?.category || "General"}
                </Badge>
              </div>
              <h4 className="font-display font-bold text-base text-foreground">
                {agreement.campaignSnapshot?.title}
              </h4>
              {agreement.campaignSnapshot?.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {agreement.campaignSnapshot.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Agreed Deliverables Breakdown
              </span>
              <div className="rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/40 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="px-4 py-2.5">Deliverable Type</th>
                      <th className="px-4 py-2.5 text-center">Required Quantity</th>
                      <th className="px-4 py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-card">
                    {agreement.deliverablesSnapshot?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
                          {item.type}
                        </td>
                        <td className="px-4 py-3 text-center font-bold">
                          {item.requiredQuantity}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                            {item.status || "REQUIRED"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Payment Terms & Financial Breakdown
              </span>
              {profile?.role === "creator" ? (
                <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">
                      Creator Compensation
                    </span>
                    <div className="font-display text-xl font-bold text-emerald-600">
                      ₹{Number(agreement.financialsSnapshot?.creatorAmount || 0).toLocaleString("en-IN")}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Full amount credited to creator wallet upon milestone/campaign release
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-border bg-secondary/30 p-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">
                      Creator Compensation
                    </span>
                    <div className="font-display text-xl font-bold text-emerald-600">
                      ₹{Number(agreement.financialsSnapshot?.creatorAmount || 0).toLocaleString("en-IN")}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Full amount credited to creator wallet upon release
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">
                      Pravixo Platform Fee (20%)
                    </span>
                    <div className="font-display text-xl font-bold text-foreground">
                      ₹{Number(agreement.financialsSnapshot?.pravixoFee || 0).toLocaleString("en-IN")}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Paid by Brand on top of Creator amount
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">
                      Total Brand Payment
                    </span>
                    <div className="font-display text-xl font-bold text-primary">
                      ₹{Number(agreement.financialsSnapshot?.brandTotal || 0).toLocaleString("en-IN")}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Total escrow deposit required
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Standard Platform Agreement Terms
              </span>
              <div className="space-y-3 text-xs leading-relaxed text-muted-foreground divide-y divide-border/30">
                {agreement.terms?.map((term) => (
                  <div key={term.sectionNumber} className="pt-3 first:pt-0">
                    <h5 className="font-semibold text-foreground mb-1">
                      {term.title}
                    </h5>
                    <p>{term.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-border/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Electronically generated & verified by Pravixo Platform
              </div>
              <div className="font-mono text-[10px]">
                Ref: {agreement.agreementId} • Version {agreement.version}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
