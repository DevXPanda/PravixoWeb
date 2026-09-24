import React, { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../components/auth/AuthProvider";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Textarea } from "../components/ui/TextArea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/Dialog";
import { toast } from "sonner";
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  ChevronLeft,
  MessageCircle,
  ExternalLink,
  Film,
  Sparkles,
  Camera,
  Calendar,
  IndianRupee,
  ShieldCheck,
  Check,
  X,
  Loader2,
  RefreshCw,
  Eye,
  AlertCircle,
  ArrowRight,
  Filter,
} from "lucide-react";

export default function CollaborationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, user, loading: authLoading } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL"); // 'ALL' | 'in_progress' | 'completed' | 'paid' | 'pending'
  const [campaignFilter, setCampaignFilter] = useState(searchParams.get("campaignId") || "ALL");
  const [refreshKey, setRefreshKey] = useState(0);

  // Deliverables Review Modal states
  const [selectedCollabForSubmissions, setSelectedCollabForSubmissions] = useState(null);
  const [collabSubmissionsList, setCollabSubmissionsList] = useState([]);
  const [collabMeta, setCollabMeta] = useState(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [reviewingSubmissionId, setReviewingSubmissionId] = useState(null);
  const [rejectingSubmission, setRejectingSubmission] = useState(null);
  const [submissionRejectionReason, setSubmissionRejectionReason] = useState("");

  const userRole = profile?.role || "brand";

  // Fetch collaborations
  const [collaborations, setCollaborations] = useState([]);
  const [loadingCollabs, setLoadingCollabs] = useState(true);

  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (apiUrl.endsWith("/api")) apiUrl = apiUrl.slice(0, -4);
    return `${apiUrl}${url}`;
  };

  const getGenderAvatar = (seed) => {
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed || "PravixoUser"}`;
  };

  const fetchCollaborations = async () => {
    if (!profile?._id) return;
    setLoadingCollabs(true);
    try {
      if (userRole === "brand") {
        const res = await api.get(`/connections/brand/${profile._id}/approved?k=${refreshKey}`);
        setCollaborations(res.data?.data || []);
      } else {
        const res = await api.get(`/connections/creator/${profile._id}/requests?k=${refreshKey}`);
        const accepted = (res.data?.data || []).filter((c) => c.status === "accepted");
        setCollaborations(accepted);
      }
    } catch (err) {
      console.error("Fetch collaborations error:", err);
      toast.error("Failed to load collaborations.");
    } finally {
      setLoadingCollabs(false);
    }
  };

  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login?redirect=/collaborations");
    }
  }, [user, authLoading, navigate]);

  React.useEffect(() => {
    if (profile?._id) {
      fetchCollaborations();
    }
  }, [profile?._id, refreshKey]);

  // Load Submissions for Proof Review Modal
  const loadSubmissions = async (collabId) => {
    if (!collabId) return;
    setLoadingSubmissions(true);
    try {
      const res = await api.get(`/submissions/${collabId}/submissions`);
      if (res.data?.success && res.data.data) {
        setCollabSubmissionsList(res.data.data.submissions || []);
        setCollabMeta(res.data.data);
      }
    } catch (err) {
      console.error("Load submissions error:", err);
      toast.error("Failed to load submissions for this collaboration.");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  React.useEffect(() => {
    if (selectedCollabForSubmissions?._id) {
      loadSubmissions(selectedCollabForSubmissions._id);
    }
  }, [selectedCollabForSubmissions]);

  // Approve Deliverable Handler
  const handleApproveSubmission = async (submissionId) => {
    if (!submissionId) return;
    setReviewingSubmissionId(submissionId);
    try {
      const res = await api.patch(`/submissions/${submissionId}/approve`);
      if (res.data?.success) {
        toast.success(res.data.message || "Deliverable approved successfully!");
        if (selectedCollabForSubmissions?._id) {
          loadSubmissions(selectedCollabForSubmissions._id);
        }
        setRefreshKey((k) => k + 1);
      }
    } catch (err) {
      console.error("Approve submission error:", err);
      toast.error(err.response?.data?.message || "Failed to approve deliverable.");
    } finally {
      setReviewingSubmissionId(null);
    }
  };

  // Reject / Request Rework Handler
  const handleRejectSubmission = async () => {
    if (!rejectingSubmission?._id) return;
    if (!submissionRejectionReason.trim()) {
      toast.error("Please enter a constructive rework reason for the creator.");
      return;
    }
    setReviewingSubmissionId(rejectingSubmission._id);
    try {
      const res = await api.patch(`/submissions/${rejectingSubmission._id}/reject`, {
        rejectionReason: submissionRejectionReason.trim(),
      });
      if (res.data?.success) {
        toast.success("Rework feedback sent to creator!");
        setRejectingSubmission(null);
        setSubmissionRejectionReason("");
        if (selectedCollabForSubmissions?._id) {
          loadSubmissions(selectedCollabForSubmissions._id);
        }
        setRefreshKey((k) => k + 1);
      }
    } catch (err) {
      console.error("Reject submission error:", err);
      toast.error(err.response?.data?.message || "Failed to request rework.");
    } finally {
      setReviewingSubmissionId(null);
    }
  };

  // Extract unique campaigns for filter dropdown
  const uniqueCampaigns = useMemo(() => {
    const map = new Map();
    collaborations.forEach((c) => {
      if (c.campaign?._id && c.campaign?.title) {
        map.set(c.campaign._id, c.campaign.title);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [collaborations]);

  // Filtered Collaborations
  const filteredCollabs = useMemo(() => {
    return collaborations.filter((collab) => {
      const partner = userRole === "brand" ? collab.creatorProfile : collab.brandProfile;
      const partnerName = (partner?.fullName || partner?.name || "").toLowerCase();
      const partnerHandle = (partner?.handle || partner?.email || "").toLowerCase();
      const campaignTitle = (collab.campaign?.title || "").toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        query === "" ||
        partnerName.includes(query) ||
        partnerHandle.includes(query) ||
        campaignTitle.includes(query);

      const matchesCampaign =
        campaignFilter === "ALL" || collab.campaign?._id === campaignFilter;

      const isPaid =
        collab.payment?.paymentStatus === "held_in_escrow" ||
        collab.payment?.paymentStatus === "released" ||
        collab.payment?.paymentStatus === "payout_released";

      let matchesStatus = true;
      if (statusFilter === "in_progress") {
        matchesStatus = !collab.allDeliverablesCompleted;
      } else if (statusFilter === "completed") {
        matchesStatus = Boolean(collab.allDeliverablesCompleted);
      } else if (statusFilter === "paid") {
        matchesStatus = isPaid;
      } else if (statusFilter === "payment_pending") {
        matchesStatus = !isPaid;
      }

      return matchesSearch && matchesCampaign && matchesStatus;
    });
  }, [collaborations, searchQuery, statusFilter, campaignFilter, userRole]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* HEADER & BACK BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <button
            onClick={() => navigate(userRole === "creator" ? "/dashboard/creator" : "/dashboard/brand")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5 text-foreground">
            <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            Approved Collaborations & Deliverables
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage active creator partnerships, review uploaded proof videos/posts, verify deliverables, and release escrow payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRefreshKey((k) => k + 1);
              toast.info("Refreshing collaborations...");
            }}
            className="rounded-full text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(userRole === "creator" ? "/browse" : "/dashboard/brand?section=campaigns")}
            className="rounded-full gradient-sunset text-white font-bold text-xs shadow-glow flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" /> {userRole === "creator" ? "Find Campaigns" : "New Campaign"}
          </Button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Total Collaborations
          </span>
          <div className="text-2xl font-black text-foreground font-display">
            {collaborations.length}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Approved & active deals</span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
            Completed Deliverables
          </span>
          <div className="text-2xl font-black text-emerald-600 font-display">
            {collaborations.filter((c) => c.allDeliverablesCompleted).length}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">All assets verified</span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block mb-1">
            In Progress
          </span>
          <div className="text-2xl font-black text-amber-600 font-display">
            {collaborations.filter((c) => !c.allDeliverablesCompleted).length}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Pending creator upload/review</span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider block mb-1">
            Escrow Protected
          </span>
          <div className="text-2xl font-black text-foreground font-display flex items-center gap-1">
            <ShieldCheck className="h-6 w-6 text-primary" /> 100%
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Secure milestone protection</span>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS BAR */}
      <div className="p-4 rounded-3xl border border-border bg-card/80 backdrop-blur-md shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={`Search by ${userRole === "brand" ? "creator name, handle" : "brand name"}, or campaign...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs rounded-full h-9 bg-background/80"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Campaign Filter */}
            {uniqueCampaigns.length > 0 && (
              <select
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
                aria-label="Filter by campaign"
                className="h-9 px-3 rounded-full border border-border bg-background text-xs font-semibold text-foreground focus:outline-none"
              >
                <option value="ALL">All Campaigns ({uniqueCampaigns.length})</option>
                {uniqueCampaigns.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.title}
                  </option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="h-9 px-3 rounded-full border border-border bg-background text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed Deliverables</option>
              <option value="paid">Paid (Escrow)</option>
              <option value="payment_pending">Payment Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* COLLABORATIONS LIST / CARDS */}
      {loadingCollabs ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">Loading collaborations & deliverables...</p>
        </div>
      ) : filteredCollabs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card">
          <Users className="mx-auto h-10 w-10 text-muted-foreground/30 mb-2" />
          <h3 className="font-display text-base font-bold text-foreground">No Collaborations Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "ALL" || campaignFilter !== "ALL"
              ? "No collaborations matched your selected search filters."
              : "You do not have any active approved collaborations yet."}
          </p>
          {(searchQuery || statusFilter !== "ALL" || campaignFilter !== "ALL") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setCampaignFilter("ALL");
              }}
              className="mt-4 rounded-full text-xs"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCollabs.map((collab) => {
            const partner = userRole === "brand" ? collab.creatorProfile : collab.brandProfile;
            const partnerId = partner?._id || collab.creatorId?._id || collab.creatorId;
            const payment = collab.payment;
            const isPaid =
              payment?.paymentStatus === "held_in_escrow" ||
              payment?.paymentStatus === "released" ||
              payment?.paymentStatus === "payout_released";

            const campaign = collab.campaign;
            const deliverables = campaign?.deliverables;

            return (
              <div
                key={collab._id}
                className="rounded-3xl border border-border bg-card p-5 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between gap-4 relative overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Top Row: Partner Info & Status Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          resolveImageUrl(partner?.avatarUrl) ||
                          getGenderAvatar(partner?.fullName || partner?.name || "Partner")
                        }
                        alt=""
                        className="h-11 w-11 rounded-2xl object-cover border border-border/80 shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getGenderAvatar("Fallback");
                        }}
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-foreground truncate">
                          {partner?.fullName || partner?.name || "Partner"}
                        </h4>
                        <p className="text-[11px] text-muted-foreground truncate">
                          @{partner?.handle?.replace("@", "") || partner?.email || "partner"}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="secondary"
                      className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase shrink-0 border ${
                        isPaid
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}
                    >
                      {isPaid ? "✓ Paid (Escrow)" : "⏳ Payment Pending"}
                    </Badge>
                  </div>

                  {/* Campaign & Budget Box */}
                  {campaign && (
                    <div className="rounded-2xl bg-secondary/30 border border-border/60 p-3 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground truncate max-w-[190px]">
                          {campaign.title}
                        </span>
                        <span className="font-extrabold text-primary font-display whitespace-nowrap">
                          ₹{Number(collab.agreedAmount || campaign.totalBudget || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      {campaign.category && (
                        <span className="text-[10px] text-muted-foreground block capitalize">
                          Category: {campaign.category}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Deliverables Scope Box */}
                  <div className="rounded-2xl bg-primary/5 border border-primary/10 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <Film className="h-3.5 w-3.5" /> Deliverable Scope
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] uppercase px-2 py-0 border ${
                          collab.allDeliverablesCompleted
                            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-bold"
                            : "bg-primary/10 text-primary border-primary/20 font-semibold"
                        }`}
                      >
                        {collab.allDeliverablesCompleted ? "✓ All Approved" : "In Progress"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {deliverables && (
                        <>
                          {Number(deliverables.reels || 0) > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 text-[10px] font-bold">
                              🎬 {deliverables.reels} Reel{deliverables.reels > 1 ? "s" : ""}
                            </span>
                          )}
                          {Number(deliverables.posts || 0) > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 text-[10px] font-bold">
                              📸 {deliverables.posts} Post{deliverables.posts > 1 ? "s" : ""}
                            </span>
                          )}
                          {Number(deliverables.stories || 0) > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-pink-500/10 text-pink-600 text-[10px] font-bold">
                              📱 {deliverables.stories} Stor{deliverables.stories > 1 ? "ies" : "y"}
                            </span>
                          )}
                          {Number(deliverables.videos || 0) > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 text-[10px] font-bold">
                              📹 {deliverables.videos} Video{deliverables.videos > 1 ? "s" : ""}
                            </span>
                          )}
                        </>
                      )}

                      {!deliverables && collab.task && (
                        <span className="text-[11px] text-muted-foreground">
                          {collab.task.title || "Custom collaboration deliverables"}
                        </span>
                      )}
                    </div>

                    {deliverables?.notes && (
                      <p className="text-[10px] text-muted-foreground line-clamp-1 italic">
                        Note: {deliverables.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Action Controls */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1.5">
                    {collab.conversationId && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full text-xs px-3 font-semibold"
                        onClick={() => navigate(`/messages?conversationId=${collab.conversationId}`)}
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1 text-primary" /> Chat
                      </Button>
                    )}
                    {partnerId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-full text-xs px-2.5 font-semibold text-muted-foreground hover:text-foreground"
                        onClick={() => navigate(userRole === "brand" ? `/influencer/${partnerId}` : `/brand/${partnerId}`)}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <Button
                    size="sm"
                    className="h-8 rounded-full gradient-sunset text-white text-xs font-bold px-3.5 shadow-sm"
                    onClick={() => setSelectedCollabForSubmissions(collab)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" /> View Deliverables
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DELIVERABLES SUBMISSIONS & PROOF REVIEW MODAL */}
      <Dialog
        open={Boolean(selectedCollabForSubmissions)}
        onOpenChange={(open) => !open && setSelectedCollabForSubmissions(null)}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-border bg-card p-6 shadow-2xl">
          <DialogHeader className="shrink-0 pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="font-display text-lg font-bold flex items-center gap-2 text-foreground">
                  <Film className="h-5 w-5 text-primary" /> Deliverables Tracker & Proof Review
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Review submitted videos, reels, posts, and proof assets for{" "}
                  <strong className="text-foreground">
                    {selectedCollabForSubmissions?.creatorProfile?.fullName ||
                      selectedCollabForSubmissions?.creatorId?.fullName ||
                      "Creator"}
                  </strong>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1">
            {/* Deliverables Scope Overview Box */}
            {selectedCollabForSubmissions?.campaign?.deliverables && (
              <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/70 text-xs space-y-1.5">
                <span className="font-bold text-foreground text-xs block">Required Campaign Scope:</span>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {Number(selectedCollabForSubmissions.campaign.deliverables.reels || 0) > 0 && (
                    <Badge variant="secondary" className="text-[10px] font-bold bg-purple-500/10 text-purple-600">
                      🎬 {selectedCollabForSubmissions.campaign.deliverables.reels} Reel(s)
                    </Badge>
                  )}
                  {Number(selectedCollabForSubmissions.campaign.deliverables.posts || 0) > 0 && (
                    <Badge variant="secondary" className="text-[10px] font-bold bg-blue-500/10 text-blue-600">
                      📸 {selectedCollabForSubmissions.campaign.deliverables.posts} Post(s)
                    </Badge>
                  )}
                  {Number(selectedCollabForSubmissions.campaign.deliverables.stories || 0) > 0 && (
                    <Badge variant="secondary" className="text-[10px] font-bold bg-pink-500/10 text-pink-600">
                      📱 {selectedCollabForSubmissions.campaign.deliverables.stories} Story(ies)
                    </Badge>
                  )}
                  {Number(selectedCollabForSubmissions.campaign.deliverables.videos || 0) > 0 && (
                    <Badge variant="secondary" className="text-[10px] font-bold bg-amber-500/10 text-amber-600">
                      📹 {selectedCollabForSubmissions.campaign.deliverables.videos} Video(s)
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {loadingSubmissions ? (
              <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
                <Loader2 className="h-7 w-7 animate-spin text-primary mx-auto" />
                <p>Loading creator deliverables...</p>
              </div>
            ) : collabSubmissionsList.length === 0 ? (
              <div className="py-14 text-center rounded-2xl border border-dashed border-border p-6 bg-secondary/10">
                <Film className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="font-semibold text-xs text-foreground">No Deliverables Uploaded Yet</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  The creator has not yet uploaded draft proofs for this collaboration. Submissions will appear here once uploaded.
                </p>
              </div>
            ) : (
              collabSubmissionsList.map((sub) => {
                const isApproved = sub.status === "APPROVED";
                const isRejected = sub.status === "REJECTED";
                const isVideo =
                  sub.deliverableType === "REEL" ||
                  sub.deliverableType === "VIDEO" ||
                  sub.contentUrl?.match(/\.(mp4|mov|webm|avi|mkv)$/i);

                return (
                  <div
                    key={sub._id}
                    className="p-4 rounded-2xl border border-border/80 bg-secondary/15 hover:border-border transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                          {sub.deliverableType} · Version {sub.version || 1}
                        </span>
                        <Badge
                          className={`text-[10px] px-2 py-0.5 font-bold border ${
                            isApproved
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                              : isRejected
                              ? "bg-red-500/10 text-red-500 border-red-500/30"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          }`}
                        >
                          {isApproved ? "✓ Approved" : isRejected ? "Rework Needed" : "⏳ Under Review"}
                        </Badge>
                      </div>

                      <span className="text-[10px] text-muted-foreground font-mono">
                        Submitted: {new Date(sub.submittedAt || sub.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Media Preview Box */}
                    {sub.contentUrl && (
                      <div className="rounded-xl overflow-hidden bg-black/90 border border-border flex items-center justify-center max-h-[360px]">
                        {isVideo ? (
                          <video
                            src={resolveImageUrl(sub.contentUrl)}
                            controls
                            playsInline
                            className="max-h-[340px] w-auto object-contain rounded-xl"
                          />
                        ) : (
                          <img
                            src={resolveImageUrl(sub.contentUrl)}
                            alt="Submission"
                            className="max-h-[340px] w-auto object-contain rounded-xl cursor-pointer"
                            onClick={() => window.open(resolveImageUrl(sub.contentUrl), "_blank")}
                          />
                        )}
                      </div>
                    )}

                    {sub.caption && (
                      <div className="p-2.5 rounded-xl bg-background/60 border border-border/50 text-xs">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Creator Notes</span>
                        <p className="whitespace-pre-wrap">{sub.caption}</p>
                      </div>
                    )}

                    {isRejected && sub.rejectionReason && (
                      <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600">
                        <span className="text-[10px] uppercase font-bold block mb-0.5">Your Feedback to Creator:</span>
                        <p>{sub.rejectionReason}</p>
                      </div>
                    )}

                    {/* Action Controls for Brand */}
                    {userRole === "brand" && !isApproved && !isRejected && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={reviewingSubmissionId === sub._id}
                          onClick={() => {
                            setRejectingSubmission(sub);
                            setSubmissionRejectionReason("");
                          }}
                          className="rounded-full text-xs font-semibold h-8 border-red-500/30 text-red-600 hover:bg-red-500/10 px-4"
                        >
                          <X className="h-3.5 w-3.5 mr-1" /> Request Rework
                        </Button>
                        <Button
                          size="sm"
                          disabled={reviewingSubmissionId === sub._id}
                          onClick={() => handleApproveSubmission(sub._id)}
                          className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 px-5 shadow-sm"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          {reviewingSubmissionId === sub._id ? "Approving..." : "Approve Work"}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCollabForSubmissions(null)}
              className="rounded-full text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rework Reason Dialog */}
      <Dialog
        open={Boolean(rejectingSubmission)}
        onOpenChange={(open) => !open && setRejectingSubmission(null)}
      >
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-base font-bold text-foreground">
              Request Deliverable Rework
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide clear, constructive feedback on what the creator needs to change.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Textarea
              placeholder="Explain required changes (e.g., 'Please highlight the product logo clearly in the first 3 seconds...')"
              value={submissionRejectionReason}
              onChange={(e) => setSubmissionRejectionReason(e.target.value)}
              className="text-xs min-h-[100px] rounded-xl"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectingSubmission(null)}
              className="rounded-full text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={reviewingSubmissionId === rejectingSubmission?._id || !submissionRejectionReason.trim()}
              onClick={handleRejectSubmission}
              className="rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4"
            >
              {reviewingSubmissionId === rejectingSubmission?._id ? "Sending..." : "Submit Rework Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
