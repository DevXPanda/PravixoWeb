import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Eye,
  Plus,
  Edit2,
  Sparkles,
  IndianRupee,
  Calendar,
  User,
  Mail,
  AlertCircle,
  RefreshCw,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

export function BookingsPage() {
  useEffect(() => {
    document.title = "Add-on Bookings — Pravixo Admin";
  }, []);

  const [activeTab, setActiveTab] = useState("bookings"); // "bookings" | "services"
  const [bookings, setBookings] = useState(null);
  const [services, setServices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending"); // "pending" | "confirmed" | "cancelled" | "all"
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Selected Booking Modal
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Service Create/Edit Modal
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    enabled: true,
  });
  const [serviceSaving, setServiceSaving] = useState(false);

  // Load Bookings & Services
  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        api.get("/addons/bookings"),
        api.get("/addons/services"),
      ]);

      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.data || []);
      }
      if (servicesRes.data.success) {
        setServices(servicesRes.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load bookings or services", err);
      toast.error("Failed to load booking data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((b) => {
      const matchesStatus =
        statusFilter === "all" ? true : b.status === statusFilter;

      const customerName = (
        b.profileId?.fullName ||
        b.profileId?.handle ||
        ""
      ).toLowerCase();
      const customerEmail = (b.profileId?.email || "").toLowerCase();
      const serviceName = (b.serviceId?.name || "").toLowerCase();
      const notes = (b.notes || "").toLowerCase();
      const sLower = search.toLowerCase();

      const matchesSearch =
        !search ||
        customerName.includes(sLower) ||
        customerEmail.includes(sLower) ||
        serviceName.includes(sLower) ||
        notes.includes(sLower);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, statusFilter, search]);

  // Pagination (10 bookings per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search]);

  const totalItems = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedBookings = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBookings, safeCurrentPage, itemsPerPage]);

  // Status counts
  const counts = useMemo(() => {
    if (!bookings) return { pending: 0, confirmed: 0, cancelled: 0, all: 0, revenue: 0 };
    return bookings.reduce(
      (acc, b) => {
        acc.all += 1;
        if (b.status === "pending") acc.pending += 1;
        if (b.status === "confirmed") {
          acc.confirmed += 1;
          acc.revenue += b.serviceId?.price || 0;
        }
        if (b.status === "cancelled") acc.cancelled += 1;
        return acc;
      },
      { pending: 0, confirmed: 0, cancelled: 0, all: 0, revenue: 0 }
    );
  }, [bookings]);

  // Booking Actions
  const handleUpdateStatus = async (bookingId, newStatus) => {
    setActionLoadingId(bookingId);
    try {
      const res = await api.patch(`/addons/bookings/${bookingId}`, {
        status: newStatus,
      });
      if (res.data.success) {
        toast.success(`Booking status marked as ${newStatus}.`);
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
        );
        if (selectedBooking?._id === bookingId) {
          setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update booking status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking request?"))
      return;
    setActionLoadingId(bookingId);
    try {
      const res = await api.delete(`/addons/bookings/${bookingId}`);
      if (res.data.success) {
        toast.success("Booking request deleted.");
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
        if (selectedBooking?._id === bookingId) {
          setSelectedBooking(null);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete booking.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Service Management Actions
  const handleOpenServiceModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        name: service.name || "",
        description: service.description || "",
        price: service.price || "",
        imageUrl: service.imageUrl || "",
        enabled: service.enabled ?? true,
      });
    } else {
      setEditingService(null);
      setServiceForm({
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        enabled: true,
      });
    }
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceForm.name.trim() || !serviceForm.price) {
      toast.error("Please enter a service name and price.");
      return;
    }

    setServiceSaving(true);
    try {
      if (editingService) {
        const res = await api.patch(`/addons/services/${editingService._id}`, {
          ...serviceForm,
          price: Number(serviceForm.price),
        });
        if (res.data.success) {
          toast.success("Service updated successfully.");
          setServices((prev) =>
            prev.map((s) => (s._id === editingService._id ? res.data.data : s))
          );
          setServiceModalOpen(false);
        }
      } else {
        const res = await api.post("/addons/services", {
          ...serviceForm,
          price: Number(serviceForm.price),
        });
        if (res.data.success) {
          toast.success("New service added to catalog.");
          setServices((prev) => [res.data.data, ...prev]);
          setServiceModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save service.");
    } finally {
      setServiceSaving(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this service? Existing bookings won't be deleted."
      )
    )
      return;
    try {
      const res = await api.delete(`/addons/services/${serviceId}`);
      if (res.data.success) {
        toast.success("Service deleted.");
        setServices((prev) => prev.filter((s) => s._id !== serviceId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete service.");
    }
  };

  const handleToggleServiceStatus = async (service) => {
    try {
      const res = await api.patch(`/addons/services/${service._id}`, {
        enabled: !service.enabled,
      });
      if (res.data.success) {
        toast.success(
          `Service marked as ${!service.enabled ? "Active" : "Disabled"}.`
        );
        setServices((prev) =>
          prev.map((s) =>
            s._id === service._id ? { ...s, enabled: !service.enabled } : s
          )
        );
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  // Helper Badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Confirmed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500/10 text-red-600 border border-red-500/20 font-medium">
            <XCircle className="h-3 w-3 mr-1" /> Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 font-medium">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold sm:text-3xl text-foreground">
                Add-on Bookings
              </h1>
              <p className="text-sm text-muted-foreground">
                Review and manage booking requests for platform services & studio deliverables.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="rounded-xl h-9"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => handleOpenServiceModal()}
            className="rounded-xl h-9 gradient-sunset text-white border-0 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Service
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Total Bookings</span>
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {loading ? <Skeleton className="h-8 w-12" /> : counts.all}
          </p>
          <span className="text-[11px] text-muted-foreground">All requested services</span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-600 font-medium">Pending Requests</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {loading ? <Skeleton className="h-8 w-12" /> : counts.pending}
          </p>
          <span className="text-[11px] text-muted-foreground">Requires admin action</span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-600 font-medium">Confirmed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {loading ? <Skeleton className="h-8 w-12" /> : counts.confirmed}
          </p>
          <span className="text-[11px] text-muted-foreground">Scheduled or delivered</span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Confirmed Value</span>
            <IndianRupee className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              `₹${counts.revenue.toLocaleString("en-IN")}`
            )}
          </p>
          <span className="text-[11px] text-muted-foreground">From confirmed bookings</span>
        </div>
      </div>

      {/* Main Mode Tabs (Bookings vs Service Catalog) */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "bookings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Customer Bookings ({counts.all})
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "services"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Services Catalog ({services?.length || 0})
        </button>
      </div>

      {/* VIEW: BOOKING REQUESTS */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          {/* Sub-filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "pending", label: `Pending (${counts.pending})` },
                { key: "confirmed", label: `Confirmed (${counts.confirmed})` },
                { key: "cancelled", label: `Cancelled (${counts.cancelled})` },
                { key: "all", label: `All (${counts.all})` },
              ].map((tab) => (
                <Button
                  key={tab.key}
                  size="sm"
                  variant={statusFilter === tab.key ? "default" : "outline"}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`rounded-full text-xs h-8 px-3.5 ${
                    statusFilter === tab.key
                      ? "gradient-sunset border-0 text-white shadow-xs"
                      : ""
                  }`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer, service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-semibold text-xs">Customer</TableHead>
                  <TableHead className="font-semibold text-xs">Requested Service</TableHead>
                  <TableHead className="font-semibold text-xs">Price</TableHead>
                  <TableHead className="font-semibold text-xs">Booking Date</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-sm text-muted-foreground">
                      No bookings found for the selected status.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBookings.map((b) => (
                    <TableRow key={b._id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-foreground">
                            {b.profileId?.fullName || "Unnamed User"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {b.profileId?.email || "No email"}
                          </span>
                          {b.profileId?.role && (
                            <span className="text-[10px] text-primary uppercase font-bold tracking-wider mt-0.5">
                              {b.profileId.role}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          {b.serviceId?.imageUrl && (
                            <img
                              src={b.serviceId.imageUrl}
                              alt={b.serviceId.name}
                              className="h-9 w-9 rounded-lg object-cover border border-border"
                            />
                          )}
                          <div>
                            <span className="font-medium text-sm text-foreground block">
                              {b.serviceId?.name || "Service Unavailable"}
                            </span>
                            {b.notes && (
                              <span className="text-xs text-muted-foreground line-clamp-1 italic max-w-xs">
                                "{b.notes}"
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="font-bold text-sm text-foreground">
                          ₹{Number(b.serviceId?.price || 0).toLocaleString("en-IN")}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-muted-foreground flex flex-col">
                          <span className="text-foreground font-medium">
                            {b.bookingDate ? format(new Date(b.bookingDate), "MMM dd, yyyy") : "TBD"}
                          </span>
                          <span className="text-[10px]">
                            Booked on {format(new Date(b.createdAt || Date.now()), "dd MMM yyyy")}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>{getStatusBadge(b.status)}</TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedBooking(b)}
                            className="h-8 px-2 text-xs rounded-lg hover:bg-secondary"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> Details
                          </Button>

                          {b.status !== "confirmed" && (
                            <Button
                              size="sm"
                              disabled={actionLoadingId === b._id}
                              onClick={() => handleUpdateStatus(b._id, "confirmed")}
                              className="h-8 px-2.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Confirm
                            </Button>
                          )}

                          {b.status !== "cancelled" && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionLoadingId === b._id}
                              onClick={() => handleUpdateStatus(b._id, "cancelled")}
                              className="h-8 px-2 text-xs rounded-lg text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionLoadingId === b._id}
                            onClick={() => handleDeleteBooking(b._id)}
                            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List */}
          <div className="space-y-3 md:hidden">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="p-4 rounded-2xl border border-border bg-card space-y-3">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))
            ) : paginatedBookings.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground rounded-2xl border border-border bg-card p-4">
                No bookings found.
              </div>
            ) : (
              paginatedBookings.map((b) => (
                <div key={b._id} className="p-4 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">
                        {b.serviceId?.name || "Service Unavailable"}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        by {b.profileId?.fullName || "User"} ({b.profileId?.email})
                      </p>
                    </div>
                    {getStatusBadge(b.status)}
                  </div>

                  <div className="flex items-center justify-between text-xs py-2 border-y border-border/40">
                    <span className="text-muted-foreground">
                      Date: <b className="text-foreground">{b.bookingDate ? format(new Date(b.bookingDate), "dd MMM yyyy") : "TBD"}</b>
                    </span>
                    <span className="font-bold text-foreground">
                      ₹{Number(b.serviceId?.price || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {b.notes && (
                    <p className="text-xs text-muted-foreground italic bg-muted/40 p-2 rounded-lg">
                      "{b.notes}"
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBooking(b)}
                      className="h-8 text-xs rounded-lg"
                    >
                      Details
                    </Button>
                    {b.status !== "confirmed" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(b._id, "confirmed")}
                        className="h-8 text-xs rounded-lg bg-emerald-600 text-white"
                      >
                        Confirm
                      </Button>
                    )}
                    {b.status !== "cancelled" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(b._id, "cancelled")}
                        className="h-8 text-xs rounded-lg text-red-600"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {filteredBookings && filteredBookings.length > 0 && (
            <div className="rounded-2xl border border-border px-6 py-3.5 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3 bg-secondary/10 shadow-xs">
              <div>
                Showing <strong className="text-foreground font-semibold">{(safeCurrentPage - 1) * itemsPerPage + 1}</strong> to{" "}
                <strong className="text-foreground font-semibold">{Math.min(safeCurrentPage * itemsPerPage, totalItems)}</strong> of{" "}
                <strong className="text-foreground font-semibold">{totalItems}</strong> booking{totalItems !== 1 && "s"}
                {bookings && totalItems !== bookings.length && ` (filtered from ${bookings.length})`}
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
      )}

      {/* VIEW: SERVICES CATALOG */}
      {activeTab === "services" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              These services are displayed on the client Add-ons page for brands and creators to book.
            </p>
            <Button
              size="sm"
              onClick={() => handleOpenServiceModal()}
              className="rounded-xl h-8 gradient-sunset text-white text-xs border-0"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Service
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="p-4 rounded-2xl border border-border bg-card space-y-3">
                  <Skeleton className="h-36 w-full rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : services?.length === 0 ? (
              <div className="col-span-full text-center py-12 text-sm text-muted-foreground border border-border rounded-2xl bg-card">
                No services configured yet. Click "New Service" to add one.
              </div>
            ) : (
              services?.map((svc) => (
                <div
                  key={svc._id}
                  className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors"
                >
                  {svc.imageUrl ? (
                    <img
                      src={svc.imageUrl}
                      alt={svc.name}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="h-40 w-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                      <Sparkles className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-base text-foreground leading-tight">
                          {svc.name}
                        </h3>
                        <Badge
                          variant={svc.enabled ? "default" : "secondary"}
                          className={`text-[10px] cursor-pointer ${
                            svc.enabled
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-muted text-muted-foreground"
                          }`}
                          onClick={() => handleToggleServiceStatus(svc)}
                          title="Click to toggle status"
                        >
                          {svc.enabled ? "Active" : "Disabled"}
                        </Badge>
                      </div>

                      <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {svc.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-border flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Price</span>
                        <span className="text-base font-bold text-foreground">
                          ₹{Number(svc.price || 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenServiceModal(svc)}
                          className="h-8 px-2.5 text-xs rounded-lg"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteService(svc._id)}
                          className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Delete service"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: BOOKING DETAILS */}
      <Dialog open={!!selectedBooking} onOpenChange={(o) => !o && setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Booking Request Details
            </DialogTitle>
            <DialogDescription>
              Full information on this customer add-on service order.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 py-2 text-sm">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">
                    {selectedBooking.serviceId?.name}
                  </span>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedBooking.serviceId?.description}
                </p>
                <div className="text-xs font-bold text-primary pt-1">
                  Price: ₹{Number(selectedBooking.serviceId?.price || 0).toLocaleString("en-IN")}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary" /> Customer
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedBooking.profileId?.fullName || "User"} ({selectedBooking.profileId?.role})
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" /> Contact Email
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedBooking.profileId?.email || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Target Date
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedBooking.bookingDate
                      ? format(new Date(selectedBooking.bookingDate), "MMMM dd, yyyy")
                      : "To be scheduled"}
                  </span>
                </div>

                <div className="py-1">
                  <span className="text-muted-foreground block mb-1">
                    Customer Requirements / Notes:
                  </span>
                  <div className="p-3 rounded-lg bg-card border border-border text-foreground leading-relaxed">
                    {selectedBooking.notes || "No additional notes provided by customer."}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-row justify-end gap-2 pt-2">
                {selectedBooking.status !== "confirmed" && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedBooking._id, "confirmed")}
                    className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Confirm Booking
                  </Button>
                )}
                {selectedBooking.status !== "cancelled" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedBooking._id, "cancelled")}
                    className="rounded-xl text-xs text-red-600"
                  >
                    Cancel Booking
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: CREATE / EDIT SERVICE */}
      <Dialog open={serviceModalOpen} onOpenChange={setServiceModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Add-on Service" : "Add New Platform Service"}
            </DialogTitle>
            <DialogDescription>
              Configure the service details, pricing, and cover image displayed to clients.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveService} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Service Name *
              </label>
              <Input
                placeholder="e.g. Professional Videography Team"
                value={serviceForm.name}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, name: e.target.value })
                }
                required
                className="h-9 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Price (₹ INR) *
              </label>
              <Input
                type="number"
                placeholder="e.g. 15000"
                value={serviceForm.price}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, price: e.target.value })
                }
                required
                className="h-9 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Image URL
              </label>
              <Input
                placeholder="https://images.unsplash.com/..."
                value={serviceForm.imageUrl}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, imageUrl: e.target.value })
                }
                className="h-9 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Description & Deliverables
              </label>
              <Textarea
                placeholder="Provide a detailed description of what is included in this service..."
                value={serviceForm.description}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, description: e.target.value })
                }
                rows={4}
                className="rounded-xl text-xs leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="enabledService"
                checked={serviceForm.enabled}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, enabled: e.target.checked })
                }
                className="rounded border-border"
              />
              <label htmlFor="enabledService" className="text-xs text-foreground cursor-pointer font-medium">
                Make this service active and visible on the website immediately
              </label>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setServiceModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={serviceSaving}
                className="rounded-xl text-xs gradient-sunset text-white border-0"
              >
                {serviceSaving
                  ? "Saving..."
                  : editingService
                  ? "Update Service"
                  : "Create Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
