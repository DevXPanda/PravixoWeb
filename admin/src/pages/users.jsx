import { useEffect, useState, useMemo } from "react";
import { resolveImageUrl } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Search, Trash2, MoreHorizontal, ArrowUpDown, UserX, UserMinus, Clock, Calendar, Users, ChevronDown, RotateCcw, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatNumber } from "@/lib/format";

const TIME_FILTERS = [
  { label: "All time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Past week", value: "week" },
  { label: "Past month", value: "month" },
  { label: "Past 3 months", value: "3months" },
];

function filterByTime(profiles, period) {
  if (period === "all") return profiles;
  const now = Date.now();
  const cutoffMap = {
    today: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    "3months": 90 * 24 * 60 * 60 * 1000,
  };
  const cutoff = now - cutoffMap[period];
  return profiles.filter((p) => new Date(p.createdAt).getTime() >= cutoff);
}

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = [];
  pages.push(1);
  if (currentPage > 3) {
    pages.push("...");
  }
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (currentPage < totalPages - 2) {
    pages.push("...");
  }
  pages.push(totalPages);
  return pages;
}

export function UsersPage() {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Users — Pravixo Admin";
  }, []);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [activeTab, setActiveTab] = useState("active"); // active | suspended | deleted

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [deleteReason, setDeleteReason] = useState("");

  const [suspendTarget, setSuspendTarget] = useState(null);
  const [suspendName, setSuspendName] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDuration, setSuspendDuration] = useState("7");
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);

  const [allProfiles, setAllProfiles] = useState(null);

  const handleOpenChat = async (userId, userName) => {
    try {
      toast.loading(`Opening chat with ${userName}...`, { id: "open-chat" });
      const res = await api.post("/admin/conversations/open", { targetUserId: userId });
      toast.dismiss("open-chat");
      if (res.data?.success && res.data?.conversationId) {
        navigate(`/messages/${res.data.conversationId}`);
      } else {
        navigate(`/messages`);
      }
    } catch (err) {
      toast.dismiss("open-chat");
      toast.error(err.response?.data?.message || "Failed to open conversation");
    }
  };

  const fetchProfiles = async () => {
    try {
      const res = await api.get("/admin/profiles");
      if (res.data.success) {
        // Sort newest first by default
        const sorted = [...(res.data.data || [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAllProfiles(sorted);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Separate active, suspended, and deleted profiles
  const { active, suspended, deleted } = useMemo(() => {
    if (!allProfiles) return { active: [], suspended: [], deleted: [] };

    const now = Date.now();

    const deletedUsers = allProfiles.filter((p) => p.isDeleted);
    const suspendedUsers = allProfiles.filter(
      (p) =>
        !p.isDeleted &&
        p.isSuspended &&
        p.suspendedUntil &&
        new Date(p.suspendedUntil).getTime() > now
    );
    const activeUsers = allProfiles.filter((p) => {
      if (p.isDeleted) return false;
      if (p.isSuspended && p.suspendedUntil && new Date(p.suspendedUntil).getTime() > now) return false;
      return true;
    });

    return { active: activeUsers, suspended: suspendedUsers, deleted: deletedUsers };
  }, [allProfiles]);

  // Apply filters
  const filteredProfiles = useMemo(() => {
    let base = activeTab === "active" ? active : activeTab === "suspended" ? suspended : deleted;

    if (roleFilter) base = base.filter((p) => p.role === roleFilter);
    base = filterByTime(base, timeFilter);

    if (search) {
      const s = search.toLowerCase();
      base = base.filter(
        (p) =>
          p.fullName?.toLowerCase().includes(s) ||
          p.handle?.toLowerCase().includes(s) ||
          p.category?.toLowerCase().includes(s)
      );
    }

    if (sortOrder === "newest") {
      base = [...base].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === "oldest") {
      base = [...base].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOrder === "followers") {
      base = [...base].sort((a, b) => {
        const totalA = (a.instagramFollowers || 0) + (a.facebookFollowers || 0) + (a.youtubeFollowers || 0) + (a.twitterFollowers || 0);
        const totalB = (b.instagramFollowers || 0) + (b.facebookFollowers || 0) + (b.youtubeFollowers || 0) + (b.twitterFollowers || 0);
        return totalB - totalA;
      });
    }

    return base;
  }, [active, suspended, deleted, activeTab, roleFilter, timeFilter, search, sortOrder]);

  // Pagination (10 users per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, roleFilter, timeFilter, sortOrder]);

  const totalItems = filteredProfiles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProfiles = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredProfiles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProfiles, safeCurrentPage, itemsPerPage]);

  const handleDelete = async (e) => {
    if (e) e.preventDefault();
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/profiles/${deleteTarget}`, { data: { reason: deleteReason } });
      toast.success(`Deleted ${deleteName}`);
      fetchProfiles();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
    setDeleteTarget(null);
    setDeleteName("");
    setDeleteReason("");
  };

  const handleSuspend = async (e) => {
    e.preventDefault();
    if (!suspendTarget) return;
    try {
      const days = parseInt(suspendDuration, 10);
      if (isNaN(days) || days <= 0) {
        toast.error("Please enter a valid number of days.");
        return;
      }
      await api.post(`/admin/profiles/${suspendTarget}/suspend`, {
        reason: suspendReason,
        durationDays: days,
      });
      toast.success(`Suspended ${suspendName} for ${days} days.`);
      setIsSuspendDialogOpen(false);
      setSuspendTarget(null);
      setSuspendReason("");
      fetchProfiles();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to suspend user");
    }
  };

  const handleUnsuspend = async (id, name) => {
    try {
      await api.post(`/admin/profiles/${id}/unsuspend`);
      toast.success(`Restored access for ${name}`);
      fetchProfiles();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to unsuspend user");
    }
  };

  const handleRoleSwitch = async (id, newRole, name) => {
    try {
      await api.patch(`/admin/profiles/${id}/role`, { role: newRole });
      toast.success(`${name} is now a ${newRole}`);
      fetchProfiles();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleRestore = async (id, name) => {
    try {
      await api.post(`/admin/profiles/${id}/restore`);
      toast.success(`${name}'s account has been restored to active.`);
      fetchProfiles();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to restore user");
    }
  };

  const tabs = [
    { key: "active", label: "Active", count: active.length, icon: Users, color: "text-emerald-500" },
    { key: "suspended", label: "Suspended", count: suspended.length, icon: UserMinus, color: "text-amber-500" },
    { key: "deleted", label: "Deleted", count: deleted.length, icon: UserX, color: "text-red-500" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage all platform users — creators and brands
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                activeTab === tab.key
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {tab.label} Users
                  </p>
                  <p className={`mt-1 text-3xl font-bold ${tab.color}`}>
                    {allProfiles === null ? "—" : tab.count}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    tab.key === "active"
                      ? "bg-emerald-500/10"
                      : tab.key === "suspended"
                      ? "bg-amber-500/10"
                      : "bg-red-500/10"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${tab.color}`} />
                </div>
              </div>
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full gradient-sunset" />
              )}
            </button>
          );
        })}
      </div>

      {/* Filters Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, handle, or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>

        {/* Role Filter */}
        <div className="flex gap-2">
          {[
            { label: "All", value: "" },
            { label: "Creators", value: "creator" },
            { label: "Brands", value: "brand" },
          ].map((r) => (
            <Button
              key={r.value}
              size="sm"
              variant={roleFilter === r.value ? "default" : "outline"}
              className={`rounded-full ${roleFilter === r.value ? "gradient-sunset border-0 text-white" : ""}`}
              onClick={() => setRoleFilter(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>

        {/* Time Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {TIME_FILTERS.find((t) => t.value === timeFilter)?.label}
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 rounded-xl" align="end">
            {TIME_FILTERS.map((t) => (
              <DropdownMenuItem
                key={t.value}
                className={`cursor-pointer ${timeFilter === t.value ? "font-semibold text-primary" : ""}`}
                onClick={() => setTimeFilter(t.value)}
              >
                {t.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Order */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5" />
              {sortOrder === "newest" ? "Newest first" : sortOrder === "oldest" ? "Oldest first" : "Most followers"}
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-44 rounded-xl" align="end">
            <DropdownMenuItem className={`cursor-pointer ${sortOrder === "newest" ? "font-semibold text-primary" : ""}`} onClick={() => setSortOrder("newest")}>
              Newest first
            </DropdownMenuItem>
            <DropdownMenuItem className={`cursor-pointer ${sortOrder === "oldest" ? "font-semibold text-primary" : ""}`} onClick={() => setSortOrder("oldest")}>
              Oldest first
            </DropdownMenuItem>
            <DropdownMenuItem className={`cursor-pointer ${sortOrder === "followers" ? "font-semibold text-primary" : ""}`} onClick={() => setSortOrder("followers")}>
              Most followers
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Suspended/Deleted Banner */}
      {activeTab === "suspended" && suspended.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-5 py-4 flex items-center gap-3">
          <UserMinus className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-600">{suspended.length} suspended user{suspended.length !== 1 && "s"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">These users have temporary account restrictions. You can unsuspend them anytime.</p>
          </div>
        </div>
      )}

      {activeTab === "deleted" && deleted.length > 0 && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 px-5 py-4 flex items-center gap-3">
          <UserX className="h-5 w-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-600">{deleted.length} deleted user{deleted.length !== 1 && "s"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">These accounts have been soft-deleted. Their data is retained for audit purposes.</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">Joined</div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Followers
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!allProfiles ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-3.5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-3.5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-3.5 w-14" /></TableCell>
                  <TableCell><Skeleton className="h-3.5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredProfiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    {activeTab === "deleted" ? (
                      <UserX className="h-8 w-8 text-muted-foreground/30" />
                    ) : activeTab === "suspended" ? (
                      <UserMinus className="h-8 w-8 text-muted-foreground/30" />
                    ) : (
                      <Users className="h-8 w-8 text-muted-foreground/30" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {activeTab === "deleted"
                        ? "No deleted users"
                        : activeTab === "suspended"
                        ? "No suspended users"
                        : "No users found"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedProfiles.map((u) => {
                const totalFollowers =
                  (u.instagramFollowers || 0) +
                  (u.facebookFollowers || 0) +
                  (u.linkedinFollowers || 0) +
                  (u.youtubeFollowers || 0) +
                  (u.quoraFollowers || 0) +
                  (u.twitterFollowers || 0);

                const joinedDate = u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";

                const isSuspendedNow =
                  u.isSuspended &&
                  u.suspendedUntil &&
                  new Date(u.suspendedUntil).getTime() > Date.now();

                return (
                  <TableRow
                    key={u._id}
                    className={`group cursor-pointer hover:bg-secondary/20 transition-colors ${u.isDeleted ? "opacity-60" : ""}`}
                    onClick={() =>
                      window.open(
                        `${import.meta.env.VITE_FRONTEND_URL || "https://pravixo-web.vercel.app"}/${u.role === "creator" ? "influencer" : "brand"}/${u._id}`,
                        "_blank"
                      )
                    }
                  >
                    <TableCell className="pl-6 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={resolveImageUrl(u.avatarUrl, u.fullName || "User", u.gender, u.role)}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = resolveImageUrl("", u.fullName || "User", u.gender, u.role);
                            }}
                            alt=""
                            className={`h-10 w-10 rounded-full border border-border object-cover ${
                              u.isDeleted ? "grayscale" : ""
                            }`}
                          />
                          {u.isDeleted && (
                            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 border-2 border-card flex items-center justify-center">
                              <UserX className="h-2 w-2 text-white" />
                            </div>
                          )}
                          {isSuspendedNow && !u.isDeleted && (
                            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-amber-500 border-2 border-card flex items-center justify-center">
                              <UserMinus className="h-2 w-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate">
                            {u.fullName}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {u.handle ? `@${u.handle}` : u.userId?.slice(0, 16) + "…"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge
                          variant="secondary"
                          className={`rounded-full text-[10px] ${
                            u.role === "creator"
                              ? "bg-violet/10 text-violet"
                              : "bg-amber/10 text-amber"
                          }`}
                        >
                          {u.role}
                        </Badge>
                        {isSuspendedNow && (
                          <Badge
                            variant="destructive"
                            className="rounded-full text-[10px] bg-amber-500/10 text-amber-600 hover:bg-amber-500/10 border border-amber-500/20 font-semibold"
                          >
                            Suspended
                          </Badge>
                        )}
                        {u.isDeleted && (
                          <Badge
                            variant="destructive"
                            className="rounded-full text-[10px] bg-red-500/10 text-red-600 hover:bg-red-500/10 border border-red-500/20 font-semibold"
                          >
                            Deleted
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{u.category || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.location || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {joinedDate}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatNumber(totalFollowers)}
                    </TableCell>
                    {/* Actions column */}
                    {activeTab === "deleted" ? (
                      <TableCell className="text-right pr-6">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(u._id, u.fullName);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Restore to Active
                        </button>
                      </TableCell>
                    ) : (
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                              className="h-8 w-8 rounded-lg cursor-pointer"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 rounded-xl" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem
                              className="cursor-pointer font-medium text-primary focus:text-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenChat(u._id || u.userId, u.fullName);
                              }}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Open Chat Room
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRoleSwitch(
                                  u._id,
                                  u.role === "creator" ? "brand" : "creator",
                                  u.fullName
                                );
                              }}
                            >
                              Switch to {u.role === "creator" ? "brand" : "creator"}
                            </DropdownMenuItem>

                            {isSuspendedNow ? (
                              <DropdownMenuItem
                                className="text-emerald-600 focus:text-emerald-600 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnsuspend(u._id, u.fullName);
                                }}
                              >
                                Unsuspend user
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-amber-600 focus:text-amber-600 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSuspendTarget(u._id);
                                  setSuspendName(u.fullName);
                                  setSuspendReason("");
                                  setSuspendDuration("7");
                                  setIsSuspendDialogOpen(true);
                                }}
                              >
                                Suspend user
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(u._id);
                                setDeleteName(u.fullName);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete user
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {allProfiles && (
          <div className="border-t border-border px-6 py-3.5 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3 bg-secondary/10">
            <div className="flex items-center gap-2">
              <span>
                Showing{" "}
                <strong className="text-foreground font-semibold">
                  {totalItems === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1}
                </strong>{" "}
                to{" "}
                <strong className="text-foreground font-semibold">
                  {Math.min(safeCurrentPage * itemsPerPage, totalItems)}
                </strong>{" "}
                of <strong className="text-foreground font-semibold">{totalItems}</strong> {activeTab} user{totalItems !== 1 && "s"}
                {timeFilter !== "all" && ` from ${TIME_FILTERS.find((t) => t.value === timeFilter)?.label.toLowerCase()}`}
              </span>
              {timeFilter !== "all" && (
                <button
                  className="text-primary hover:underline text-xs ml-1"
                  onClick={() => setTimeFilter("all")}
                >
                  Clear filter
                </button>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="h-8 rounded-full px-2.5 text-xs gap-1 border-border hover:bg-secondary disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </Button>

                <div className="flex items-center gap-1">
                  {getPageNumbers(safeCurrentPage, totalPages).map((p, idx) =>
                    p === "..." ? (
                      <span key={`dots-${idx}`} className="px-1.5 text-muted-foreground">
                        …
                      </span>
                    ) : (
                      <button
                        key={`page-${p}`}
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`h-8 min-w-[32px] px-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          safeCurrentPage === p
                            ? "bg-primary text-white shadow-xs"
                            : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="h-8 rounded-full px-2.5 text-xs gap-1 border-border hover:bg-secondary disabled:opacity-40 cursor-pointer"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-destructive">
              Delete user "{deleteName}"?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              This will permanently delete this user and all associated data including portfolio images, conversations, and favorites. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDelete} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="deleteReason">Reason for Deletion (Optional)</Label>
              <textarea
                id="deleteReason"
                rows={3}
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="e.g. Fraudulent activity, requested by user"
                className="w-full min-h-[80px] rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:border-destructive"
              />
            </div>

            <DialogFooter className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full flex-1"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-glow"
              >
                Delete permanently
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Suspend User Dialog */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Suspend "{suspendName}"
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Temporarily restrict this user's access to the platform.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSuspend} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="suspendReason">Reason for Suspension</Label>
              <textarea
                id="suspendReason"
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Inappropriate content, violating campaign agreements"
                className="w-full min-h-[80px] rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:border-amber-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="suspendDuration">Suspension Duration (Days)</Label>
              <Input
                id="suspendDuration"
                type="number"
                min="1"
                value={suspendDuration}
                onChange={(e) => setSuspendDuration(e.target.value)}
                placeholder="Number of days"
                className="rounded-xl border-border bg-background"
                required
              />
            </div>

            <DialogFooter className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full flex-1"
                onClick={() => {
                  setIsSuspendDialogOpen(false);
                  setSuspendTarget(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full flex-1 bg-amber-600 hover:bg-amber-700 text-white shadow-glow"
              >
                Confirm Suspension
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
