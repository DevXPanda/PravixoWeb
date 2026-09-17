import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { CreditCard, Search, ArrowUpRight, ShieldAlert, Award, RefreshCcw, Landmark, Activity, Terminal, Clock, CheckCircle2, Eye, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { AdminAgreementModal } from "@/components/agreements/AdminAgreementModal";

export function PaymentsPage() {
  useEffect(() => {
    document.title = "Escrow Payments & Webhooks — Pravixo Admin";
  }, []);

  const [activeTab, setActiveTab] = useState("stats");
  const [search, setSearch] = useState("");
  const [resolvingId, setResolvingId] = useState(null);

  // Webhook Simulation Panel States
  const [simEvent, setSimEvent] = useState("payment.captured");
  const [simPayload, setSimPayload] = useState('{\n  "order_id": "order_ABC123",\n  "payment_id": "pay_XYZ789"\n}');
  const [simulating, setSimulating] = useState(false);

  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState(null);
  const [webhookLogs, setWebhookLogs] = useState(null);
  const [collaborations, setCollaborations] = useState(null);
  const [selectedCollabRelease, setSelectedCollabRelease] = useState(null);
  const [releasingPayout, setReleasingPayout] = useState(false);
  const [confirmingPayoutCollab, setConfirmingPayoutCollab] = useState(null);
  const [selectedCollabAgreement, setSelectedCollabAgreement] = useState(null);

  // Task 14: Withdrawals State
  const [withdrawals, setWithdrawals] = useState(null);
  const [selectedWithdrawalAction, setSelectedWithdrawalAction] = useState(null); // { withdrawal, action: 'APPROVE' | 'REJECT' }
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);
  const [withdrawalNotes, setWithdrawalNotes] = useState("");
  const [withdrawalRejectReason, setWithdrawalRejectReason] = useState("");

  // Stat Breakdown Detail Modal State
  const [selectedStatDetail, setSelectedStatDetail] = useState(null);

  const fetchData = async () => {
    try {
      const [statsRes, paymentsRes, webhookRes, collabsRes, withdrawalsRes] = await Promise.all([
        api.get("/admin/revenue-stats"),
        api.get("/admin/payments"),
        api.get("/admin/webhook-logs").catch(() => ({ data: { success: true, data: [] } })),
        api.get("/admin/payments/collaborations").catch(() => ({ data: { success: true, data: [] } })),
        api.get("/admin/withdrawals").catch(() => ({ data: { success: true, data: [] } }))
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (paymentsRes.data.success) setPayments(paymentsRes.data.data);
      if (webhookRes.data.success) setWebhookLogs(webhookRes.data.data);
      if (collabsRes.data.success) setCollaborations(collabsRes.data.data);
      if (withdrawalsRes.data.success) setWithdrawals(withdrawalsRes.data.data);
    } catch (err) {
      console.error("Failed to fetch payments data", err);
    }
  };

  const handleProcessWithdrawal = async (e) => {
    if (e) e.preventDefault();
    if (!selectedWithdrawalAction) return;

    setProcessingWithdrawal(true);
    try {
      const { withdrawal, action } = selectedWithdrawalAction;
      const res = await api.post(`/admin/withdrawals/${withdrawal._id}/process`, {
        action,
        notes: withdrawalNotes,
        failureReason: withdrawalRejectReason,
      });

      if (res.data?.success) {
        toast.success(res.data.message || `Withdrawal ${action === "APPROVE" ? "completed" : "rejected"}.`);
        setSelectedWithdrawalAction(null);
        setWithdrawalNotes("");
        setWithdrawalRejectReason("");
        fetchData();
      }
    } catch (err) {
      console.error("Withdrawal processing error:", err);
      toast.error(err.response?.data?.message || "Failed to process withdrawal.");
    } finally {
      setProcessingWithdrawal(false);
    }
  };

  const handleReleasePayout = async (collab) => {
    setReleasingPayout(true);
    try {
      const res = await api.post(`/admin/payments/collaborations/${collab._id}/release`);
      if (res.data?.success) {
        toast.success(res.data.message || "Payout released successfully!");
        setConfirmingPayoutCollab(null);
        setSelectedCollabRelease(null);
        fetchData();
      }
    } catch (err) {
      console.error("Payout release error:", err);
      toast.error(err.response?.data?.message || "Failed to release payout.");
    } finally {
      setReleasingPayout(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = payments?.filter((p) => {
    const campaignTitle = p.campaign?.title?.toLowerCase() || "";
    const brandName = p.brand?.fullName?.toLowerCase() || "";
    const creatorName = p.creator?.fullName?.toLowerCase() || "";
    const searchLower = search.toLowerCase();

    const matchesSearch =
      !search ||
      campaignTitle.includes(searchLower) ||
      brandName.includes(searchLower) ||
      creatorName.includes(searchLower) ||
      p._id.includes(searchLower) ||
      p.payoutReference?.toLowerCase().includes(searchLower) ||
      p.gatewayOrderId?.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (activeTab === "holding") {
      return p.paymentStatus === "holding" || p.paymentStatus === "disputed";
    }
    if (activeTab === "released") {
      return p.paymentStatus === "completed" || p.paymentStatus === "released";
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "released":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "holding":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "invoice_generated":
        return "bg-amber/10 text-amber border-amber-500/20";
      case "disputed":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "refunded":
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleResolve = async (paymentId, resolution) => {
    setResolvingId(paymentId);
    try {
      await api.post(`/admin/payments/${paymentId}/resolve`, { resolution });
      toast.success(`Dispute resolved successfully: funds ${resolution === "release" ? "released" : "refunded"}`);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setResolvingId(null);
    }
  };

  const handleSimulateWebhook = async () => {
    setSimulating(true);
    try {
      await api.post("/payments/webhook", JSON.parse(simPayload));
      toast.success("Simulated webhook payload executed successfully!");
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Escrow Payments & Webhooks
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Audit campaign invoices, track payouts queue, simulate gateway webhooks, and resolve disputes.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border overflow-x-auto">
        {["stats", "withdrawals", "72_hour_releases", "holding", "released", "all", "webhooks"].map((tab) => (
          <button
            key={tab}
            className={`py-3 px-6 text-sm font-semibold capitalize border-b-2 transition-all duration-200 shrink-0 ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "stats"
              ? "Revenue Stats"
              : tab === "withdrawals"
              ? "Creator Withdrawals"
              : tab === "72_hour_releases"
              ? "72-Hour Release Queue"
              : tab === "holding"
              ? "Holding Escrows"
              : tab === "released"
              ? "Payout Queue"
              : tab === "webhooks"
              ? "Webhook Simulation"
              : "All Transactions"}
          </button>
        ))}
      </div>

      {/* REVENUE STATS TAB */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          {!stats ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-6 border border-border rounded-3xl bg-card">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-32" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Today's Revenue */}
              <div
                onClick={() =>
                  setSelectedStatDetail({
                    key: "today",
                    title: "Today's Revenue",
                    description: "All payments and campaign invoices captured in the last 24 hours.",
                    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                  })
                }
                className="p-6 border border-border rounded-3xl bg-card shadow-sm space-y-2 hover:border-primary/50 hover:bg-secondary/20 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-wider group-hover:text-primary transition-colors">
                  <span>Today's Revenue</span>
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold">₹{stats.todayRevenue.toLocaleString()}</p>
                  <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    Breakdown <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">Click to view originating payments</p>
              </div>

              {/* Weekly Revenue */}
              <div
                onClick={() =>
                  setSelectedStatDetail({
                    key: "weekly",
                    title: "Weekly Revenue",
                    description: "Total invoice volume captured across all campaigns over the past 7 days.",
                    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                  })
                }
                className="p-6 border border-border rounded-3xl bg-card shadow-sm space-y-2 hover:border-primary/50 hover:bg-secondary/20 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-wider group-hover:text-primary transition-colors">
                  <span>Weekly Revenue</span>
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold">₹{stats.weeklyRevenue.toLocaleString()}</p>
                  <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    Breakdown <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">Click to view originating payments</p>
              </div>

              {/* Monthly Revenue */}
              <div
                onClick={() =>
                  setSelectedStatDetail({
                    key: "monthly",
                    title: "Monthly Revenue",
                    description: "Gross volume processed across campaigns in the past 30 days.",
                    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                  })
                }
                className="p-6 border border-border rounded-3xl bg-card shadow-sm space-y-2 hover:border-primary/50 hover:bg-secondary/20 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-wider group-hover:text-primary transition-colors">
                  <span>Monthly Revenue</span>
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold">₹{stats.monthlyRevenue.toLocaleString()}</p>
                  <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    Breakdown <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">Click to view originating payments</p>
              </div>

              {/* Total Gross Volume */}
              <div
                onClick={() =>
                  setSelectedStatDetail({
                    key: "total",
                    title: "Total Gross Volume",
                    description: "Lifetime total gross payments captured from brands across all campaigns.",
                    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                  })
                }
                className="p-6 border border-border rounded-3xl bg-card shadow-sm space-y-2 hover:border-primary/50 hover:bg-secondary/20 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-wider group-hover:text-primary transition-colors">
                  <span>Total Gross Volume</span>
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                  <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    Breakdown <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">Click to inspect origin & details</p>
              </div>

              {/* Commission Earned (20%) */}
              <div
                onClick={() =>
                  setSelectedStatDetail({
                    key: "commission",
                    title: "Platform Commission Earned (20%)",
                    description: "20% platform revenue deducted from campaign budgets across all processed payments.",
                    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                  })
                }
                className="p-6 border border-border rounded-3xl bg-card shadow-sm space-y-2 border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex justify-between items-center text-emerald-600 text-xs font-bold uppercase tracking-wider">
                  <span>Commission Earned (20%)</span>
                  <Award className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold text-emerald-600">₹{stats.platformCommissionEarned.toLocaleString()}</p>
                  <span className="text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    Breakdown <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
                <p className="text-[11px] text-emerald-600/80">Click to view commission source</p>
              </div>

              {/* Money In Holding */}
              <div
                onClick={() =>
                  setSelectedStatDetail({
                    key: "holding",
                    title: "Money In Holding",
                    description: "Funds currently held in escrow pending creator milestone completion or review.",
                    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                  })
                }
                className="p-6 border border-border rounded-3xl bg-card shadow-sm space-y-2 border-blue-500/20 bg-blue-500/5 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex justify-between items-center text-blue-500 text-xs font-bold uppercase tracking-wider">
                  <span>Money In Holding</span>
                  <RefreshCcw className="h-4 w-4 animate-spin-slow group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold text-blue-500">₹{stats.paymentsInHolding.toLocaleString()}</p>
                  <span className="text-[10px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    Breakdown <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
                <p className="text-[11px] text-blue-500/80">Click to view escrow holding list</p>
              </div>

              {/* Released Payments */}
              <div
                onClick={() =>
                  setSelectedStatDetail({
                    key: "released",
                    title: "Released Payments",
                    description: "Completed project payouts disbursed and credited to creator accounts.",
                    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                  })
                }
                className="p-6 border border-border rounded-3xl bg-card shadow-sm space-y-2 hover:border-primary/50 hover:bg-secondary/20 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-wider group-hover:text-primary transition-colors">
                  <span>Released Payments</span>
                  <CreditCard className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold">₹{stats.releasedPayments.toLocaleString()}</p>
                  <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    Breakdown <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">Click to view completed releases</p>
              </div>

              {/* Disputed Payments */}
              <div
                onClick={() =>
                  setSelectedStatDetail({
                    key: "disputed",
                    title: "Disputed Payments",
                    description: "Campaign escrow amounts flagged with active disputes awaiting admin resolution.",
                    badgeColor: "bg-red-500/10 text-red-500 border-red-500/20",
                  })
                }
                className="p-6 border border-border rounded-3xl bg-card shadow-sm space-y-2 border-red-500/20 bg-red-500/5 hover:border-red-500/50 hover:bg-red-500/10 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex justify-between items-center text-red-500 text-xs font-bold uppercase tracking-wider">
                  <span>Disputed Payments</span>
                  <ShieldAlert className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold text-red-500">₹{stats.disputedPayments.toLocaleString()}</p>
                  <span className="text-[10px] font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    Breakdown <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
                <p className="text-[11px] text-red-500/80">Click to view disputed payments</p>
              </div>
            </div>
          )}

          {/* STAT DETAIL MODAL: WHERE THE MONEY COMES FROM */}
          <Dialog open={Boolean(selectedStatDetail)} onOpenChange={(open) => !open && setSelectedStatDetail(null)}>
            <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col rounded-3xl p-6 bg-card border border-border">
              <DialogHeader>
                <div className="flex items-center justify-between pr-6">
                  <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                    <Landmark className="h-5 w-5 text-primary" /> {selectedStatDetail?.title} Breakdown
                  </DialogTitle>
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                  {selectedStatDetail?.description}
                </DialogDescription>
              </DialogHeader>

              {selectedStatDetail && (() => {
                const now = Date.now();
                const oneDay = 24 * 60 * 60 * 1000;
                const oneWeek = 7 * oneDay;
                const oneMonth = 30 * oneDay;

                // Filter payments according to clicked card
                const relevantPayments = (payments || []).filter((p) => {
                  const isPaid =
                    p.paymentStatus !== "pending" &&
                    p.paymentStatus !== "invoice_generated" &&
                    p.paymentStatus !== "refunded";

                  if (!isPaid) return false;

                  const timeDiff = now - new Date(p.createdAt).getTime();

                  if (selectedStatDetail.key === "today") return timeDiff <= oneDay;
                  if (selectedStatDetail.key === "weekly") return timeDiff <= oneWeek;
                  if (selectedStatDetail.key === "monthly") return timeDiff <= oneMonth;
                  if (selectedStatDetail.key === "total") return true;
                  if (selectedStatDetail.key === "commission") return (p.platformCommissionAmount || 0) > 0;
                  if (selectedStatDetail.key === "holding") return p.paymentStatus === "holding";
                  if (selectedStatDetail.key === "released") return p.paymentStatus === "completed" || p.paymentStatus === "released";
                  if (selectedStatDetail.key === "disputed") return p.paymentStatus === "disputed";
                  return true;
                });

                const totalSum = relevantPayments.reduce((acc, p) => {
                  if (selectedStatDetail.key === "commission") return acc + (p.platformCommissionAmount || 0);
                  return acc + (p.grossAmount || 0);
                }, 0);

                return (
                  <div className="space-y-4 pt-1 overflow-y-auto">
                    {/* Summary bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-secondary/30 border border-border/70 text-xs">
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase font-bold block">Relevant Transactions</span>
                        <span className="font-bold text-foreground text-sm font-display">{relevantPayments.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase font-bold block">Filtered Total</span>
                        <span className="font-bold text-emerald-600 text-sm font-display">
                          ₹{Number(totalSum).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase font-bold block">Currency</span>
                        <span className="font-bold text-foreground text-sm font-mono">INR (₹)</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase font-bold block">Platform Share</span>
                        <span className="font-bold text-foreground text-sm font-mono">20% Escrow</span>
                      </div>
                    </div>

                    {/* Breakdown table */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Originating Campaign Transactions ({relevantPayments.length})
                      </h4>

                      {relevantPayments.length === 0 ? (
                        <div className="text-center py-10 text-xs text-muted-foreground border border-dashed border-border rounded-2xl p-6">
                          No transactions found matching this revenue category.
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-b border-border/50 text-[11px]">
                                <TableHead className="pl-4 h-9">Campaign & Brand (Source)</TableHead>
                                <TableHead className="h-9">Creator (Recipient)</TableHead>
                                <TableHead className="h-9">Status</TableHead>
                                <TableHead className="h-9">Date</TableHead>
                                <TableHead className="h-9 text-right pr-4">Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody className="text-xs divide-y divide-border/30">
                              {relevantPayments.map((p) => {
                                const brandName = p.brand?.fullName || p.brand?.name || "Direct Brand";
                                const creatorName = p.creator?.fullName || p.creator?.name || "Creator";
                                const campaignTitle = p.campaign?.title || p.task?.title || "Campaign Collaboration";
                                const amountToDisplay =
                                  selectedStatDetail.key === "commission"
                                    ? p.platformCommissionAmount || 0
                                    : p.grossAmount || 0;

                                return (
                                  <TableRow key={p._id} className="hover:bg-secondary/15">
                                    <TableCell className="pl-4 py-3 font-medium text-foreground">
                                      <div className="font-bold text-xs">{campaignTitle}</div>
                                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <span className="font-semibold text-foreground">{brandName}</span>
                                        {p.invoiceNumber && <span className="font-mono text-[10px] text-primary">({p.invoiceNumber})</span>}
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-3 text-xs text-foreground">
                                      <div className="font-semibold">{creatorName}</div>
                                      {p.creator?.handle && (
                                        <div className="text-[10px] text-muted-foreground font-mono">@{p.creator.handle.replace(/^@/, '')}</div>
                                      )}
                                    </TableCell>
                                    <TableCell className="py-3">
                                      <Badge
                                        className={`rounded-full text-[9px] font-bold px-2 py-0.5 border ${
                                          p.paymentStatus === "completed" || p.paymentStatus === "released"
                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                            : p.paymentStatus === "holding"
                                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                            : p.paymentStatus === "disputed"
                                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                                            : "bg-secondary text-muted-foreground"
                                        }`}
                                      >
                                        {p.paymentStatus?.toUpperCase()}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="py-3 text-muted-foreground text-[11px] whitespace-nowrap">
                                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      }) : "-"}
                                    </TableCell>
                                    <TableCell className="py-3 text-right pr-4 font-bold text-emerald-600 whitespace-nowrap text-sm">
                                      ₹{Number(amountToDisplay).toLocaleString("en-IN")}
                                      {selectedStatDetail.key === "commission" && (
                                        <span className="block text-[10px] text-muted-foreground font-normal">
                                          (Gross: ₹{Number(p.grossAmount || 0).toLocaleString("en-IN")})
                                        </span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => setSelectedStatDetail(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* WEBHOOK SIMULATOR TAB */}
      {activeTab === "webhooks" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="p-6 border border-border rounded-3xl bg-card space-y-4">
            <h3 className="font-display text-base font-bold flex items-center gap-1.5">
              <Terminal className="h-5 w-5 text-primary" /> Simulate Webhook Event
            </h3>
            <p className="text-xs text-muted-foreground">
              Paste order details below to trigger gateway captured webhook alerts.
            </p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Event Type</label>
                <select
                  className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none"
                  value={simEvent}
                  onChange={(e) => setSimEvent(e.target.value)}
                >
                  <option value="payment.captured">payment.captured</option>
                  <option value="payment.authorized">payment.authorized</option>
                  <option value="refund.processed">refund.processed</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Payload JSON</label>
                <Textarea
                  rows={6}
                  className="font-mono text-xs rounded-xl bg-background border-border"
                  value={simPayload}
                  onChange={(e) => setSimPayload(e.target.value)}
                />
              </div>
              <Button
                className="w-full rounded-full gradient-sunset border-0 text-white shadow-glow text-xs font-semibold h-9"
                disabled={simulating}
                onClick={handleSimulateWebhook}
              >
                {simulating ? "Executing simulation..." : "Trigger Gateway Webhook"}
              </Button>
            </div>
          </div>

          <div className="p-6 border border-border rounded-3xl bg-card space-y-4">
            <h3 className="font-display text-base font-bold flex items-center gap-1.5">
              <Activity className="h-5 w-5 text-primary" /> Gateway Webhook Logs
            </h3>
            <div className="overflow-y-auto max-h-[400px] border border-border/40 rounded-2xl bg-secondary/5 divide-y divide-border/30">
              {!webhookLogs ? (
                <div className="p-4 text-center text-xs text-muted-foreground">Loading webhook trails...</div>
              ) : webhookLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">No webhook payloads logged yet.</div>
              ) : (
                webhookLogs.map((log) => (
                  <div key={log._id} className="p-3 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground font-mono">{log.event}</span>
                      <Badge variant="outline" className={`text-[9px] capitalize px-1 bg-emerald-500/10 text-emerald-600 border-0`}>
                        {log.status}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground bg-background p-1.5 rounded-md truncate">
                      {log.payload}
                    </p>
                    <span className="text-[9px] text-muted-foreground block text-right">
                      {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 72-HOUR RELEASE QUEUE TAB (TASK 10) */}
      {activeTab === "72_hour_releases" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 className="font-display text-base font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> 72-Hour Creator Payment Review & Release Queue
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Collaborations where all campaign deliverables were approved. Track 72-hour review countdown and release eligibility.
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search campaign, creator, brand..."
                className="pl-9 rounded-full bg-secondary/50 border-0 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Campaign / Collaboration</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Agreed Payout (80%)</TableHead>
                  <TableHead>Pravixo Fee (20%)</TableHead>
                  <TableHead>Total Paid</TableHead>
                  <TableHead>Deliverables Status</TableHead>
                  <TableHead>72-Hour Review Status</TableHead>
                  <TableHead className="text-right pr-6">Admin Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!collaborations ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6"><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                      <TableCell className="text-right pr-6"><Skeleton className="h-8 w-24 ml-auto rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : collaborations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-16 text-center">
                      <Clock className="mx-auto h-8 w-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No completed collaborations in 72-hour review queue right now
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  collaborations
                    .filter((collab) => {
                      if (!search) return true;
                      const s = search.toLowerCase();
                      return (
                        collab.campaign?.title?.toLowerCase().includes(s) ||
                        collab.brand?.fullName?.toLowerCase().includes(s) ||
                        collab.creator?.fullName?.toLowerCase().includes(s) ||
                        collab._id?.includes(s)
                      );
                    })
                    .map((collab) => {
                      const isEligible = collab.paymentReleaseStatus === "ELIGIBLE_FOR_RELEASE";
                      return (
                        <TableRow key={collab._id}>
                          <TableCell className="pl-6 py-4">
                            <span className="block font-bold text-foreground text-xs">
                              {collab.campaign?.title || "Campaign Collaboration"}
                            </span>
                            <span className="block font-mono text-[9px] text-muted-foreground">
                              {collab._id}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs font-semibold">{collab.brand?.fullName || "Brand"}</TableCell>
                          <TableCell className="text-xs font-semibold">{collab.creator?.fullName || "Creator"}</TableCell>
                          <TableCell className="font-bold text-emerald-600">
                            ₹{Number(collab.creatorAmount || 0).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            ₹{Number(collab.pravixoFee || 0).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="font-semibold text-xs">
                            ₹{Number(collab.brandTotal || 0).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-full text-[9px] font-bold">
                              ✓ 100% Approved
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {collab.paymentReleaseStatus === "RELEASED" ? (
                              <div className="flex flex-col items-start gap-1">
                                <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 rounded-full text-[10px] font-bold px-2.5 py-0.5">
                                  ✓ RELEASED
                                </Badge>
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                  Wallet Credited
                                </span>
                              </div>
                            ) : isEligible ? (
                              <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 rounded-full text-[10px] font-bold px-2.5 py-0.5">
                                ✓ ELIGIBLE FOR RELEASE
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 rounded-full text-[10px] font-bold px-2.5 py-0.5">
                                ⏳ WAITING 72 HOURS
                              </Badge>
                            )}
                            {collab.paymentReleaseEligibleAt && !isEligible && collab.paymentReleaseStatus !== "RELEASED" && (
                              <span className="block text-[9px] text-muted-foreground mt-0.5">
                                Eligible: {format(new Date(collab.paymentReleaseEligibleAt), "MMM d, yyyy h:mm a")}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              {isEligible && collab.paymentReleaseStatus !== "RELEASED" && (
                                <Button
                                  size="sm"
                                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 px-3 flex items-center gap-1 shadow-sm"
                                  onClick={() => setConfirmingPayoutCollab(collab)}
                                >
                                  <Landmark className="h-3.5 w-3.5" /> Release
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full border-border text-foreground hover:bg-secondary text-xs font-bold h-8 px-3 flex items-center gap-1"
                                onClick={() => setSelectedCollabAgreement(collab)}
                              >
                                <FileText className="h-3.5 w-3.5 text-primary" /> Agreement
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full border-primary/30 text-primary hover:bg-primary/10 text-xs font-bold h-8 px-3 flex items-center gap-1"
                                onClick={() => setSelectedCollabRelease(collab)}
                              >
                                <Eye className="h-3.5 w-3.5" /> Review
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* CREATOR WITHDRAWALS TAB (TASK 14) */}
      {activeTab === "withdrawals" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary" /> Creator Withdrawal Requests
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review, disburse, or decline creator withdrawal requests from available wallet balances.
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by creator, reference ID..."
                className="pl-9 rounded-full bg-secondary/50 border-0 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Reference ID</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Requested Amount</TableHead>
                  <TableHead>Bank / Payout Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!withdrawals ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right pr-6"><Skeleton className="h-8 w-24 ml-auto rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : withdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center">
                      <Landmark className="mx-auto h-8 w-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No creator withdrawal requests found
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  withdrawals
                    .filter((w) => {
                      const s = search.toLowerCase();
                      return (
                        !s ||
                        w.referenceId?.toLowerCase().includes(s) ||
                        w.creatorId?.fullName?.toLowerCase().includes(s) ||
                        w.creatorId?.email?.toLowerCase().includes(s) ||
                        w.payoutReference?.toLowerCase().includes(s)
                      );
                    })
                    .map((w) => {
                      const isPending = w.status === "PENDING" || w.status === "PROCESSING";
                      const bank = w.bankDetails || w.bankDetailsSnapshot || {};
                      return (
                        <TableRow key={w._id}>
                          <TableCell className="pl-6 py-4">
                            <span className="block font-mono text-xs font-bold text-foreground">
                              {w.referenceId}
                            </span>
                            {w.payoutReference && (
                              <span className="block font-mono text-[10px] text-emerald-600">
                                Payout Ref: {w.payoutReference}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="block font-semibold text-xs text-foreground">
                              {w.creatorId?.fullName || "Creator"}
                            </span>
                            <span className="block text-[10px] text-muted-foreground">
                              {w.creatorId?.email}
                            </span>
                          </TableCell>
                          <TableCell className="font-extrabold text-sm text-foreground">
                            ₹{Number(w.amount || 0).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="space-y-0.5">
                              <span className="block font-semibold text-foreground">
                                {bank.bankName || "Bank Transfer"}
                              </span>
                              <span className="block text-[10px] text-muted-foreground">
                                {bank.accountHolderName} • {bank.accountNumberMasked || (bank.accountNumber ? `••••${bank.accountNumber.slice(-4)}` : "")}
                              </span>
                              {bank.ifsc && (
                                <span className="block font-mono text-[9px] text-muted-foreground">
                                  IFSC: {bank.ifsc} {bank.upiId ? `• UPI: ${bank.upiId}` : ""}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`rounded-full text-[10px] font-bold px-2.5 py-0.5 border ${
                                w.status === "COMPLETED"
                                  ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                                  : w.status === "FAILED" || w.status === "CANCELLED"
                                  ? "bg-red-500/15 text-red-700 border-red-500/30"
                                  : "bg-amber-500/15 text-amber-700 border-amber-500/30"
                              }`}
                            >
                              {w.status === "COMPLETED"
                                ? "✓ COMPLETED"
                                : w.status === "FAILED"
                                ? "✕ REJECTED / FAILED"
                                : "⏳ PENDING"}
                            </Badge>
                            {w.failureReason && (
                              <span className="block text-[9px] text-red-500 mt-0.5 max-w-[140px] truncate" title={w.failureReason}>
                                {w.failureReason}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(w.requestedAt || w.createdAt), "MMM d, yyyy h:mm a")}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 px-3.5 shadow-sm"
                                  onClick={() => setSelectedWithdrawalAction({ withdrawal: w, action: "APPROVE" })}
                                >
                                  Process
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full border-red-500/30 text-red-600 hover:bg-red-500/10 text-xs font-bold h-8 px-3"
                                  onClick={() => setSelectedWithdrawalAction({ withdrawal: w, action: "REJECT" })}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground font-semibold">
                                {w.status === "COMPLETED" ? "Settled" : "Closed"}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* DATA TABLE (HOLDING, RELEASED, ALL) */}
      {activeTab !== "stats" && activeTab !== "webhooks" && activeTab !== "72_hour_releases" && activeTab !== "withdrawals" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID, campaign, ref..."
                className="pl-9 rounded-full bg-secondary/50 border-0 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Invoice Number</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Gross Amount</TableHead>
                  <TableHead>Platform Fee (20%)</TableHead>
                  <TableHead>Net Creator (80%)</TableHead>
                  <TableHead>Payment Status</TableHead>
                  {activeTab === "released" && <TableHead>Payout Reference</TableHead>}
                  <TableHead>Release Target</TableHead>
                  <TableHead className="text-right pr-6">Action / Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!filtered ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right pr-6"><Skeleton className="h-8 w-20 ml-auto rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-16 text-center">
                      <CreditCard className="mx-auto h-8 w-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No payments match this view
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <TableRow key={p._id}>
                      <td className="pl-6 py-4">
                        <span className="block font-semibold text-foreground text-xs">{p.invoiceNumber}</span>
                        <span className="block font-mono text-[9px] text-muted-foreground">{p._id}</span>
                      </td>
                      <TableCell className="font-semibold max-w-[120px] truncate">
                        {p.campaign?.title || "General"}
                      </TableCell>
                      <TableCell className="max-w-[110px] truncate">{p.brand?.fullName}</TableCell>
                      <TableCell className="max-w-[110px] truncate">{p.creator?.fullName}</TableCell>
                      <TableCell className="font-bold">₹{p.grossAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">₹{p.platformCommissionAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">₹{p.creatorAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`rounded-full text-[9px] uppercase font-bold border-0 ${getStatusColor(
                            p.paymentStatus
                          )}`}
                        >
                          {p.paymentStatus.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      {activeTab === "released" && (
                        <TableCell className="font-mono text-xs text-emerald-600 font-semibold">
                          {p.payoutReference || "—"}
                        </TableCell>
                      )}
                      <TableCell className="text-xs text-muted-foreground">
                        {p.holdingEndsAt ? format(new Date(p.holdingEndsAt), "MMM d, yyyy HH:mm") : "—"}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {p.paymentStatus === "disputed" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] h-7 px-3"
                              disabled={resolvingId === p._id}
                              onClick={() => handleResolve(p._id, "release")}
                            >
                              Release Payout
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full border-red-500/20 text-red-500 hover:bg-red-500/10 text-[10px] h-7 px-3"
                              disabled={resolvingId === p._id}
                              onClick={() => handleResolve(p._id, "refund")}
                            >
                              Refund Brand
                            </Button>
                          </div>
                        ) : p.paymentStatus === "holding" ? (
                          <span className="text-[10px] text-blue-500 font-semibold italic">
                            Holding Escrow
                          </span>
                        ) : p.paymentStatus === "completed" || p.paymentStatus === "released" ? (
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                            <Landmark className="h-3 w-3" /> Payout Settled
                          </span>
                        ) : p.paymentStatus === "refunded" ? (
                          <span className="text-[10px] text-slate-500 font-semibold">
                            Refunded
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* REVIEW PAYMENT RELEASE DETAILS DIALOG (TASK 10) */}
      <Dialog
        open={!!selectedCollabRelease}
        onOpenChange={(open) => !open && setSelectedCollabRelease(null)}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Clock className="h-5 w-5 text-primary" /> Review Payment Release
            </DialogTitle>
            <DialogDescription className="text-xs">
              Audit the 72-hour review period, deliverables status, and escrow amount breakdown.
            </DialogDescription>
          </DialogHeader>

          {selectedCollabRelease && (
            <div className="space-y-4 text-xs">
              {/* Campaign & Participant Overview */}
              <div className="rounded-2xl border border-border bg-secondary/10 p-4 space-y-2.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">
                      {selectedCollabRelease.campaign?.title || "Campaign Collaboration"}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Collaboration ID: {selectedCollabRelease._id}
                    </p>
                  </div>
                  {selectedCollabRelease.paymentReleaseStatus === "ELIGIBLE_FOR_RELEASE" ? (
                    <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 rounded-full font-bold text-[10px]">
                      ✓ ELIGIBLE FOR RELEASE
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 rounded-full font-bold text-[10px]">
                      ⏳ WAITING 72 HOURS
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Brand</span>
                    <span className="font-semibold text-foreground">{selectedCollabRelease.brand?.fullName}</span>
                    <span className="block text-[11px] text-muted-foreground">{selectedCollabRelease.brand?.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Creator</span>
                    <span className="font-semibold text-foreground">{selectedCollabRelease.creator?.fullName}</span>
                    <span className="block text-[11px] text-muted-foreground">{selectedCollabRelease.creator?.email}</span>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown (Agreed, Fee, Total) */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                <h5 className="font-bold text-foreground text-xs uppercase tracking-wider">
                  Agreed Escrow Financials
                </h5>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creator Allocation (80%):</span>
                    <span className="font-bold text-emerald-600 text-sm">
                      ₹{Number(selectedCollabRelease.creatorAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pravixo Platform Fee (20%):</span>
                    <span className="font-medium text-foreground">
                      ₹{Number(selectedCollabRelease.pravixoFee || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-border/40">
                    <span className="font-bold text-foreground">Total Paid by Brand:</span>
                    <span className="font-bold text-primary">
                      ₹{Number(selectedCollabRelease.brandTotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* 72-Hour Timeline Details */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
                <h5 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" /> Review Period Timeline
                </h5>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block">Deliverables Approved At:</span>
                    <span className="font-semibold text-foreground">
                      {selectedCollabRelease.approvalCompletedAt
                        ? format(new Date(selectedCollabRelease.approvalCompletedAt), "MMM d, yyyy h:mm a")
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Release Eligibility Target:</span>
                    <span className="font-semibold text-foreground">
                      {selectedCollabRelease.paymentReleaseEligibleAt
                        ? format(new Date(selectedCollabRelease.paymentReleaseEligibleAt), "MMM d, yyyy h:mm a")
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-secondary/20 border border-border/40 text-[11px]">
                  {selectedCollabRelease.paymentReleaseStatus === "ELIGIBLE_FOR_RELEASE" ? (
                    <div className="text-emerald-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      The 72-hour review period is complete. Creator payout of ₹{Number(selectedCollabRelease.creatorAmount || 0).toLocaleString("en-IN")} is eligible for Admin release.
                    </div>
                  ) : (
                    <div className="text-amber-700 font-semibold flex items-center gap-1.5">
                      <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                      The 72-hour protection review period is currently active. Funds remain securely held in escrow until the timer completes.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <Button
                  className="rounded-full px-5 text-xs font-semibold h-9"
                  variant="outline"
                  onClick={() => setSelectedCollabRelease(null)}
                >
                  Close Review
                </Button>

                {selectedCollabRelease.paymentReleaseStatus === "ELIGIBLE_FOR_RELEASE" ? (
                  <Button
                    className="rounded-full px-6 text-xs font-bold h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5"
                    onClick={() => setConfirmingPayoutCollab(selectedCollabRelease)}
                  >
                    <Landmark className="h-4 w-4" /> Release Payment (₹{Number(selectedCollabRelease.creatorAmount || 0).toLocaleString("en-IN")})
                  </Button>
                ) : selectedCollabRelease.paymentReleaseStatus === "RELEASED" ? (
                  <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 rounded-full font-bold text-[11px] px-3 py-1">
                    ✓ Payout Already Released
                  </Badge>
                ) : null}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION DIALOG FOR PAYOUT RELEASE (TASK 11) */}
      <Dialog
        open={!!confirmingPayoutCollab}
        onOpenChange={(open) => !open && !releasingPayout && setConfirmingPayoutCollab(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Landmark className="h-5 w-5 text-emerald-600" /> Confirm Creator Payment Release
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to release the agreed payout to the creator?
            </DialogDescription>
          </DialogHeader>

          {confirmingPayoutCollab && (
            <div className="space-y-4 text-xs pt-1">
              <div className="rounded-xl border border-border bg-secondary/15 p-3.5 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-border/40">
                  <span className="text-muted-foreground">Creator:</span>
                  <span className="font-bold text-foreground">{confirmingPayoutCollab.creator?.fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Creator Receives:</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    ₹{Number(confirmingPayoutCollab.creatorAmount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-muted-foreground">Pravixo Platform Fee:</span>
                  <span className="font-medium text-foreground">
                    ₹{Number(confirmingPayoutCollab.pravixoFee || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-border/30">
                  <span className="text-muted-foreground">Brand Paid:</span>
                  <span className="font-semibold text-foreground">
                    ₹{Number(confirmingPayoutCollab.brandTotal || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground italic">
                * Note: The Creator receives the full agreed amount (₹{Number(confirmingPayoutCollab.creatorAmount || 0).toLocaleString("en-IN")}). The platform fee is retained by Pravixo.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  className="rounded-full px-4 text-xs font-semibold h-8"
                  disabled={releasingPayout}
                  onClick={() => setConfirmingPayoutCollab(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="rounded-full px-5 text-xs font-bold h-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
                  disabled={releasingPayout}
                  onClick={() => handleReleasePayout(confirmingPayoutCollab)}
                >
                  {releasingPayout ? (
                    <>Releasing Payout...</>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Confirm & Release
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION / PROCESS DIALOG FOR WITHDRAWALS (TASK 14) */}
      <Dialog
        open={!!selectedWithdrawalAction}
        onOpenChange={(open) => !open && !processingWithdrawal && setSelectedWithdrawalAction(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Landmark className={`h-5 w-5 ${selectedWithdrawalAction?.action === "APPROVE" ? "text-emerald-600" : "text-red-500"}`} />
              {selectedWithdrawalAction?.action === "APPROVE" ? "Process & Disburse Withdrawal" : "Decline Withdrawal Request"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {selectedWithdrawalAction?.action === "APPROVE"
                ? "Confirm bank payout execution and mark the withdrawal as completed."
                : "Reject withdrawal request and immediately restore reserved funds back to the creator's wallet."}
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawalAction && (
            <form onSubmit={handleProcessWithdrawal} className="space-y-4 text-xs pt-1">
              <div className="rounded-xl border border-border bg-secondary/15 p-3.5 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-border/40">
                  <span className="text-muted-foreground">Creator:</span>
                  <span className="font-bold text-foreground">{selectedWithdrawalAction.withdrawal.creatorId?.fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Withdrawal Amount:</span>
                  <span className="font-extrabold text-emerald-600 text-sm">
                    ₹{Number(selectedWithdrawalAction.withdrawal.amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Reference ID:</span>
                  <span className="font-mono text-muted-foreground">{selectedWithdrawalAction.withdrawal.referenceId}</span>
                </div>
                <div className="pt-2 border-t border-border/40 text-[11px] space-y-1">
                  <span className="font-semibold text-foreground block">Destination Bank:</span>
                  <p className="text-muted-foreground">
                    {selectedWithdrawalAction.withdrawal.bankDetails?.bankName || selectedWithdrawalAction.withdrawal.bankDetailsSnapshot?.bankName} (
                    {selectedWithdrawalAction.withdrawal.bankDetails?.accountHolderName || selectedWithdrawalAction.withdrawal.bankDetailsSnapshot?.accountHolderName})
                    <br />
                    Acc: {selectedWithdrawalAction.withdrawal.bankDetailsSnapshot?.accountNumberMasked || "••••"} | IFSC: {selectedWithdrawalAction.withdrawal.bankDetails?.ifsc || selectedWithdrawalAction.withdrawal.bankDetailsSnapshot?.ifsc}
                  </p>
                </div>
              </div>

              {selectedWithdrawalAction.action === "REJECT" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Rejection Reason *</label>
                  <Textarea
                    placeholder="e.g. Invalid bank account details, verification pending..."
                    required
                    rows={3}
                    value={withdrawalRejectReason}
                    onChange={(e) => setWithdrawalRejectReason(e.target.value)}
                    className="text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    This reason will be sent to the creator and funds will be returned to their available balance.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Admin Notes / Bank Reference (Optional)</label>
                  <Input
                    placeholder="e.g. Bank UTR / Transfer Reference Number"
                    value={withdrawalNotes}
                    onChange={(e) => setWithdrawalNotes(e.target.value)}
                    className="text-xs"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full px-4 text-xs font-semibold h-8"
                  disabled={processingWithdrawal}
                  onClick={() => setSelectedWithdrawalAction(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={processingWithdrawal}
                  className={`rounded-full px-5 text-xs font-bold h-8 text-white shadow-sm flex items-center gap-1.5 ${
                    selectedWithdrawalAction.action === "APPROVE"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {processingWithdrawal ? (
                    <>Processing...</>
                  ) : selectedWithdrawalAction.action === "APPROVE" ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Disburse
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-3.5 w-3.5" /> Decline & Restore Funds
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin Agreement Modal */}
      {selectedCollabAgreement && (
        <AdminAgreementModal
          isOpen={Boolean(selectedCollabAgreement)}
          onClose={() => setSelectedCollabAgreement(null)}
          connectionId={selectedCollabAgreement._id}
        />
      )}
    </div>
  );
}
