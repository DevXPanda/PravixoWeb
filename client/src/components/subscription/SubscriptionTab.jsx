import { useEffect, useState } from "react";
import api from "../../lib/api";
import Button from "../ui/Button"
import { toast } from "sonner";
import {
  Check,
  X,
  Sparkles,
  Clock,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import Separator from "../ui/Seperator";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export function SubscriptionTab({ role, profile }) {
  const [currentSub, setCurrentSub] = useState(null);
  const [pendingSub, setPendingSub] = useState(null);
  const [packages, setPackages] = useState([]);
  const [offers, setOffers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [upgradingId, setUpgradingId] = useState(null);

  // =====================================================
  // FETCH SUBSCRIPTION DATA
  // =====================================================

  const fetchSubscriptionData = async () => {
    if (!profile?._id) return;

    try {
      setLoading(true);

      const userRole = role || profile?.role || (profile?.accountType === "brand" ? "brand" : "creator");
      const [
        subscriptionResponse,
        packagesResponse,
        offersResponse,
      ] = await Promise.all([
        api.get(`/subscriptions/user/${profile._id}`),
        api.get(`/subscriptions/packages?role=${userRole}`),
        api.get(`/subscriptions/offers`),
      ]);

      setCurrentSub(
        subscriptionResponse.data?.data || null
      );

      setPendingSub(
        subscriptionResponse.data?.pending || null
      );

      setPackages(
        packagesResponse.data?.data || []
      );

      setOffers(
        offersResponse.data?.data || []
      );
    } catch (error) {
      console.error(
        "Failed to fetch subscription data:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load subscription details."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchSubscriptionData();
  }, [profile?._id]);

  // =====================================================
  // ACTIVE OFFER FOR CURRENT ROLE
  // =====================================================

  const activeOffer = offers?.find((offer) => {
    const roleMatches =
      offer.targetUsers === "both" ||
      (offer.targetUsers === "brands" &&
        role === "brand") ||
      (offer.targetUsers === "creators" &&
        role === "creator");

    return roleMatches;
  });

  // =====================================================
  // HANDLE SUBSCRIPTION (DIRECT PAYMENT GATEWAY)
  // =====================================================

  const handleUpgrade = async (
    packageId,
    offerId = undefined
  ) => {
    if (!profile?._id) {
      toast.error("Profile not found.");
      return;
    }

    try {
      setUpgradingId(packageId);

      // 1. Create Razorpay Order
      const orderRes = await api.post(`/subscriptions/order`, {
        profileId: profile._id,
        packageId,
        ...(offerId && { offerId }),
      });

      const orderData = orderRes.data?.data;
      if (!orderData || !orderData.orderId) {
        throw new Error("Unable to create checkout order.");
      }

      // 2. Open Razorpay Checkout Modal
      if (typeof window.Razorpay === "undefined") {
        // Fallback if Razorpay script is not loaded in window: direct activation
        const directRes = await api.post(`/subscriptions`, {
          profileId: profile._id,
          packageId,
          ...(offerId && { offerId }),
        });
        toast.success(directRes.data?.message || "Package activated successfully!");
        await fetchSubscriptionData();
        return;
      }

      const options = {
        key: orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Pravixo Platform",
        description: `Activation of ${orderData.package?.name || "Add-on"} Plan (₹${orderData.package?.price || 0})`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            setUpgradingId(packageId);
            const verifyRes = await api.post(`/subscriptions/verify`, {
              profileId: profile._id,
              packageId,
              offerId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            toast.success(
              verifyRes.data?.message ||
                "Payment successful! Your package is now instantly active."
            );

            // Refresh subscription data
            await fetchSubscriptionData();
          } catch (verifyErr) {
            console.error("Subscription verify error:", verifyErr);
            toast.error(
              verifyErr.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );
          } finally {
            setUpgradingId(null);
          }
        },
        prefill: {
          name: profile.fullName || "",
          email: profile.email || user?.email || "",
        },
        theme: {
          color: "#EC4899",
        },
        modal: {
          ondismiss: () => {
            setUpgradingId(null);
            toast.info("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Subscription upgrade error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to initiate payment gateway."
      );
      setUpgradingId(null);
    }
  };

  // =====================================================
  // OFFER TIME LEFT
  // =====================================================

  const getOfferTimeLeft = (expiry) => {
    const diff =
      Number(expiry) - Date.now();

    if (diff <= 0) {
      return "Expired";
    }

    const days = Math.floor(
      diff / (1000 * 60 * 60 * 24)
    );

    const hours = Math.floor(
      (diff %
        (1000 * 60 * 60 * 24)) /
        (1000 * 60 * 60)
    );

    return days > 0
      ? `${days}d ${hours}h remaining`
      : `${hours}h remaining`;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // =====================================================
  // CURRENT PACKAGE
  // =====================================================

  const currentPackage =
    currentSub?.packageId || null;

  const currentPackageId =
    currentPackage?._id || null;

  const currentPlanName =
    currentPackage?.name || "Starter";

  const currentPrice =
    currentPackage?.price ?? 0;

  const currentBadge =
    currentPackage?.badge || null;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

        <div>

          <h2 className="font-display text-2xl font-bold flex items-center gap-2">

            <Sparkles className="h-6 w-6 text-primary" />

            {role === "brand" ? "Add-on Services & Creator Packages" : "Creator Packages & Subscription"}

          </h2>

          <p className="text-sm text-muted-foreground mt-1">
            {role === "brand"
              ? "End-to-end creator communication, shortlisting, video production guidelines & status analytics managed by Pravixo."
              : "Upgrade your creator plan to unlock verified badge, priority brand invites, unlimited campaign applications, and higher referral income."}
          </p>

        </div>

        {/* CURRENT PACKAGE */}

        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4 flex flex-col items-center md:items-start min-w-[200px]">

          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
            Current Plan
          </span>

          <span className="text-xl font-bold text-foreground mt-1 flex items-center gap-1.5">

            {currentPlanName}

            {currentBadge && (
              <span className="text-[9px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                {currentBadge}
              </span>
            )}

          </span>

          <span className="text-xs text-muted-foreground mt-1.5">

            {currentPrice === 0
              ? "Free Lifetime Access"
              : currentSub?.expiryDate
              ? `Renews on ${format(
                  new Date(currentSub.expiryDate),
                  "MMM d, yyyy"
                )}`
              : "Active"}

          </span>

        </div>
      </div>

      {/* =================================================
          PENDING UPGRADE REQUEST ALERT BANNER
      ================================================= */}

      {pendingSub && (
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-foreground">
                  Upgrade Request Under Review
                </h3>
                <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Pending Admin Approval
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                You requested to upgrade to the{" "}
                <strong className="text-foreground">
                  {pendingSub.packageId?.name || "selected"}
                </strong>{" "}
                plan. The admin has been notified and your plan will be activated once approved.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSubscriptionData}
            className="rounded-full text-xs shrink-0 border-amber-500/40 text-amber-600 hover:bg-amber-500/15"
          >
            Check Status
          </Button>
        </div>
      )}

      {/* =================================================
          SPECIAL OFFER
      ================================================= */}

      {activeOffer && (
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">

          <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

          <div className="space-y-1 relative z-10">

            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 text-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">

              <Clock className="h-3 w-3" />

              Special Promo Active

            </div>

            <h3 className="font-display text-lg font-bold text-foreground mt-1">
              {activeOffer.name}
            </h3>

            <p className="text-xs text-muted-foreground">
              {activeOffer.description}
            </p>

          </div>

          <div className="flex items-center gap-4 relative z-10 w-full md:w-auto justify-between md:justify-end">

            <div className="text-right">

              <span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Expires In
              </span>

              <span className="text-sm font-semibold text-primary">
                {getOfferTimeLeft(
                  activeOffer.expiryDate
                )}
              </span>

            </div>

            <Button
              className="rounded-full gradient-sunset border-0 text-white font-semibold text-xs shadow-glow"
              onClick={() =>
                handleUpgrade(
                  activeOffer.packageId?._id ||
                    activeOffer.packageId,
                  activeOffer._id
                )
              }
              disabled={
                upgradingId !== null ||
                currentPackageId ===
                  (activeOffer.packageId?._id ||
                    activeOffer.packageId)
              }
            >

              {currentPackageId ===
              (activeOffer.packageId?._id ||
                activeOffer.packageId)
                ? "Already Subscribed"
                : activeOffer.buttonText ||
                  "Claim Deal"}

            </Button>

          </div>
        </div>
      )}

      {/* =================================================
          PACKAGES
      ================================================= */}

      <div className="space-y-4">

        <h3 className="font-display text-lg font-bold">
          Select Packages
        </h3>

        {packages.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card">

            <CreditCard className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />

            <p className="font-semibold text-sm text-muted-foreground">
              No packages available
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              Please check back later or contact admin
              to add subscription packages.
            </p>

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {packages.map((pkg) => {

              const isActive =
                currentPackageId === pkg._id;

              const offerPackageId =
                activeOffer?.packageId?._id ||
                activeOffer?.packageId;

              const hasPromo =
                !!activeOffer &&
                offerPackageId === pkg._id;

              // -----------------------------
              // Discounted Price
              // -----------------------------

              let finalPrice = pkg.price;

              if (hasPromo) {

                if (
                  activeOffer.discountPercentage
                ) {
                  finalPrice =
                    pkg.price *
                    (
                      1 -
                      activeOffer.discountPercentage /
                        100
                    );
                } else if (
                  activeOffer.discountAmount
                ) {
                  finalPrice = Math.max(
                    0,
                    pkg.price -
                      activeOffer.discountAmount
                  );
                }

              }

              const isPending =
                pendingSub?.packageId?._id === pkg._id ||
                pendingSub?.packageId === pkg._id;

              return (
                <div
                  key={pkg._id}
                  className={`rounded-3xl border p-6 flex flex-col justify-between relative bg-card ${
                    isActive
                      ? "border-primary shadow-elevated"
                      : isPending
                      ? "border-amber-500/50 shadow-sm bg-amber-500/[0.02]"
                      : "border-border hover:border-border/80 hover:shadow-sm"
                  }`}
                >

                  {/* BADGE */}

                  {isPending ? (
                    <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Pending Approval
                    </span>
                  ) : pkg.badge ? (
                    <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">
                      {pkg.badge}
                    </span>
                  ) : null}

                  <div className="space-y-4">

                    <div>

                      <h4 className="font-display text-lg font-bold text-foreground">
                        {pkg.name}
                      </h4>

                      <div className="mt-2 flex items-baseline gap-2 flex-wrap">

                        {hasPromo ? (
                          <>
                            <span className="text-2xl font-black text-foreground font-display">
                              ₹
                              {Math.round(
                                finalPrice
                              ).toLocaleString("en-IN")}
                            </span>

                            <span className="text-sm font-semibold text-muted-foreground line-through opacity-70">
                              ₹{(pkg.originalPrice || pkg.price * 2).toLocaleString("en-IN")}
                            </span>

                            <span className="text-xs text-muted-foreground">
                              /{pkg.billingPeriod}
                            </span>
                          </>
                        ) : pkg.originalPrice && pkg.originalPrice > pkg.price ? (
                          <>
                            <span className="text-2xl font-black text-foreground font-display">
                              ₹{pkg.price.toLocaleString("en-IN")}
                            </span>

                            <span className="text-sm font-semibold text-muted-foreground line-through opacity-70">
                              ₹{pkg.originalPrice.toLocaleString("en-IN")}
                            </span>

                            <span className="text-xs text-muted-foreground">
                              /{pkg.billingPeriod}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl font-black text-foreground font-display">
                              ₹{pkg.price.toLocaleString("en-IN")}
                            </span>

                            {pkg.price > 0 && (
                              <span className="text-sm font-semibold text-muted-foreground line-through opacity-70">
                                ₹{(pkg.price * 2).toLocaleString("en-IN")}
                              </span>
                            )}

                            <span className="text-xs text-muted-foreground">
                              /{pkg.billingPeriod}
                            </span>
                          </>
                        )}

                      </div>

                    </div>

                    <Separator />

                    <ul className="space-y-2.5 text-xs text-muted-foreground">

                      {pkg.features?.map(
                        (feature, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2"
                          >

                            <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />

                            <span>
                              {feature}
                            </span>

                          </li>
                        )
                      )}

                    </ul>

                  </div>

                  {/* BUTTON */}

                  <div className="mt-8">

                    {isActive ? (
                      <Button
                        className="w-full rounded-full cursor-default"
                        variant="secondary"
                        disabled
                      >
                        Active Plan
                      </Button>
                    ) : isPending ? (
                      <Button
                        className="w-full rounded-full cursor-default border-amber-500/30 text-amber-500 bg-amber-500/10 hover:bg-amber-500/10 font-semibold"
                        variant="outline"
                        disabled
                      >
                        <Clock className="h-4 w-4 mr-1.5" />
                        Approval Pending
                      </Button>
                    ) : (
                      <Button
                        className={`w-full rounded-full font-semibold ${
                          pkg.name === "Pro"
                            ? "gradient-sunset border-0 text-white shadow-glow"
                            : ""
                        }`}
                        variant={
                          pkg.name === "Pro"
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          handleUpgrade(
                            pkg._id,
                            hasPromo
                              ? activeOffer._id
                              : undefined
                          )
                        }
                        disabled={
                          upgradingId !== null || pendingSub !== null
                        }
                      >
                        {upgradingId === pkg._id
                          ? "Requesting..."
                          : pendingSub !== null
                          ? "Request In Review"
                          : `Upgrade to ${pkg.name}`}
                      </Button>
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* =================================================
          CREATOR 3-MONTH PRO TRIAL & ELITE 50% OFF INFO BANNER
      ================================================= */}
      <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-3.5">
          <div className="h-10 w-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0 shadow-inner">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display font-bold text-sm text-foreground">
                Special Creator Welcome: 3 Months Pro Free Trial
              </h3>
              <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Active Offer
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All creators get 3 months of complimentary <strong className="text-foreground font-semibold">Pro Plan (₹999 value)</strong> access. After 3 months, your account automatically continues on the <strong className="text-foreground font-semibold">Starter Plan</strong> with no hidden fees, or you can upgrade with an exclusive <strong className="text-primary font-semibold">50% OFF on Elite (₹999/yr)</strong>!
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          FEATURE COMPARISON
      ================================================= */}

      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">

        <div className="p-6 border-b border-border bg-secondary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">

          <div>
            <h3 className="font-display text-base font-bold">
              Compare Package Features & Tiers
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Transparent side-by-side comparison of Starter, Pro, and Elite plans.
            </p>
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm text-left">

            <thead>

              <tr className="border-b border-border bg-secondary/5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">

                <th className="p-4 pl-6">
                  Feature / Capability
                </th>

                <th className="p-4 text-center">
                  Starter
                </th>

                <th className="p-4 text-center text-primary">
                  Pro (Popular)
                </th>

                <th className="p-4 text-center text-amber-500">
                  Elite (Best Value)
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-border/30">

              <tr className="hover:bg-secondary/5">

                <td className="p-4 pl-6 font-medium text-foreground">
                  Annual Plan Pricing
                </td>

                <td className="p-4 text-center font-bold text-muted-foreground">
                  ₹0 <span className="text-[10px] font-normal block text-muted-foreground/80">Lifetime Free</span>
                </td>

                <td className="p-4 text-center font-bold text-foreground">
                  ₹999 <span className="text-[10px] font-normal block text-primary font-semibold">Free 1st 3 Months</span>
                </td>

                <td className="p-4 text-center font-bold text-foreground">
                  ₹1,999 <span className="text-[10px] font-normal block text-amber-500 font-semibold">₹999 with 50% Promo</span>
                </td>

              </tr>

              <tr className="hover:bg-secondary/5">

                <td className="p-4 pl-6 font-medium text-foreground">
                  Welcome Promotional Benefit
                </td>

                <td className="p-4 text-center text-xs text-muted-foreground">
                  Free Forever
                </td>

                <td className="p-4 text-center text-xs text-primary font-semibold">
                  3 Months Free Access
                </td>

                <td className="p-4 text-center text-xs text-emerald-500 font-semibold">
                  50% Launch Discount
                </td>

              </tr>

              <tr className="hover:bg-secondary/5">

                <td className="p-4 pl-6 font-medium text-foreground">
                  Campaign Limits
                </td>

                <td className="p-4 text-center font-semibold text-muted-foreground">
                  2 / month
                </td>

                <td className="p-4 text-center text-primary font-semibold">
                  15 / month
                </td>

                <td className="p-4 text-center text-emerald-500 font-bold">
                  Unlimited
                </td>

              </tr>

              <tr className="hover:bg-secondary/5">

                <td className="p-4 pl-6 font-medium text-foreground">
                  Direct Chat & Messaging
                </td>

                <td className="p-4 text-center text-muted-foreground text-xs">
                  Limited Basic
                </td>

                <td className="p-4 text-center text-emerald-600 font-semibold text-xs">
                  Unlimited
                </td>

                <td className="p-4 text-center text-emerald-600 font-semibold text-xs">
                  Unlimited + Media
                </td>

              </tr>

              <tr className="hover:bg-secondary/5">

                <td className="p-4 pl-6 font-medium text-foreground">
                  Verification Badge
                </td>

                <td className="p-4 text-center">
                  <X className="h-4 w-4 mx-auto text-muted-foreground/30" />
                </td>

                <td className="p-4 text-center">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500">
                    <Check className="h-3.5 w-3.5 text-blue-500" />
                    Verified Blue
                  </span>
                </td>

                <td className="p-4 text-center">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
                    <Check className="h-3.5 w-3.5 text-amber-500" />
                    Elite Gold
                  </span>
                </td>

              </tr>

              <tr className="hover:bg-secondary/5">

                <td className="p-4 pl-6 font-medium text-foreground">
                  Support Level
                </td>

                <td className="p-4 text-center text-xs text-muted-foreground">
                  Standard Support
                </td>

                <td className="p-4 text-center text-xs font-medium text-primary">
                  Priority Support
                </td>

                <td className="p-4 text-center text-xs font-bold text-amber-500">
                  24/7 VIP Dedicated
                </td>

              </tr>

              <tr className="hover:bg-secondary/5">

                <td className="p-4 pl-6 font-medium text-foreground">
                  Refer & Earn Commission
                </td>

                <td className="p-4 text-center font-bold text-muted-foreground">
                  5%
                </td>

                <td className="p-4 text-center font-bold text-primary">
                  7.5%
                </td>

                <td className="p-4 text-center font-bold text-emerald-500">
                  10% (Max Tier)
                </td>

              </tr>

              <tr className="hover:bg-secondary/5">

                <td className="p-4 pl-6 font-medium text-foreground">
                  1-on-1 Dedicated Account Manager
                </td>

                <td className="p-4 text-center">
                  <X className="h-4 w-4 mx-auto text-muted-foreground/30" />
                </td>

                <td className="p-4 text-center">
                  <X className="h-4 w-4 mx-auto text-muted-foreground/30" />
                </td>

                <td className="p-4 text-center">
                  <Check className="h-4 w-4 mx-auto text-emerald-500" />
                </td>

              </tr>

              <tr className="hover:bg-secondary/5">

                <td className="p-4 pl-6 font-medium text-foreground">
                  Discovery & Search Priority
                </td>

                <td className="p-4 text-center text-xs text-muted-foreground">
                  Standard
                </td>

                <td className="p-4 text-center text-xs text-primary font-medium">
                  High Visibility
                </td>

                <td className="p-4 text-center text-xs text-amber-500 font-bold">
                  Top Featured Placement
                </td>

              </tr>

              <tr className="hover:bg-secondary/5">

                <td className="p-4 pl-6 font-medium text-foreground">
                  Analytics & Reports
                </td>

                <td className="p-4 text-center text-xs text-muted-foreground">
                  Basic Analytics
                </td>

                <td className="p-4 text-center text-xs text-primary font-medium">
                  Advanced Metrics
                </td>

                <td className="p-4 text-center text-xs text-emerald-500 font-semibold">
                  Real-time & Export Reports
                </td>

              </tr>

              <tr className="hover:bg-secondary/5 bg-secondary/[0.03]">

                <td className="p-4 pl-6 font-medium text-foreground">
                  Expiry / Plan Renewal Policy
                </td>

                <td className="p-4 text-center text-xs text-muted-foreground">
                  Lifetime Free
                </td>

                <td className="p-4 text-center text-xs text-muted-foreground">
                  Reverts to Starter after 3 mos. or renew at ₹999/yr
                </td>

                <td className="p-4 text-center text-xs text-muted-foreground">
                  Reverts to Starter or renew annually
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}