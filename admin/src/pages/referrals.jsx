import { useState, useEffect } from "react";
import api from "../lib/axios";
import { toast } from "sonner";
import {
  Gift,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
  Users,
  IndianRupee,
  RefreshCw,
  Sparkles,
  UserCheck,
  Award,
  ChevronLeft,
  ChevronRight,
  Ban,
  ShieldAlert,
  Percent,
  Link2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

export function ReferralsPage() {
  const [activeTab, setActiveTab] = useState("relationships"); // "relationships" | "signups"
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [relLoading, setRelLoading] = useState(false);
  const [relStatusFilter, setRelStatusFilter] = useState("all");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Dialogs
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    isEnabled: true,
    rewardAmount: 500,
    qualificationTrigger: "profile_verified",
    maxReferralsPerUser: 0,
  });

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Revoke Relationship Modal state
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchSettings();
    fetchRelationships();
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [statusFilter, page]);

  useEffect(() => {
    fetchRelationships();
  }, [relStatusFilter]);

  const fetchRelationships = async () => {
    try {
      setRelLoading(true);
      const res = await api.get("/admin/referrals/relationships", {
        params: { status: relStatusFilter },
      });
      if (res.data?.success) {
        setRelationships(res.data.relationships || []);
      }
    } catch (err) {
      console.error("Failed to load referral relationships:", err);
      toast.error("Failed to load referral relationships");
    } finally {
      setRelLoading(false);
    }
  };

  const handleRevokeRelationship = async () => {
    if (!revokeTarget) return;
    try {
      setRevoking(true);
      const res = await api.post(`/v1/admin/referrals/${revokeTarget.id}/revoke`, {
        reason: revokeReason || "fraud_suspected",
      });
      if (res.data?.status === "revoked") {
        toast.success("Referral relationship revoked successfully.");
        setRevokeTarget(null);
        setRevokeReason("");
        fetchRelationships();
      }
    } catch (err) {
      console.error("Revoke error:", err);
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to revoke relationship");
    } finally {
      setRevoking(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/referrals/stats");
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load referral stats:", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get("/admin/referrals/settings");
      if (res.data?.success && res.data.data) {
        setSettings(res.data.data);
        setSettingsForm({
          isEnabled: res.data.data.isEnabled ?? true,
          rewardAmount: res.data.data.rewardAmount ?? 500,
          qualificationTrigger: res.data.data.qualificationTrigger || "profile_verified",
          maxReferralsPerUser: res.data.data.maxReferralsPerUser || 0,
        });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  };

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/referrals", {
        params: {
          status: statusFilter,
          search: search.trim() || undefined,
          page,
          limit: 10,
        },
      });
      if (res.data?.success) {
        setReferrals(res.data.data.referrals || []);
        setPagination(res.data.data.pagination || { total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error("Failed to load referrals:", err);
      toast.error("Failed to load referrals list");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReferrals();
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setUpdatingSettings(true);
      const res = await api.put("/admin/referrals/settings", settingsForm);
      if (res.data?.success) {
        toast.success("Referral campaign settings updated successfully!");
        setSettings(res.data.data);
        setSettingsOpen(false);
      }
    } catch (err) {
      console.error("Failed to update settings:", err);
      toast.error(err.response?.data?.message || "Failed to update settings");
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleManualQualify = async (referralId) => {
    if (!confirm("Are you sure you want to manually qualify this referral and credit the reward?")) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.post(`/admin/referrals/${referralId}/qualify`);
      if (res.data?.success) {
        toast.success(res.data.message || "Referral qualified and reward credited!");
        fetchReferrals();
        fetchStats();
      }
    } catch (err) {
      console.error("Manual qualify error:", err);
      toast.error(err.response?.data?.message || "Failed to qualify referral");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectReferral = async () => {
    if (!rejectTarget) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/admin/referrals/${rejectTarget._id}/reject`, {
        reason: rejectReason || "Rejected by administrator",
      });
      if (res.data?.success) {
        toast.success("Referral rejected successfully.");
        setRejectTarget(null);
        setRejectReason("");
        fetchReferrals();
        fetchStats();
      }
    } catch (err) {
      console.error("Reject referral error:", err);
      toast.error(err.response?.data?.message || "Failed to reject referral");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Refer & Earn Management
                <Badge variant="outline" className="text-[10px] font-semibold text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
                  {settings?.isEnabled ? "Campaign Live" : "Campaign Paused"}
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monitor creator referrals, fraud protection, and configure referral rewards.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchStats();
              fetchReferrals();
            }}
            className="rounded-full h-9 text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setSettingsOpen(true)}
            className="rounded-full h-9 text-xs font-semibold gap-1.5 gradient-sunset text-white shadow-glow border-0 hover:opacity-90"
          >
            <Settings className="h-3.5 w-3.5" /> Campaign Settings
          </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Referrals */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm hover:border-border transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Referrals
            </span>
            <div className="h-9 w-9 rounded-2xl bg-secondary/80 flex items-center justify-center text-muted-foreground border border-border/50">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-foreground font-display">
            {stats?.totalReferrals ?? 0}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            Across <span className="font-semibold text-foreground">{stats?.totalUniqueReferrers ?? 0}</span> creators
          </p>
        </div>

        {/* Reward Credited */}
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5 shadow-sm hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Reward Credited
            </span>
            <div className="h-9 w-9 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display">
            {stats?.rewardCreditedCount ?? 0}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <span className="font-semibold text-foreground">{stats?.qualifiedCount ?? 0}</span> qualified creators
          </p>
        </div>

        {/* Pending Qualification */}
        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.03] p-5 shadow-sm hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Pending Qualification
            </span>
            <div className="h-9 w-9 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-amber-600 dark:text-amber-400 font-display">
            {stats?.registeredCount ?? 0}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Awaiting profile verification</p>
        </div>

        {/* Total Disbursed */}
        <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/[0.08] to-transparent p-5 shadow-sm hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
              Total Disbursed
            </span>
            <div className="h-9 w-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-foreground font-display">
            ₹{Number(stats?.totalRewardsDisbursed || 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Active reward: <span className="font-semibold text-foreground">₹{settings?.rewardAmount || 500}</span> / ref
          </p>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("relationships")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
            activeTab === "relationships"
              ? "gradient-sunset text-white shadow-glow"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <Link2 className="h-3.5 w-3.5" /> Referral Relationships ({relationships.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("signups")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
            activeTab === "signups"
              ? "gradient-sunset text-white shadow-glow"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <Gift className="h-3.5 w-3.5" /> Sign-up Rewards
        </button>
      </div>

      {/* VIEW 1: REFERRAL RELATIONSHIPS DASHBOARD */}
      {activeTab === "relationships" && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex items-center justify-between bg-card p-3.5 rounded-3xl border border-border shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">Relationship Status:</span>
              <select
                value={relStatusFilter}
                onChange={(e) => setRelStatusFilter(e.target.value)}
                className="h-9 rounded-full border border-border bg-secondary/40 px-3.5 py-1 text-xs font-semibold text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchRelationships}
              className="rounded-full h-8 text-xs gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh List
            </Button>
          </div>

          {/* Relationships Table */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/60">
                  <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12">
                    Referrer (Name / Type)
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12">
                    Referred User (Name / Type)
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12">
                    Commission %
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12">
                    Total Paid to Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12">
                    Created At
                  </TableHead>
                  <TableHead className="text-right pr-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relLoading ? (
                  [...Array(4)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7} className="py-4 px-6">
                        <Skeleton className="h-8 w-full rounded-xl" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : relationships.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-xs">
                      No referral relationships found.
                    </TableCell>
                  </TableRow>
                ) : (
                  relationships.map((rel) => {
                    const isRevoked = rel.status === "revoked";
                    return (
                      <TableRow key={rel.id} className="hover:bg-secondary/30 transition-colors">
                        {/* Referrer */}
                        <TableCell className="pl-6 py-4">
                          <div className="font-semibold text-xs text-foreground">
                            {rel.referrer_name}
                          </div>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold mt-1 px-2 py-0 border-border">
                            {rel.referrer_type}
                          </Badge>
                        </TableCell>

                        {/* Referred */}
                        <TableCell className="py-4">
                          <div className="font-semibold text-xs text-foreground">
                            {rel.referred_name}
                          </div>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold mt-1 px-2 py-0 border-border">
                            {rel.referred_type}
                          </Badge>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-4">
                          <Badge
                            className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                              rel.status === "active"
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : rel.status === "revoked"
                                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {rel.status}
                          </Badge>
                          {isRevoked && rel.revoke_reason && (
                            <p className="text-[10px] text-muted-foreground mt-1 italic">
                              Reason: {rel.revoke_reason}
                            </p>
                          )}
                        </TableCell>

                        {/* Commission % */}
                        <TableCell className="py-4 font-bold text-xs text-foreground">
                          {rel.commission_percent}%
                        </TableCell>

                        {/* Total Paid to Date */}
                        <TableCell className="py-4 font-extrabold text-xs text-emerald-500">
                          ₹{Number(rel.total_commission_paid || 0).toLocaleString("en-IN")}
                        </TableCell>

                        {/* Created At */}
                        <TableCell className="py-4 text-xs text-muted-foreground">
                          {rel.created_at ? new Date(rel.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }) : "—"}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="pr-6 py-4 text-right">
                          {rel.status !== "revoked" ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setRevokeTarget(rel);
                                setRevokeReason("fraud_suspected");
                              }}
                              className="rounded-full h-8 text-xs font-semibold px-3.5 shadow-sm gap-1"
                            >
                              <Ban className="h-3 w-3" /> Revoke
                            </Button>
                          ) : (
                            <span className="text-[11px] font-semibold text-muted-foreground">
                              Revoked
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

      {/* VIEW 2: SIGN-UP REWARDS TABLE */}
      {activeTab === "signups" && (
        <div className="space-y-4">
      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3.5 rounded-3xl border border-border shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by creator name, email, or code..."
              className="pl-9 h-9 text-xs rounded-full bg-secondary/30 border-border/80 focus-visible:ring-primary"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" className="h-9 rounded-full text-xs px-4 font-semibold">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-full border border-border bg-secondary/40 px-3.5 py-1 text-xs font-semibold text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">All Referrals</option>
            <option value="registered">Pending Verification</option>
            <option value="qualified">Qualified</option>
            <option value="reward_credited">Reward Credited</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* REFERRALS TABLE */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/60">
              <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12">
                Referrer Creator
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12">
                Referred Creator
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12">
                Referral Code
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12">
                Joined Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12">
                Referral Status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12">
                Reward
              </TableHead>
              <TableHead className="text-right pr-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="pr-6"><Skeleton className="h-8 w-24 rounded-full ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : referrals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="h-12 w-12 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground">
                      <Gift className="h-6 w-6 text-muted-foreground/60" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">No referral records found</p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      When creators invite friends using their referral codes, the relationships and reward tracking will show up here.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              referrals.map((r) => {
                const referrer = r.referrerCreatorId || {};
                const referred = r.referredCreatorId || {};

                return (
                  <TableRow key={r._id} className="hover:bg-muted/20 transition-colors border-b border-border/40">
                    {/* Referrer */}
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {referrer.fullName?.[0] || "C"}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground">
                            {referrer.fullName || "Creator"}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {referrer.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Referred */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-500 shrink-0">
                          {referred.fullName?.[0] || "C"}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                            {referred.fullName || "Creator"}
                            {referred.verificationStatus === "verified" && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] px-1.5 py-0 font-semibold rounded-full">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {referred.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Code */}
                    <TableCell className="py-4">
                      <span className="font-mono font-black text-xs text-foreground tracking-wider px-2 py-1 rounded-lg bg-secondary/60 border border-border/80">
                        {r.referralCode}
                      </span>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-4">
                      <Badge
                        className={`rounded-full text-[11px] font-bold px-2.5 py-0.5 border ${
                          r.status === "reward_credited"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                            : r.status === "qualified"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25"
                            : r.status === "rejected"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
                        }`}
                      >
                        {r.status === "reward_credited"
                          ? "✓ Credited"
                          : r.status === "qualified"
                          ? "Qualified"
                          : r.status === "rejected"
                          ? "✕ Rejected"
                          : "Pending Verification"}
                      </Badge>
                      {r.rejectionReason && (
                        <span className="block text-[10px] text-red-500 mt-0.5 max-w-[160px] truncate" title={r.rejectionReason}>
                          {r.rejectionReason}
                        </span>
                      )}
                    </TableCell>

                    {/* Reward */}
                    <TableCell className="py-4 font-extrabold text-sm text-foreground">
                      ₹{r.reward?.rewardAmount || settings?.rewardAmount || 500}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status !== "reward_credited" && r.status !== "rejected" && (
                          <Button
                            size="sm"
                            className="rounded-full h-8 text-xs font-semibold px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            disabled={actionLoading}
                            onClick={() => handleManualQualify(r._id)}
                          >
                            Qualify & Credit
                          </Button>
                        )}

                        {r.status !== "reward_credited" && r.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-full h-8 text-xs px-2.5 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            disabled={actionLoading}
                            onClick={() => setRejectTarget(r)}
                          >
                            Reject
                          </Button>
                        )}

                        {r.status === "reward_credited" && (
                          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Settled
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border text-xs text-muted-foreground">
            <span>
              Showing page <strong className="text-foreground">{page}</strong> of <strong className="text-foreground">{pagination.totalPages}</strong> ({pagination.total} total)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-full h-8 text-xs px-3"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full h-8 text-xs px-3"
              >
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CAMPAIGN SETTINGS DIALOG */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Settings className="h-5 w-5 text-primary" /> Referral Campaign Settings
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure reward amounts, qualification conditions, and campaign availability.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs pt-1">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/20 p-3.5">
              <div>
                <Label className="text-xs font-bold text-foreground">Enable Referral Campaign</Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Allow creators to share links and earn referral rewards
                </p>
              </div>
              <input
                type="checkbox"
                checked={settingsForm.isEnabled}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, isEnabled: e.target.checked }))
                }
                className="h-5 w-5 rounded-lg border-input text-primary focus:ring-primary cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Reward Amount (₹) *</Label>
              <Input
                type="number"
                min={0}
                value={settingsForm.rewardAmount}
                onChange={(e) =>
                  setSettingsForm((prev) => ({
                    ...prev,
                    rewardAmount: Number(e.target.value),
                  }))
                }
                required
                className="text-sm font-bold rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground">
                Credited directly to the referrer's wallet upon qualification.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Qualification Condition *</Label>
              <select
                value={settingsForm.qualificationTrigger}
                onChange={(e) =>
                  setSettingsForm((prev) => ({
                    ...prev,
                    qualificationTrigger: e.target.value,
                  }))
                }
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="profile_verified">
                  Creator Profile Verified (Admin KYC approval)
                </option>
                <option value="on_register">
                  Instant on Registration (Instant payout)
                </option>
                <option value="first_collaboration_completed">
                  First Collaboration Completed
                </option>
                <option value="admin_manual">
                  Manual Admin Review Only
                </option>
              </select>
              <p className="text-[10px] text-muted-foreground">
                Condition required for the referral status to move from registered to qualified.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Max Referrals Per User (0 for unlimited)</Label>
              <Input
                type="number"
                min={0}
                value={settingsForm.maxReferralsPerUser}
                onChange={(e) =>
                  setSettingsForm((prev) => ({
                    ...prev,
                    maxReferralsPerUser: Number(e.target.value),
                  }))
                }
                className="rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setSettingsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updatingSettings}
                className="rounded-full text-xs font-bold gradient-sunset text-white shadow-glow border-0 px-5"
              >
                {updatingSettings ? "Saving..." : "Save Settings"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

        </div>
      )}

      {/* REJECT REFERRAL DIALOG */}
      <Dialog open={Boolean(rejectTarget)} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive font-bold text-lg">
              <XCircle className="h-5 w-5" /> Reject Referral
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Rejecting this referral will mark it as disqualified and prevent any reward credit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs pt-1">
            <div className="space-y-1.5">
              <Label className="font-semibold text-foreground">Rejection Reason</Label>
              <Input
                placeholder="e.g. Duplicate account, fake verification documents..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              onClick={() => setRejectTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="rounded-full text-xs font-bold px-5"
              disabled={actionLoading}
              onClick={handleRejectReferral}
            >
              {actionLoading ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REVOKE RELATIONSHIP DIALOG */}
      <Dialog open={Boolean(revokeTarget)} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive font-bold text-lg">
              <Ban className="h-5 w-5" /> Revoke Referral Relationship
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Once revoked, no further commissions will be calculated or paid for this relationship. Past commissions remain untouched.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs pt-1">
            <div className="rounded-xl border border-border bg-secondary/20 p-3 space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Referrer:</span>
                <span className="font-semibold text-foreground">{revokeTarget?.referrer_name} ({revokeTarget?.referrer_type})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Referred:</span>
                <span className="font-semibold text-foreground">{revokeTarget?.referred_name} ({revokeTarget?.referred_type})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commission:</span>
                <span className="font-semibold text-foreground">{revokeTarget?.commission_percent}%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-foreground">Revoke Reason</Label>
              <Input
                placeholder="e.g. fraud_suspected, terms_violation, admin_manual"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              onClick={() => setRevokeTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="rounded-full text-xs font-bold px-5"
              disabled={revoking}
              onClick={handleRevokeRelationship}
            >
              {revoking ? "Revoking..." : "Confirm Revoke"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReferralsPage;
