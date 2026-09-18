import { useState, useEffect } from "react";
import { Plus, Clock, Tag, Sparkles, CheckCircle2, AlertCircle, Trash2, Building2, Gift, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import api from "@/lib/api";

const VALIDITY_OPTIONS = [
  { label: "24 Hours (1 Day)", hours: 24 },
  { label: "48 Hours (2 Days)", hours: 48 },
  { label: "72 Hours (3 Days)", hours: 72 },
  { label: "7 Days (1 Week)", hours: 168 },
];

export function MultiRoleOfferForm({ profileId, role = "creator", onOfferCreated }) {
  const isCreator = role === "creator";
  const [offerTitle, setOfferTitle] = useState("");
  const [offerCategory, setOfferCategory] = useState("discount");
  const [discountPercent, setDiscountPercent] = useState(20);
  const [monetaryBonus, setMonetaryBonus] = useState("");
  const [conditionText, setConditionText] = useState("");
  const [validityHours, setValidityHours] = useState(48);
  const [loading, setLoading] = useState(false);
  const [myOffers, setMyOffers] = useState([]);
  const [fetchingOffers, setFetchingOffers] = useState(false);

  const fetchMyOffers = async () => {
    if (!profileId) return;
    try {
      setFetchingOffers(true);
      const res = await api.get(`/offers/mine/${profileId}`);
      if (res.data?.success) {
        setMyOffers(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch my offers:", err);
    } finally {
      setFetchingOffers(false);
    }
  };

  useEffect(() => {
    fetchMyOffers();
  }, [profileId]);

  const handleDeleteOffer = async (offerId) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    // Optimistically update UI immediately without refresh
    setMyOffers((prev) => prev.filter((o) => o._id !== offerId));
    try {
      await api.delete(`/offers/${offerId}`);
      toast.success("Offer deleted successfully.");
    } catch (err) {
      console.error("Failed to delete offer:", err);
      toast.error(err.response?.data?.message || "Failed to delete offer.");
      fetchMyOffers();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offerTitle.trim()) {
      toast.error("Please enter an offer title.");
      return;
    }
    if (!conditionText.trim()) {
      toast.error("Please describe your offer terms or condition.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        offerTitle: offerTitle.trim(),
        conditionText: conditionText.trim(),
        offerCategory,
        validityHours: Number(validityHours),
        discountPercent: offerCategory === "discount" ? Number(discountPercent) : null,
        monetaryBonus: offerCategory === "monetary_bonus" ? Number(monetaryBonus) : null,
      };

      const res = await api.post("/offers", payload);

      if (res.data?.success) {
        toast.success("Offer submitted for Admin approval! You'll be notified when it goes live.");
        setOfferTitle("");
        setConditionText("");
        setMonetaryBonus("");
        setDiscountPercent(20);
        fetchMyOffers();
        if (onOfferCreated) onOfferCreated(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit offer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Creation Card */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {isCreator ? "Launch a Limited-Time Discount Offer" : "Post an Exclusive Brand Incentive Offer"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isCreator
                ? "Offer limited-time booking discounts to attract brands. Broadcasts after admin approval."
                : "Post bonuses, perks, or extra incentives for creators to collaborate on campaigns."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Offer Title *
            </label>
            <input
              type="text"
              placeholder={isCreator ? "e.g. 50% Flash Discount for 2 Days" : "e.g. ₹5,000 Bonus for Fast Turnaround"}
              value={offerTitle}
              onChange={(e) => setOfferTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category / Perk */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Offer Type</label>
              <select
                value={offerCategory}
                onChange={(e) => setOfferCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="discount">Percentage Discount (%)</option>
                <option value="monetary_bonus">Cash / Monetary Bonus (₹)</option>
                <option value="free_addon">Free Add-on / Deliverable</option>
                <option value="custom">Custom Terms</option>
              </select>
            </div>

            {/* Validity */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Duration (Once Approved)
              </label>
              <select
                value={validityHours}
                onChange={(e) => setValidityHours(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {VALIDITY_OPTIONS.map((opt) => (
                  <option key={opt.hours} value={opt.hours}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional Input based on category */}
          {offerCategory === "discount" && (
            <div className="space-y-1.5 rounded-2xl bg-secondary/20 p-3 border border-border/50">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Discount Percentage</span>
                <span className="text-primary font-bold">{discountPercent}% OFF</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="90"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-secondary rounded-lg cursor-pointer"
                />
                <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 px-3 py-1 text-xs font-bold text-primary shrink-0">
                  <Tag className="h-3 w-3" />
                  {discountPercent}%
                </div>
              </div>
            </div>
          )}

          {offerCategory === "monetary_bonus" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Bonus Amount (₹ INR) *
              </label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={monetaryBonus}
                onChange={(e) => setMonetaryBonus(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          )}

          {/* Condition Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Offer Condition & Terms *
            </label>
            <textarea
              placeholder={
                isCreator
                  ? 'e.g. "Hire me within 48 hours for 2 Instagram Reels and pay only 50%!"'
                  : 'e.g. "First 3 verified creators to accept this campaign get an extra ₹5,000 product voucher."'
              }
              value={conditionText}
              onChange={(e) => setConditionText(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 min-h-[70px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              maxLength={200}
              required
            />
            <p className="text-[10px] text-muted-foreground text-right">
              {conditionText.length}/200 characters
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={loading || !offerTitle.trim() || !conditionText.trim()}
              className="gradient-sunset text-white text-xs font-medium px-5 py-2.5 rounded-full flex items-center gap-2 shadow-glow"
            >
              <Plus className="h-4 w-4" />
              {loading ? "Submitting Offer..." : "Submit for Admin Review"}
            </Button>
          </div>
        </form>
      </div>

      {/* Offer Submissions History */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center justify-between">
          <span>My Offers History</span>
          <button
            onClick={fetchMyOffers}
            className="text-xs text-primary hover:underline font-normal"
          >
            Refresh
          </button>
        </h4>

        {fetchingOffers ? (
          <div className="h-20 rounded-xl bg-secondary/30 animate-pulse" />
        ) : myOffers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            You haven't submitted any offers yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myOffers.map((offer) => {
              const isExpired = offer.expiresAt && new Date(offer.expiresAt).getTime() < Date.now();
              const isPending = offer.status === "pending_approval";
              const isRejected = offer.status === "rejected";
              const isDeleted = offer.status === "deleted";

              return (
                <div
                  key={offer._id}
                  className="rounded-2xl border border-border bg-card/60 p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-foreground truncate">
                      {offer.offerTitle}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                        isPending
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : isRejected
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : isDeleted
                          ? "bg-muted text-muted-foreground"
                          : isExpired
                          ? "bg-muted text-muted-foreground"
                          : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      }`}
                    >
                      {isPending
                        ? "Pending Approval"
                        : isRejected
                        ? "Rejected"
                        : isDeleted
                        ? "Deleted"
                        : isExpired
                        ? "Expired"
                        : "Active & Live"}
                    </span>
                  </div>

                  <p className="text-muted-foreground">"{offer.conditionText}"</p>

                  {isRejected && offer.rejectionReason && (
                    <p className="text-[11px] text-red-500 bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                      Reason: {offer.rejectionReason}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <span>Duration: {offer.validityHours}h</span>
                    {offer.expiresAt && (
                      <span>
                        Expires: {new Date(offer.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteOffer(offer._id)}
                      className="text-destructive hover:bg-destructive/10 p-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                      title="Delete Offer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-semibold">Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export const CreatorOfferForm = MultiRoleOfferForm;

export default MultiRoleOfferForm;
