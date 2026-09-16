import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ArrowDownLeft, ExternalLink } from "lucide-react";
import { formatINR } from "@/lib/format";
import { useAuth } from "@/components/auth/AuthProvider";

export function PayoutProcessedModal() {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [payoutData, setPayoutData] = useState(null);

  useEffect(() => {
    // 1. Listen via window custom event (can be dispatched anywhere in client)
    const handleCustomEvent = (event) => {
      if (event.detail && event.detail.event === "payout.processed") {
        setPayoutData(event.detail);
        setIsOpen(true);
      }
    };

    window.addEventListener("payout.processed", handleCustomEvent);

    // 2. Listen via Server-Sent Events (SSE) stream if user is logged in
    let eventSource = null;
    const token = localStorage.getItem("token") || "";
    let backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (backendUrl.endsWith("/api")) {
      backendUrl = backendUrl.slice(0, -4);
    }

    // Establish SSE connection to wallet events if creator profile is loaded
    if (profile && profile.role === "creator") {
      try {
        const streamUrl = `${backendUrl}/api/wallet/events?token=${encodeURIComponent(token)}`;
        eventSource = new EventSource(streamUrl, { withCredentials: true });

        eventSource.addEventListener("payout.processed", (e) => {
          try {
            const data = JSON.parse(e.data);
            setPayoutData(data);
            setIsOpen(true);
          } catch (err) {
            console.error("Error parsing payout.processed event:", err);
          }
        });
      } catch (err) {
        console.warn("SSE connection not established:", err);
      }
    }

    return () => {
      window.removeEventListener("payout.processed", handleCustomEvent);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [profile, user]);

  if (!payoutData) return null;

  const { breakdown = {} } = payoutData;
  const hasReferralCommission =
    breakdown.referral_commission !== undefined &&
    breakdown.referral_commission !== null &&
    Number(breakdown.referral_commission) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-border bg-card shadow-2xl rounded-2xl p-6">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <ArrowDownLeft className="h-7 w-7" />
          </div>
          <DialogTitle className="text-xl font-bold font-display text-center tracking-tight">
            Payment Processed 💰
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-center">
            Your earnings have been finalized and credited to your wallet.
          </DialogDescription>
        </DialogHeader>

        {/* Ordered Breakdown Rows */}
        <div className="my-2 divide-y divide-border/60 rounded-xl border border-border/70 bg-muted/30 p-4 space-y-3">
          {/* Row 1: Gross project payment */}
          <div className="flex items-center justify-between text-sm pt-1">
            <span className="text-muted-foreground font-medium">
              Gross project payment
            </span>
            <span className="font-semibold text-foreground">
              {formatINR ? formatINR(breakdown.gross_amount) : `₹${Number(breakdown.gross_amount || 0).toLocaleString("en-IN")}`}
            </span>
          </div>

          {/* Row 2: Platform fee */}
          <div className="flex items-center justify-between text-sm pt-3">
            <span className="text-muted-foreground font-medium">
              Platform fee
            </span>
            <span className="font-medium text-muted-foreground">
              - {formatINR ? formatINR(breakdown.platform_fee) : `₹${Number(breakdown.platform_fee || 0).toLocaleString("en-IN")}`}
            </span>
          </div>

          {/* Row 3: Referral commission (ONLY if present/non-null) */}
          {hasReferralCommission && (
            <div className="pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  Referral commission (5%)
                </span>
                <span className="font-medium text-amber-500">
                  - {formatINR ? formatINR(breakdown.referral_commission) : `₹${Number(breakdown.referral_commission).toLocaleString("en-IN")}`}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground/80 mt-0.5">
                credited to <span className="font-medium text-foreground">{breakdown.referrer_name || "Referrer"}</span>
              </p>
            </div>
          )}

          {/* Row 4: Net amount added to your wallet (bold / emphasized) */}
          <div className="flex items-center justify-between pt-3 text-base">
            <span className="font-bold text-foreground">
              Net amount added to your wallet
            </span>
            <span className="text-lg font-extrabold text-emerald-500">
              {formatINR ? formatINR(breakdown.net_credited) : `₹${Number(breakdown.net_credited || 0).toLocaleString("en-IN")}`}
            </span>
          </div>
        </div>

        {/* Footer with CTA and Close */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Link
            to="/terms#refer-and-earn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline underline-offset-4"
          >
            View Terms
            <ExternalLink className="h-3 w-3" />
          </Link>

          <Button
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto rounded-xl px-6 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PayoutProcessedModal;
