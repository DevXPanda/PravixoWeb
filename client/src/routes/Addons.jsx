import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/TextArea";
import { toast } from "sonner";

import {
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  ShoppingBag,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  User,
  AlertCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/Dialog";

import { addonApi } from "../services/addonServices";

// Change this import if your AuthProvider exports from another path
import { useAuth } from "../components/auth/AuthProvider";

export default function Addons() {
  const { user, profile } = useAuth();

  // =====================================================
  // STATE
  // =====================================================

  const [activeTab, setActiveTab] = useState("services"); // "services" | "bookings"
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  const [showManageModal, setShowManageModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [bookingService, setBookingService] = useState(null);
  const [bookingNotes, setBookingNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState(0);
  const [formCover, setFormCover] = useState("");
  const [formEnabled, setFormEnabled] = useState(true);

  // =====================================================
  // ADMIN CHECK
  // =====================================================

  const isAdmin =
    profile?.role === "admin" ||
    user?.role === "admin" ||
    (profile?.role === "brand" && profile?.fullName?.toLowerCase() === "admin");

  // =====================================================
  // LOAD SERVICES & BOOKINGS
  // =====================================================

  const fetchServices = async () => {
    try {
      setLoading(true);

      const response = await addonApi.getServices();

      if (response?.success) {
        setServices(response.data || []);
      } else {
        toast.error(
          response?.message || "Failed to load addon services."
        );
      }
    } catch (error) {
      console.error("Fetch addon services error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to load addon services."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      // If admin, fetch all bookings; otherwise, filter by caller profile._id
      const profileIdParam = isAdmin ? undefined : profile?._id;
      const response = await addonApi.getBookings(profileIdParam);

      if (response?.success) {
        setBookings(response.data || []);
      }
    } catch (error) {
      console.error("Fetch addon bookings error:", error);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (profile?._id || isAdmin) {
      fetchBookings();
    }
  }, [profile?._id, isAdmin]);

  // Status update for bookings (Confirm / Cancel / Pending)
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      setUpdatingBookingId(bookingId);
      const res = await addonApi.updateBookingStatus(bookingId, newStatus);
      if (res?.success) {
        toast.success(res.message || `Booking status updated to ${newStatus}`);
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
        );
      } else {
        toast.error(res?.message || "Failed to update booking status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingBookingId(null);
    }
  };

  // Delete booking request
  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking request?")) {
      return;
    }
    try {
      setUpdatingBookingId(bookingId);
      const res = await addonApi.deleteBooking(bookingId);
      if (res?.success) {
        toast.success("Booking request deleted successfully.");
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      } else {
        toast.error(res?.message || "Failed to delete booking.");
      }
    } catch (err) {
      console.error("Delete booking error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete booking.");
    } finally {
      setUpdatingBookingId(null);
    }
  };

  // =====================================================
  // OPEN CREATE MODAL
  // =====================================================

  const handleOpenCreate = () => {
    setEditingService(null);

    setFormName("");
    setFormDesc("");
    setFormPrice(0);
    setFormCover("");
    setFormEnabled(true);

    setShowManageModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const handleOpenEdit = (service) => {
    setEditingService(service);

    setFormName(service.name || "");
    setFormDesc(service.description || "");
    setFormPrice(service.price || 0);
    setFormCover(service.imageUrl || "");
    setFormEnabled(service.enabled ?? true);

    setShowManageModal(true);
  };

  // =====================================================
  // SAVE SERVICE
  // =====================================================

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formName.trim()) {
      toast.error("Service name is required.");
      return;
    }

    if (!formDesc.trim()) {
      toast.error("Description is required.");
      return;
    }

    if (Number(formPrice) < 0) {
      toast.error("Price cannot be negative.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formName.trim(),
        description: formDesc.trim(),
        price: Number(formPrice),
        imageUrl: formCover.trim() || undefined,
        enabled: formEnabled,
      };

      let response;

      if (editingService) {
        response = await addonApi.updateService(
          editingService._id,
          payload
        );

        if (response?.success) {
          setServices((prev) =>
            prev.map((service) =>
              service._id === editingService._id
                ? response.data
                : service
            )
          );

          toast.success(
            "Add-on service updated successfully!"
          );
        }
      } else {
        response = await addonApi.createService(payload);

        if (response?.success) {
          setServices((prev) => [
            ...prev,
            response.data,
          ]);

          toast.success(
            "Add-on service created successfully!"
          );
        }
      }

      if (!response?.success) {
        toast.error(
          response?.message || "Failed to save service."
        );

        return;
      }

      setShowManageModal(false);
    } catch (error) {
      console.error("Save addon service error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to save addon service."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE SERVICE
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await addonApi.deleteService(id);

      if (!response?.success) {
        toast.error(
          response?.message || "Failed to delete service."
        );

        return;
      }

      setServices((prev) =>
        prev.filter((service) => service._id !== id)
      );

      toast.success("Add-on service deleted!");
    } catch (error) {
      console.error("Delete addon service error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to delete addon service."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // BOOK SERVICE
  // =====================================================

  const handleBook = async (e) => {
    e.preventDefault();

    if (!profile) {
      toast.error(
        "Please login to book add-on services."
      );

      return;
    }

    if (!bookingService) return;

    try {
      setBookingLoading(true);

      const payload = {
        profileId: profile._id,
        serviceId: bookingService._id,
        notes: bookingNotes.trim() || undefined,
      };

      const response =
        await addonApi.createBooking(payload);

      if (!response?.success) {
        toast.error(
          response?.message ||
          "Failed to create booking request."
        );

        return;
      }

      toast.success(
        `Booking request for ${bookingService.name} submitted successfully! Support staff will reach out to schedule.`
      );

      setBookingService(null);
      setBookingNotes("");
      fetchBookings();
    } catch (error) {
      console.error(
        "Create addon booking error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
        "Failed to create booking request."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-background relative overflow-hidden py-12">

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 h-80 w-80 rounded-full bg-primary/10 opacity-30 blur-3xl" />

        <div className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-accent/10 opacity-40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">

        {/* =====================================================
            HERO
        ===================================================== */}

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-border/40">

          <div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">

              <Sparkles className="h-3.5 w-3.5" />

              Marketplace Add-ons

            </div>

            <h1 className="font-display text-4xl font-extrabold tracking-tight mt-2 text-foreground">
              Add-on Services &{" "}
              <span className="text-gradient-sunset">
                Rentals
              </span>
            </h1>

            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              Rent high-end equipment, podcast recording studios, hire videographers, video editors, or dedicated support staff for your next campaign.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Tab switch */}
            <div className="flex rounded-full bg-secondary/30 p-1.5 border border-border/40 text-xs font-semibold shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab("services")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 ${
                  activeTab === "services"
                    ? "gradient-sunset text-white shadow-glow border-0 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Services & Rentals
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("bookings");
                  fetchBookings();
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 relative ${
                  activeTab === "bookings"
                    ? "gradient-sunset text-white shadow-glow border-0 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ClipboardList className="h-3.5 w-3.5" />
                {isAdmin ? "Booking Requests" : "My Bookings"}
                {bookings.length > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === "bookings"
                        ? "bg-white/25 text-white"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {bookings.length}
                  </span>
                )}
              </button>
            </div>

            {isAdmin && activeTab === "services" && (
              <Button
                onClick={handleOpenCreate}
                className="btn-bouncy rounded-full gradient-sunset border-0 text-white font-semibold shadow-glow hover:opacity-95"
              >
                <Plus className="h-4.5 w-4.5 mr-2" />
                Add Service
              </Button>
            )}
          </div>

        </div>

        {/* =====================================================
            SERVICES OR BOOKINGS
        ===================================================== */}

        {activeTab === "services" ? (
          services.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card">
              <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="font-semibold text-sm text-muted-foreground">
                No add-on services or rentals available yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="rounded-3xl border border-border bg-card flex flex-col justify-between overflow-hidden relative shadow-sm hover:shadow-elevated transition-all duration-200 group"
                >
                  {/* Image */}
                  <div className="space-y-4">
                    <div className="h-48 w-full bg-secondary/50 relative overflow-hidden">
                      <img
                        src={
                          service.imageUrl ||
                          "https://images.unsplash.com/photo-1590608897129-79da98d15969?w=800"
                        }
                        alt={service.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Details */}
                    <div className="p-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-base font-bold text-foreground">
                          {service.name}
                        </h4>
                        <span className="text-sm font-bold text-gradient-sunset">
                          ₹
                          {Number(
                            service.price || 0
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0 flex justify-between items-center">
                    <Button
                      size="sm"
                      className="btn-bouncy rounded-full font-bold px-6 gradient-sunset text-white border-0 shadow-glow hover:opacity-95 transition-all disabled:opacity-50 disabled:shadow-none"
                      disabled={!service.enabled}
                      onClick={() => {
                        if (!profile) {
                          toast.error(
                            "Please login to proceed with booking."
                          );
                          return;
                        }
                        setBookingService(service);
                      }}
                    >
                      {service.enabled
                        ? "Book Now"
                        : "Currently Unavailable"}
                    </Button>

                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full"
                          onClick={() =>
                            handleOpenEdit(service)
                          }
                        >
                          <Calendar className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={
                            deletingId === service._id
                          }
                          className="h-8 w-8 rounded-full text-red-500 hover:text-red-500 hover:bg-red-500/10"
                          onClick={() =>
                            handleDelete(service._id)
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* =====================================================
              BOOKINGS LIST
          ===================================================== */
          <div>
            {bookingsLoading ? (
              <div className="rounded-3xl border border-border p-12 text-center bg-card">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-3" />
                <p className="text-xs text-muted-foreground font-medium">
                  Loading bookings...
                </p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card">
                <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="font-semibold text-sm text-muted-foreground">
                  {isAdmin ? "No booking requests found" : "You have not made any booking requests yet"}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1 max-w-sm mx-auto">
                  Browse available Add-ons and rentals above to submit a booking request.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
                  <span>
                    Showing {bookings.length} {isAdmin ? "booking request(s)" : "of your booking(s)"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookings.map((booking) => {
                    const service = booking.serviceId;
                    const requester = booking.profileId;
                    const isPending = booking.status === "pending";
                    const isConfirmed = booking.status === "confirmed";
                    const isCancelled = booking.status === "cancelled";

                    return (
                      <div
                        key={booking._id}
                        className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4 transition-all hover:border-border"
                      >
                        {/* Header: Service Name & Status Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                              {service?.name ? "Add-on Request" : "Service"}
                            </span>
                            <h3 className="font-display text-base font-bold text-foreground">
                              {service?.name || "Add-on Service"}
                            </h3>
                            {service?.price && (
                              <span className="inline-block text-xs font-semibold text-muted-foreground">
                                ₹{Number(service.price).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                                isConfirmed
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                  : isCancelled
                                  ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              }`}
                            >
                              {isConfirmed && <CheckCircle2 className="h-3 w-3" />}
                              {isCancelled && <XCircle className="h-3 w-3" />}
                              {isPending && <Clock className="h-3 w-3" />}
                              {booking.status}
                            </span>

                            {/* Delete button */}
                            <Button
                              size="icon"
                              variant="ghost"
                              disabled={updatingBookingId === booking._id}
                              className="h-7 w-7 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                              title="Delete booking request"
                              onClick={() => handleDeleteBooking(booking._id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Customer / Requester Details (Especially for Admin) */}
                        {requester && (
                          <div className="rounded-xl bg-secondary/20 p-2.5 flex items-center gap-2.5 text-xs">
                            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                              {requester.fullName?.[0] || "U"}
                            </div>
                            <div className="truncate">
                              <p className="font-semibold text-foreground truncate">
                                {requester.fullName}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {requester.email} {requester.role ? `• ${requester.role}` : ""}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {booking.notes && (
                          <div className="text-xs bg-background/50 rounded-xl p-3 border border-border/40 text-foreground/90">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                              Requester Notes:
                            </p>
                            <p className="italic leading-relaxed">"{booking.notes}"</p>
                          </div>
                        )}

                        {/* Date and actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                          <span>
                            {new Date(booking.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>

                          {/* Admin action buttons */}
                          {isAdmin && (
                            <div className="flex items-center gap-1.5">
                              {booking.status !== "confirmed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={updatingBookingId === booking._id}
                                  className="h-7 text-xs rounded-full px-2.5 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400"
                                  onClick={() => handleUpdateBookingStatus(booking._id, "confirmed")}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Confirm
                                </Button>
                              )}

                              {booking.status !== "cancelled" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={updatingBookingId === booking._id}
                                  className="h-7 text-xs rounded-full px-2.5 text-red-500 border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                                  onClick={() => handleUpdateBookingStatus(booking._id, "cancelled")}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                              )}

                              {booking.status !== "pending" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={updatingBookingId === booking._id}
                                  className="h-7 text-xs rounded-full px-2 text-muted-foreground"
                                  onClick={() => handleUpdateBookingStatus(booking._id, "pending")}
                                >
                                  Reset
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      <Dialog
        open={showManageModal}
        onOpenChange={setShowManageModal}
      >

        <DialogContent className="sm:max-w-md rounded-3xl border border-border bg-card p-6">

          <DialogHeader>

            <DialogTitle className="font-display text-lg font-bold">

              {editingService
                ? "Edit Service details"
                : "Create Add-on Service"}

            </DialogTitle>

            <DialogDescription className="text-xs text-muted-foreground">

              Add products or rental spaces to the
              platform marketplace list.

            </DialogDescription>

          </DialogHeader>

          <form
            onSubmit={handleSave}
            className="space-y-4"
          >

            {/* Name */}

            <div className="space-y-1.5">

              <label className="text-xs font-semibold text-foreground">
                Service/Product Name *
              </label>

              <Input
                required
                placeholder="e.g. Gadget Rental"
                value={formName}
                onChange={(e) =>
                  setFormName(e.target.value)
                }
              />

            </div>

            {/* Price / Status */}

            <div className="grid grid-cols-2 gap-4">

              <div className="space-y-1.5">

                <label className="text-xs font-semibold text-foreground">
                  Rate (Price in INR) *
                </label>

                <Input
                  type="number"
                  min="0"
                  required
                  placeholder="₹"
                  value={formPrice}
                  onChange={(e) =>
                    setFormPrice(
                      Number(e.target.value)
                    )
                  }
                />

              </div>

              <div className="space-y-1.5">

                <label className="text-xs font-semibold text-foreground">
                  Status *
                </label>

                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  value={
                    formEnabled
                      ? "enabled"
                      : "disabled"
                  }
                  onChange={(e) =>
                    setFormEnabled(
                      e.target.value === "enabled"
                    )
                  }
                >

                  <option value="enabled">
                    Enabled
                  </option>

                  <option value="disabled">
                    Disabled
                  </option>

                </select>

              </div>

            </div>

            {/* Image */}

            <div className="space-y-1.5">

              <label className="text-xs font-semibold text-foreground">
                Image Link
              </label>

              <Input
                placeholder="URL"
                value={formCover}
                onChange={(e) =>
                  setFormCover(e.target.value)
                }
              />

            </div>

            {/* Description */}

            <div className="space-y-1.5">

              <label className="text-xs font-semibold text-foreground">
                Description *
              </label>

              <Textarea
                required
                placeholder="Write details..."
                value={formDesc}
                onChange={(e) =>
                  setFormDesc(e.target.value)
                }
              />

            </div>

            <DialogFooter className="pt-2">

              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() =>
                  setShowManageModal(false)
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="rounded-full gradient-sunset border-0 text-white font-semibold"
              >
                {saving
                  ? "Saving..."
                  : editingService
                    ? "Save Changes"
                    : "Save Product"}
              </Button>

            </DialogFooter>

          </form>

        </DialogContent>

      </Dialog>

      {/* =====================================================
          BOOKING MODAL
      ===================================================== */}

      <Dialog
        open={!!bookingService}
        onOpenChange={(open) => {
          if (!open) {
            setBookingService(null);
            setBookingNotes("");
          }
        }}
      >

        <DialogContent className="sm:max-w-md rounded-3xl border border-border bg-card p-6">

          <DialogHeader>

            <DialogTitle className="font-display text-lg font-bold">
              Book Add-on Service
            </DialogTitle>

            <DialogDescription className="text-xs text-muted-foreground">

              Submit scheduling requests. Payment details
              will be negotiated directly.

            </DialogDescription>

          </DialogHeader>

          {bookingService && (

            <form
              onSubmit={handleBook}
              className="space-y-4"
            >

              {/* Selected service */}

              <div className="space-y-1.5 bg-secondary/15 border border-border/40 rounded-2xl p-4">

                <span className="block text-[10px] font-bold text-primary uppercase tracking-wider">
                  Service Selected
                </span>

                <span className="block text-sm font-bold text-foreground mt-1">
                  {bookingService.name}
                </span>

                <span className="block text-xs font-semibold text-muted-foreground">
                  Price: ₹
                  {Number(
                    bookingService.price || 0
                  ).toLocaleString("en-IN")}
                </span>

              </div>

              {/* Notes */}

              <div className="space-y-1.5">

                <label className="text-xs font-semibold text-foreground">
                  Scheduling Notes & Timing details
                </label>

                <Textarea
                  placeholder="Tell us about your timing preferences, location requirements, or specific requests..."
                  value={bookingNotes}
                  onChange={(e) =>
                    setBookingNotes(
                      e.target.value
                    )
                  }
                />

              </div>

              <DialogFooter className="pt-2">

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setBookingService(null);
                    setBookingNotes("");
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={bookingLoading}
                  className="rounded-full gradient-sunset border-0 text-white font-semibold"
                >
                  {bookingLoading
                    ? "Submitting..."
                    : "Confirm Booking Request"}
                </Button>

              </DialogFooter>

            </form>

          )}

        </DialogContent>

      </Dialog>

    </div>
  );
}