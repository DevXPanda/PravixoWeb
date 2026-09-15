import { useState, useEffect } from "react";
import api from "../lib/axios";
import { toast } from "sonner";
import {
  Gift,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
  Users,
  IndianRupee,
  RefreshCw,
  Award,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

function Card({ className = "", children, ...props }) {
  return (
    <div className={`rounded-2xl border border-border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

function CardHeader({ className = "", children, ...props }) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

function CardTitle({ className = "", children, ...props }) {
  return (
    <h3 className={`font-semibold leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

function CardContent({ className = "", children, ...props }) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function ReferralsPage() {
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
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

  useEffect(() => {
    fetchStats();
    fetchSettings();
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [statusFilter, page]);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/referrals/stats");
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load referral stats:", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get("/admin/referrals/settings");
      if (res.data.success && res.data.data) {
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
          limit: 12,
        },
      });
      if (res.data.success) {
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
      if (res.data.success) {
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
      if (res.data.success) {
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
      if (res.data.success) {
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
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" /> Refer & Earn Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track creator referrals, monitor fraud protection, and configure referral rewards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchStats();
              fetchReferrals();
            }}
            className="gap-1.5"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setSettingsOpen(true)}
            className="gap-1.5 bg-primary text-primary-foreground shadow-sm"
          >
            <Settings className="h-4 w-4" /> Campaign Settings
          </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Total Referrals
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{stats?.totalReferrals ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {stats?.totalUniqueReferrers ?? 0} referring creators
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Reward Credited
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-600">
              {stats?.rewardCreditedCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.qualifiedCount ?? 0} qualified creators
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Pending Qualification
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-amber-600">
              {stats?.registeredCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting profile verification</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-primary uppercase">
              Total Disbursed
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <IndianRupee className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">
              ₹{Number(stats?.totalRewardsDisbursed || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active reward: ₹{settings?.rewardAmount || 500} / ref
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by creator name, email, or code..."
              className="pl-9 h-9 text-xs"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" className="h-9 text-xs">
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
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
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
      <Card className="rounded-2xl shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" /> Loading referrals...
            </div>
          ) : referrals.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              No referral records found matching the criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Referrer Creator</th>
                    <th className="py-3 px-4 font-semibold">Referred Creator</th>
                    <th className="py-3 px-4 font-semibold">Referral Code</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Reward</th>
                    <th className="py-3 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {referrals.map((r) => {
                    const referrer = r.referrerCreatorId || {};
                    const referred = r.referredCreatorId || {};

                    return (
                      <tr key={r._id} className="hover:bg-muted/20 transition-colors">
                        {/* Referrer */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">
                            {referrer.fullName || "Creator"}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {referrer.email || "No email"}
                          </div>
                        </td>

                        {/* Referred */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            {referred.fullName || "Creator"}
                            {referred.verificationStatus === "verified" && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] px-1 py-0">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {referred.email || "No email"}
                          </div>
                        </td>

                        {/* Referral Code */}
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          {r.referralCode}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <Badge
                            className={`rounded-full text-[10px] font-bold px-2 py-0.5 border ${
                              r.status === "reward_credited"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : r.status === "qualified"
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                : r.status === "rejected"
                                ? "bg-red-500/10 text-red-600 border-red-500/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            }`}
                          >
                            {r.status === "reward_credited"
                              ? "✓ Credited"
                              : r.status === "qualified"
                              ? "Qualified"
                              : r.status === "rejected"
                              ? "✕ Rejected"
                              : "Registered"}
                          </Badge>
                          {r.rejectionReason && (
                            <span className="block text-[10px] text-red-500 mt-0.5">
                              {r.rejectionReason}
                            </span>
                          )}
                        </td>

                        {/* Reward */}
                        <td className="py-3 px-4 font-semibold text-foreground">
                          ₹{r.reward?.rewardAmount || settings?.rewardAmount || 500}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {r.status !== "reward_credited" && r.status !== "rejected" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] px-2.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
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
                                className="h-7 text-[11px] px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={actionLoading}
                                onClick={() => setRejectTarget(r)}
                              >
                                Reject
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border text-xs text-muted-foreground">
              <span>
                Page {page} of {pagination.totalPages} ({pagination.total} total referrals)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-8 text-xs"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CAMPAIGN SETTINGS DIALOG */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> Referral Campaign Settings
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure reward amounts, qualification conditions, and campaign availability.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <Label className="text-xs font-semibold">Enable Referral Campaign</Label>
                <p className="text-[11px] text-muted-foreground">
                  Allow creators to share links and earn referral rewards
                </p>
              </div>
              <input
                type="checkbox"
                checked={settingsForm.isEnabled}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, isEnabled: e.target.checked }))
                }
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Reward Amount (₹) *</Label>
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
                className="text-sm font-bold"
              />
              <p className="text-[10px] text-muted-foreground">
                Credited directly to the referrer's wallet upon qualification.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Qualification Condition *</Label>
              <select
                value={settingsForm.qualificationTrigger}
                onChange={(e) =>
                  setSettingsForm((prev) => ({
                    ...prev,
                    qualificationTrigger: e.target.value,
                  }))
                }
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
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
              <Label className="text-xs font-semibold">Max Referrals Per User (0 for unlimited)</Label>
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
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSettingsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={updatingSettings}>
                {updatingSettings ? "Saving..." : "Save Settings"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* REJECT REFERRAL DIALOG */}
      <Dialog open={Boolean(rejectTarget)} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" /> Reject Referral
            </DialogTitle>
            <DialogDescription className="text-xs">
              Rejecting this referral will mark it as disqualified and prevent any reward credit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div className="space-y-1.5">
              <Label className="font-semibold">Rejection Reason</Label>
              <Input
                placeholder="e.g. Duplicate account, fake verification documents..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRejectTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={actionLoading}
              onClick={handleRejectReferral}
            >
              {actionLoading ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReferralsPage;
