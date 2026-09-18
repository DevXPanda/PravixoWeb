import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Mail, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleUnsubscribe = async () => {
    if (!email) {
      setError("No email address provided.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/profiles/unsubscribe", {
        email,
        token,
      });

      if (res.data?.success) {
        setUnsubscribed(true);
      } else {
        setError(res.data?.message || "Failed to unsubscribe. Please try again.");
      }
    } catch (err) {
      console.error("Unsubscribe error:", err);
      setError(err?.response?.data?.message || "Failed to unsubscribe. Please check your link or contact support.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-trigger if both email and token are present in URL
  useEffect(() => {
    if (email && token && !unsubscribed) {
      handleUnsubscribe();
    }
  }, [email, token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 shadow-card text-center relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        {loading ? (
          <div className="py-8 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h2 className="font-display text-xl font-bold">Processing request...</h2>
            <p className="text-xs text-muted-foreground">
              Updating your email notification preferences for <strong>{email}</strong>.
            </p>
          </div>
        ) : unsubscribed ? (
          <div className="space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Unsubscribed Successfully
              </h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                You will no longer receive new campaign email alerts for <strong className="text-foreground">{email}</strong>. You can re-enable notifications at any time from your Creator Dashboard.
              </p>
            </div>

            <div className="pt-3">
              <Link to="/dashboard">
                <Button className="w-full rounded-full gradient-sunset text-white border-0 shadow-glow font-bold text-xs">
                  Go to Dashboard <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <XCircle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Unsubscribe Failed
              </h2>
              <p className="text-xs text-destructive mt-2 leading-relaxed">
                {error}
              </p>
            </div>

            <div className="pt-2 flex gap-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
                onClick={handleUnsubscribe}
              >
                Try Again
              </Button>
              <Link to="/contact">
                <Button size="sm" className="rounded-full text-xs">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Mail className="h-8 w-8" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Email Notification Settings
              </h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Are you sure you want to stop receiving new brand campaign email alerts for <strong className="text-foreground">{email || "your account"}</strong>?
              </p>
            </div>

            <div className="pt-3 space-y-2">
              <Button
                onClick={handleUnsubscribe}
                disabled={loading}
                variant="destructive"
                className="w-full rounded-full text-xs font-bold"
              >
                Confirm Unsubscribe
              </Button>
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  className="w-full rounded-full text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel & Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
