import api from "@/lib/axios";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Sparkles,
  Percent,
  TrendingUp,
  Settings,
  Users,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Activity,
  Eye,
  MousePointer,
  ArrowUpRight,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
  X,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

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

export function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState("packages");

  const [packages, setPackages] = useState([]);
  const [offers, setOffers] = useState([]);
  const [popupSettings, setPopupSettings] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [subSearch, setSubSearch] = useState("");
  const [subPage, setSubPage] = useState(1);
  const subItemsPerPage = 10;

  const fetchData = async () => {
    try {
      const [pkgs, offs, popups, subs, stats] = await Promise.allSettled([
        api.get("/admin/packages"),
        api.get("/admin/offers"),
        api.get("/admin/popup-settings"),
        api.get("/admin/subscriptions"),
        api.get("/admin/subscription-analytics")
      ]);
      if (pkgs.status === "fulfilled" && pkgs.value.data.success) setPackages(pkgs.value.data.data);
      if (offs.status === "fulfilled" && offs.value.data.success) setOffers(offs.value.data.data);
      if (popups.status === "fulfilled" && popups.value.data.success) setPopupSettings(popups.value.data.data);
      if (subs.status === "fulfilled" && subs.value.data.success) setSubscribers(subs.value.data.data);
      if (stats.status === "fulfilled" && stats.value.data.success) setAnalytics(stats.value.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Dialog & Form States
  const [isPkgOpen, setIsPkgOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [pkgName, setPkgName] = useState("");
  const [pkgPrice, setPkgPrice] = useState(0);
  const [pkgPeriod, setPkgPeriod] = useState("month");
  const [pkgBadge, setPkgBadge] = useState("");
  const [pkgFeatures, setPkgFeatures] = useState("");
  const [pkgActive, setPkgActive] = useState(true);

  const [isOffOpen, setIsOffOpen] = useState(false);
  const [editingOff, setEditingOff] = useState(null);
  const [offName, setOffName] = useState("");
  const [offDesc, setOffDesc] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountVal, setDiscountVal] = useState(0);
  const [bannerUrl, setBannerUrl] = useState("");
  const [offExpiry, setOffExpiry] = useState("");
  const [offBtnText, setOffBtnText] = useState("Claim Offer");
  const [offTarget, setOffTarget] = useState("both");
  const [offPkgId, setOffPkgId] = useState("");
  const [offActive, setOffActive] = useState(true);

  // Package Form Helpers
  const handleOpenPkg = (pkg) => {
    if (pkg) {
      setEditingPkg(pkg);
      setPkgName(pkg.name);
      setPkgPrice(pkg.price);
      setPkgPeriod(pkg.billingPeriod);
      setPkgBadge(pkg.badge || "");
      setPkgFeatures(pkg.features.join(", "));
      setPkgActive(pkg.active);
    } else {
      setEditingPkg(null);
      setPkgName("");
      setPkgPrice(0);
      setPkgPeriod("month");
      setPkgBadge("");
      setPkgFeatures("");
      setPkgActive(true);
    }
    setIsPkgOpen(true);
  };

  const handleSavePkg = async (e) => {
    e.preventDefault();
    const featuresList = pkgFeatures
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    try {
      if (editingPkg) {
        await api.put(`/admin/packages/${editingPkg._id}`, {
          name: pkgName,
          price: pkgPrice,
          billingPeriod: pkgPeriod,
          badge: pkgBadge,
          features: featuresList,
          active: pkgActive,
          sortOrder: editingPkg.sortOrder,
        });
        toast.success("Package updated successfully");
      } else {
        await api.post("/admin/packages", {
          name: pkgName,
          price: pkgPrice,
          billingPeriod: pkgPeriod,
          badge: pkgBadge,
          features: featuresList,
          active: pkgActive,
          sortOrder: packages.length + 1,
        });
        toast.success("Package created successfully");
      }
      setIsPkgOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save package");
    }
  };

  const handleMovePkg = async (idx, dir) => {
    const nextIdx = dir === "up" ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= packages.length) return;

    const list = [...packages];
    // Swap sortOrder
    const temp = list[idx].sortOrder;
    list[idx].sortOrder = list[nextIdx].sortOrder;
    list[nextIdx].sortOrder = temp;

    try {
      await api.post("/admin/packages/reorder", {
        packagesList: list.map((p) => ({ id: p._id, sortOrder: p.sortOrder })),
      });
      toast.success("Packages reordered");
      fetchData();
    } catch (err) {
      toast.error("Failed to reorder packages");
    }
  };

  // Offer Form Helpers
  const handleOpenOff = (off) => {
    if (off) {
      setEditingOff(off);
      setOffName(off.name);
      setOffDesc(off.description);
      setDiscountType(off.discountPercentage ? "percentage" : "amount");
      setDiscountVal(off.discountPercentage || off.discountAmount || 0);
      setBannerUrl(off.bannerImageUrl || "");
      setOffExpiry(new Date(off.expiryDate).toISOString().slice(0, 16));
      setOffBtnText(off.buttonText || "Claim Offer");
      setOffTarget(off.targetUsers);
      setOffPkgId(off.packageId);
      setOffActive(off.active);
    } else {
      setEditingOff(null);
      setOffName("");
      setOffDesc("");
      setDiscountType("percentage");
      setDiscountVal(0);
      setBannerUrl("");
      setOffExpiry(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
      setOffBtnText("Claim Offer");
      setOffTarget("both");
      setOffPkgId(packages[0]?._id || "");
      setOffActive(true);
    }
    setIsOffOpen(true);
  };

  const handleSaveOff = async (e) => {
    e.preventDefault();
    if (!offPkgId) {
      toast.error("Please select a target subscription package");
      return;
    }

    const expiryTime = new Date(offExpiry).getTime();

    const data = {
      name: offName,
      description: offDesc,
      discountPercentage: discountType === "percentage" ? discountVal : undefined,
      discountAmount: discountType === "amount" ? discountVal : undefined,
      bannerImageUrl: bannerUrl || undefined,
      expiryDate: expiryTime,
      buttonText: offBtnText,
      targetUsers: offTarget,
      packageId: offPkgId,
      active: offActive,
    };

    try {
      if (editingOff) {
        await api.put(`/admin/offers/${editingOff._id}`, data);
        toast.success("Offer updated successfully");
      } else {
        await api.post("/admin/offers", data);
        toast.success("Offer created successfully");
      }
      setIsOffOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save offer");
    }
  };

  const handleSavePopupSettings = async (e) => {
    e.preventDefault();
    const form = e.target;
    const show = form.elements.namedItem("showPopup").checked;
    const freq = form.elements.namedItem("popupFrequency").value;
    const target = form.elements.namedItem("targetUsers").value;
    const expiry = new Date(form.elements.namedItem("popupExpiry").value).getTime();
    const activeOffId = form.elements.namedItem("activeOfferId").value;

    try {
      await api.post("/admin/popup-settings", {
        showPopup: show,
        popupFrequency: freq,
        targetUsers: target,
        popupExpiry: expiry,
        activeOfferId: activeOffId ? activeOffId : undefined,
      });
      toast.success("Popup settings updated successfully");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save popup settings");
    }
  };

  // Upgrade Requests (Pending Approvals)
  const [processingSubId, setProcessingSubId] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingSub, setRejectingSub] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [reqSearch, setReqSearch] = useState("");
  const [reqPage, setReqPage] = useState(1);
  const reqItemsPerPage = 10;

  const pendingRequests = useMemo(() => {
    return subscribers.filter((s) => s.status === "pending");
  }, [subscribers]);

  const handleApproveSub = async (subId) => {
    try {
      setProcessingSubId(subId);
      const res = await api.patch(`/admin/subscriptions/${subId}/approve`);
      toast.success(res.data?.message || "Subscription upgrade approved successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to approve subscription upgrade.");
    } finally {
      setProcessingSubId(null);
    }
  };

  const handleOpenRejectDialog = (sub) => {
    setRejectingSub(sub);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleConfirmRejectSub = async () => {
    if (!rejectingSub) return;
    try {
      setProcessingSubId(rejectingSub._id);
      const res = await api.patch(`/admin/subscriptions/${rejectingSub._id}/reject`, {
        reason: rejectReason.trim() || undefined,
      });
      toast.success(res.data?.message || "Subscription upgrade request rejected.");
      setRejectDialogOpen(false);
      setRejectingSub(null);
      setRejectReason("");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reject subscription upgrade.");
    } finally {
      setProcessingSubId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Subscription Management</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage pricing packages, popup banners, promotional discount offers, subscribers, and track metrics.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border space-x-4">
        {[
          { id: "packages", label: "Packages", icon: Sparkles },
          { id: "offers", label: "Offers", icon: Percent },
          { id: "settings", label: "Popup Settings", icon: Settings },
          { id: "subscribers", label: "Subscribers", icon: Users },
          { id: "analytics", label: "Analytics", icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold border-b-2 transition-all duration-200 ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TABS CONTENT */}

      {activeTab === "packages" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold">Tier Packages</h3>
            <Button size="sm" className="rounded-full flex items-center gap-1 h-8" onClick={() => handleOpenPkg()}>
              <Plus className="h-4.5 w-4.5" /> Create Package
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Sort Order</TableHead>
                  <TableHead>Package Name</TableHead>
                  <TableHead>Monthly Price</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead>Features Included</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg, idx) => (
                  <TableRow key={pkg._id}>
                    <TableCell className="pl-6 font-semibold">
                      <div className="flex items-center gap-2">
                        <span>{pkg.sortOrder}</span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleMovePkg(idx, "up")}
                            disabled={idx === 0}
                            className="hover:text-primary disabled:opacity-30"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleMovePkg(idx, "down")}
                            disabled={idx === packages.length - 1}
                            className="hover:text-primary disabled:opacity-30"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">{pkg.name}</TableCell>
                    <TableCell>₹{pkg.price}</TableCell>
                    <TableCell>
                      {pkg.badge ? (
                        <Badge variant="secondary" className="rounded-full text-[10px]">
                          {pkg.badge}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate text-xs text-muted-foreground">
                      {pkg.features.join(", ")}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={async () => {
                          try {
                            await api.post(`/admin/packages/${pkg._id}/toggle`);
                            toast.success("Package status toggled");
                            fetchData();
                          } catch (err) {
                            toast.error(err.response?.data?.message || "Failed to toggle status");
                          }
                        }}
                      >
                        <Badge
                          variant="outline"
                          className={`rounded-full text-[9px] font-semibold border-0 ${
                            pkg.active ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          {pkg.active ? "Active" : "Inactive"}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenPkg(pkg)}>
                          <Edit2 className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={async () => {
                            if (confirm("Are you sure you want to delete this package?")) {
                              try {
                                await api.delete(`/admin/packages/${pkg._id}`);
                                toast.success("Package deleted");
                                fetchData();
                              } catch (err) {
                                toast.error(err.response?.data?.message || "Failed to delete package");
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {activeTab === "offers" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold">Promotional Offers</h3>
            <Button size="sm" className="rounded-full flex items-center gap-1 h-8" onClick={() => handleOpenOff()}>
              <Plus className="h-4.5 w-4.5" /> Create Offer
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Offer Name</TableHead>
                  <TableHead>Target Plan</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Target Users</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((off) => {
                  const pkg = packages.find((p) => p._id === off.packageId);
                  return (
                    <TableRow key={off._id}>
                      <TableCell className="pl-6">
                        <span className="block font-bold text-foreground">{off.name}</span>
                        <span className="block text-[10px] text-muted-foreground truncate max-w-[200px]">
                          {off.description}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">{pkg?.name || "Unknown Plan"}</TableCell>
                      <TableCell className="font-bold text-primary">
                        {off.discountPercentage ? `${off.discountPercentage}% OFF` : `₹${off.discountAmount} OFF`}
                      </TableCell>
                      <TableCell className="capitalize text-xs font-medium text-muted-foreground">
                        {off.targetUsers}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(off.expiryDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={async () => {
                            try {
                              await api.post(`/admin/offers/${off._id}/toggle`);
                              toast.success("Offer status toggled");
                              fetchData();
                            } catch (err) {
                              toast.error(err.response?.data?.message || "Failed to toggle status");
                            }
                          }}
                        >
                          <Badge
                            variant="outline"
                            className={`rounded-full text-[9px] font-semibold border-0 ${
                              off.active ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                            }`}
                          >
                            {off.active ? "Active" : "Inactive"}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenOff(off)}>
                            <Edit2 className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this offer?")) {
                                try {
                                  await api.delete(`/admin/offers/${off._id}`);
                                  toast.success("Offer deleted");
                                  fetchData();
                                } catch (err) {
                                  toast.error(err.response?.data?.message || "Failed to delete offer");
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {activeTab === "settings" && popupSettings && (
        <form onSubmit={handleSavePopupSettings} className="rounded-2xl border border-border bg-card p-6 max-w-xl space-y-4">
          <h3 className="font-display text-base font-bold flex items-center gap-1.5 border-b border-border/50 pb-3">
            <Settings className="h-5 w-5 text-primary" /> Global Popup & Promotion Controls
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-border/20">
            <div>
              <span className="block text-xs font-semibold text-foreground">Show Subscription Popup</span>
              <span className="block text-[10px] text-muted-foreground">Toggle visibility of active offer alerts on login</span>
            </div>
            <input
              type="checkbox"
              name="showPopup"
              defaultChecked={popupSettings.showPopup}
              className="h-4.5 w-9 rounded-full appearance-none cursor-pointer bg-muted border border-border checked:bg-primary relative transition-colors duration-200 before:content-[''] before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4.5 before:transition-transform"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="popupFrequency" className="text-xs font-semibold uppercase text-muted-foreground">Frequency</Label>
              <select
                id="popupFrequency"
                name="popupFrequency"
                defaultValue={popupSettings.popupFrequency}
                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none"
              >
                <option value="every_login">Every Login</option>
                <option value="first_login">First Login</option>
                <option value="every_7_days">Every 7 Days</option>
                <option value="only_once">Only Once</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="targetUsers" className="text-xs font-semibold uppercase text-muted-foreground">Target Audience</Label>
              <select
                id="targetUsers"
                name="targetUsers"
                defaultValue={popupSettings.targetUsers}
                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none"
              >
                <option value="both">Both Brands & Creators</option>
                <option value="brands">Brands Only</option>
                <option value="creators">Creators Only</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="popupExpiry" className="text-xs font-semibold uppercase text-muted-foreground">Popup Expiry Date</Label>
              <Input
                type="datetime-local"
                id="popupExpiry"
                name="popupExpiry"
                defaultValue={new Date(popupSettings.popupExpiry).toISOString().slice(0, 16)}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="activeOfferId" className="text-xs font-semibold uppercase text-muted-foreground">Active Discount Offer</Label>
              <select
                id="activeOfferId"
                name="activeOfferId"
                defaultValue={popupSettings.activeOfferId || ""}
                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none"
              >
                <option value="">No Active Offer</option>
                {offers.filter((o) => o.active).map((o) => (
                  <option key={o._id} value={o._id}>{o.name}</option>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full rounded-full gradient-sunset border-0 text-white font-semibold text-xs h-9">
            Save Popup Settings
          </Button>
        </form>
      )}

      {activeTab === "subscribers" && (() => {
        const filteredSubscribers = subscribers.filter((sub) => {
          const q = subSearch.trim().toLowerCase();
          if (!q) return true;
          const u = (sub.user || "").toLowerCase();
          const r = (sub.role || "").toLowerCase();
          const p = (sub.currentPlan || "").toLowerCase();
          const s = (sub.status || "").toLowerCase();
          return u.includes(q) || r.includes(q) || p.includes(q) || s.includes(q);
        });

        const totalSubs = filteredSubscribers.length;
        const totalSubPages = Math.max(1, Math.ceil(totalSubs / subItemsPerPage));
        const safeSubPage = Math.min(subPage, totalSubPages);
        const startIndex = (safeSubPage - 1) * subItemsPerPage;
        const paginatedSubscribers = filteredSubscribers.slice(startIndex, startIndex + subItemsPerPage);

        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Active Subscriptions</h3>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search subscriber, role, plan..."
                  value={subSearch}
                  onChange={(e) => {
                    setSubSearch(e.target.value);
                    setSubPage(1);
                  }}
                  className="pl-9 text-xs h-9 rounded-full bg-card/60 border-border/60"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Subscriber</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead className="text-right pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSubscribers.map((sub) => (
                    <TableRow key={sub._id}>
                      <TableCell className="pl-6 font-semibold text-foreground">{sub.user}</TableCell>
                      <TableCell className="capitalize text-xs text-muted-foreground">{sub.role}</TableCell>
                      <TableCell className="font-semibold text-primary">{sub.currentPlan}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(sub.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString() : "Lifetime / Free"}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge
                          variant="outline"
                          className={`rounded-full text-[9px] uppercase font-bold border-0 ${
                            sub.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : sub.status === "pending"
                              ? "bg-amber-500/10 text-amber-500"
                              : sub.status === "rejected"
                              ? "bg-rose-500/10 text-rose-500"
                              : sub.status === "expired"
                              ? "bg-red-500/10 text-red-600"
                              : "bg-slate-500/10 text-slate-500"
                          }`}
                        >
                          {sub.status === "pending" ? "Pending Approval" : sub.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedSubscribers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-xs">
                        No subscribers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalSubs > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/40 text-xs">
                <span className="text-muted-foreground order-2 sm:order-1">
                  Showing <strong className="text-foreground">{startIndex + 1}</strong> to{" "}
                  <strong className="text-foreground">{Math.min(safeSubPage * subItemsPerPage, totalSubs)}</strong> of{" "}
                  <strong className="text-foreground">{totalSubs}</strong> subscribers
                </span>
                {totalSubPages > 1 && (
                  <div className="flex items-center gap-1.5 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSubPage((p) => Math.max(1, p - 1))}
                      disabled={safeSubPage === 1}
                      className="h-8 px-2.5 rounded-full border-border/60 hover:bg-accent disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                    </Button>

                    <div className="flex items-center gap-1">
                      {getPageNumbers(safeSubPage, totalSubPages).map((page, idx) =>
                        page === "..." ? (
                          <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">
                            ...
                          </span>
                        ) : (
                          <Button
                            key={page}
                            variant={safeSubPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSubPage(page)}
                            className={`h-8 w-8 p-0 rounded-full text-xs font-semibold ${
                              safeSubPage === page
                                ? "gradient-sunset text-white border-0 shadow-xs"
                                : "border-border/60 hover:bg-accent"
                            }`}
                          >
                            {page}
                          </Button>
                        )
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSubPage((p) => Math.min(totalSubPages, p + 1))}
                      disabled={safeSubPage === totalSubPages}
                      className="h-8 px-2.5 rounded-full border-border/60 hover:bg-accent disabled:opacity-40"
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {activeTab === "analytics" && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Popup Views", value: analytics.popupViews.toLocaleString(), icon: Eye, color: "text-blue-500 bg-blue-500/10" },
              { label: "Popup Clicks", value: analytics.popupClicks.toLocaleString(), icon: MousePointer, color: "text-amber-500 bg-amber-500/10" },
              { label: "Upgrades Claimed", value: analytics.upgradeClicks.toLocaleString(), icon: ArrowUpRight, color: "text-indigo-500 bg-indigo-500/10" },
              {
                label: "Conversion Rate",
                value: `${analytics.conversionRate}%`,
                icon: Activity,
                color: analytics.conversionRate > 2 ? "text-emerald-500 bg-emerald-500/10" : "text-slate-500 bg-slate-500/10",
              },
              { label: "Revenue Driven", value: `₹${analytics.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-600/10 border border-emerald-500/20" },
            ].map((card) => (
              <div key={card.label} className="p-4 border border-border rounded-2xl bg-card space-y-2">
                <div className="flex justify-between items-center text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                  <span>{card.label}</span>
                  <div className={`p-1.5 rounded-lg ${card.color}`}>
                    <card.icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-xl font-bold text-foreground">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Graphical summary representation */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-display text-sm font-semibold">Promotion Performance Summary</h3>
            <p className="text-xs text-muted-foreground">
              Total subscription conversions and campaign metrics tracked for promotional popups.
            </p>
            <div className="h-10 bg-secondary/20 rounded-full flex overflow-hidden border border-border/50">
              <div
                style={{ width: `${Math.max(10, 100 - analytics.conversionRate)}%` }}
                className="bg-muted hover:opacity-90 flex items-center justify-center text-[10px] font-semibold text-muted-foreground"
              >
                Views ({analytics.popupViews})
              </div>
              <div
                style={{ width: `${Math.min(90, analytics.conversionRate)}%` }}
                className="gradient-sunset flex items-center justify-center text-[10px] font-bold text-white shadow-glow"
              >
                Upgrades ({analytics.upgradeClicks})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT PACKAGE MODAL */}
      <Dialog open={isPkgOpen} onOpenChange={setIsPkgOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              {editingPkg ? "Edit Package Details" : "Create New Package"}
            </DialogTitle>
            <DialogDescription className="hidden">Create or edit a package</DialogDescription>
            <DialogDescription className="text-xs text-muted-foreground">
              Define pricing tier, subscription billing intervals, custom tags, and features.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePkg} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="pkgName">Package Name *</Label>
                <Input
                  id="pkgName"
                  value={pkgName}
                  onChange={(e) => setPkgName(e.target.value)}
                  placeholder="e.g. Pro"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pkgPrice">Price (₹) *</Label>
                <Input
                  type="number"
                  id="pkgPrice"
                  value={pkgPrice}
                  onChange={(e) => setPkgPrice(parseInt(e.target.value, 10))}
                  placeholder="999"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="pkgPeriod">Billing Interval</Label>
                <select
                  id="pkgPeriod"
                  value={pkgPeriod}
                  onChange={(e) => setPkgPeriod(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none"
                >
                  <option value="month">Per Month</option>
                  <option value="year">Per Year</option>
                  <option value="once">One-time payment</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="pkgBadge">Featured Tag Badge</Label>
                <Input id="pkgBadge" value={pkgBadge} onChange={(e) => setPkgBadge(e.target.value)} placeholder="e.g. Most Popular" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="pkgFeatures">Plan Features *</Label>
              <Textarea
                id="pkgFeatures"
                value={pkgFeatures}
                onChange={(e) => setPkgFeatures(e.target.value)}
                placeholder="Comma separated: Feature 1, Feature 2, Feature 3"
                rows={3}
                required
              />
              <span className="text-[10px] text-muted-foreground block mt-1">Separate plan feature bullets using commas.</span>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-border/30">
              <span className="text-xs font-semibold">Active Status</span>
              <input
                type="checkbox"
                checked={pkgActive}
                onChange={(e) => setPkgActive(e.target.checked)}
                className="h-4.5 w-9 rounded-full appearance-none cursor-pointer bg-muted border border-border checked:bg-primary relative transition-colors duration-200 before:content-[''] before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4.5 before:transition-transform"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setIsPkgOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full gradient-sunset border-0 text-white shadow-glow">
                {editingPkg ? "Save Changes" : "Create Package"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CREATE/EDIT OFFER MODAL */}
      <Dialog open={isOffOpen} onOpenChange={setIsOffOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              {editingOff ? "Edit Offer Specifications" : "Create Promo Offer"}
            </DialogTitle>
            <DialogDescription className="hidden">Create or edit an offer</DialogDescription>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure promo names, target tiers, discounts, visual banners, and expiry timelines.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveOff} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label htmlFor="offName">Offer Title *</Label>
              <Input id="offName" value={offName} onChange={(e) => setOffName(e.target.value)} placeholder="Summer Campaign discount" required />
            </div>

            <div className="space-y-1">
              <Label htmlFor="offDesc">Offer Description *</Label>
              <Textarea id="offDesc" value={offDesc} onChange={(e) => setOffDesc(e.target.value)} placeholder="Get 20% off all packages this summer." required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="discountType">Discount Type</Label>
                <select
                  id="discountType"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="amount">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="discountVal">Discount Value *</Label>
                <Input
                  type="number"
                  id="discountVal"
                  value={discountVal}
                  onChange={(e) => setDiscountVal(parseInt(e.target.value, 10))}
                  placeholder="20"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="offTarget">Target Users</Label>
                <select
                  id="offTarget"
                  value={offTarget}
                  onChange={(e) => setOffTarget(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none"
                >
                  <option value="both">Both Brands & Creators</option>
                  <option value="brands">Brands Only</option>
                  <option value="creators">Creators Only</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="offPkgId">Target Plan *</Label>
                <select
                  id="offPkgId"
                  value={offPkgId}
                  onChange={(e) => setOffPkgId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none"
                  required
                >
                  <option value="" disabled>Select Plan</option>
                  {packages.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="bannerUrl">Banner Image URL</Label>
              <Input id="bannerUrl" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://domain.com/banner.jpg" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="offExpiry">Expiry Date *</Label>
                <Input type="datetime-local" id="offExpiry" value={offExpiry} onChange={(e) => setOffExpiry(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="offBtnText">Action Button Text</Label>
                <Input id="offBtnText" value={offBtnText} onChange={(e) => setOffBtnText(e.target.value)} placeholder="Upgrade Now" />
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-border/30">
              <span className="text-xs font-semibold">Active Status</span>
              <input
                type="checkbox"
                checked={offActive}
                onChange={(e) => setOffActive(e.target.checked)}
                className="h-4.5 w-9 rounded-full appearance-none cursor-pointer bg-muted border border-border checked:bg-primary relative transition-colors duration-200 before:content-[''] before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4.5 before:transition-transform"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setIsOffOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full gradient-sunset border-0 text-white shadow-glow">
                {editingOff ? "Save Changes" : "Create Offer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reject Upgrade Request Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-600">
              <AlertCircle className="h-5 w-5" />
              Decline Upgrade Request
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Decline the upgrade request for{" "}
              <strong className="text-foreground">{rejectingSub?.user}</strong> (
              {rejectingSub?.currentPlan || rejectingSub?.packageName}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="rejectReason" className="text-xs font-semibold">
              Reason for Declining (optional, will be notified to user)
            </Label>
            <Textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete payment, requirement not met, or please contact support..."
              rows={3}
              className="text-xs rounded-xl"
            />
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectingSub(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={processingSubId !== null}
              className="rounded-full text-xs font-semibold"
              onClick={handleConfirmRejectSub}
            >
              {processingSubId === rejectingSub?._id ? "Rejecting..." : "Decline Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
