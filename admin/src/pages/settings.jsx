import { useEffect, useState } from "react";
import {
  Moon,
  Sun,
  Monitor,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

import api from "@/lib/axios";
import { toast } from "sonner";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  
  const [email, setEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Settings — Pravixo Admin";
    const fetchAdminInfo = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data?.user?.email) {
          setCurrentEmail(res.data.user.email);
          setEmail(res.data.user.email);
        }
      } catch (err) {
        console.error("Failed to load admin profile:", err);
      }
    };
    fetchAdminInfo();
  }, []);

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const hasEmailChange = trimmedEmail && trimmedEmail !== currentEmail;
    const hasPasswordChange = Boolean(password.trim());

    if (!hasEmailChange && !hasPasswordChange) {
      toast.error("Please enter a new email or password to update.");
      return;
    }

    if (hasPasswordChange && password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {};
      if (hasEmailChange) {
        payload.email = trimmedEmail;
      }
      if (hasPasswordChange) {
        payload.password = password;
      }

      const res = await api.put("/admin/credentials", payload);
      if (res.data.success) {
        if (res.data.token) {
          localStorage.setItem("adminToken", res.data.token);
        }
        if (res.data.user?.email) {
          setCurrentEmail(res.data.user.email);
          setEmail(res.data.user.email);
        }
        setPassword("");
        toast.success(res.data.message || "Credentials updated successfully.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin panel configuration and preferences
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Theme Card */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-sunset shadow-glow">
              <Monitor className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Appearance</h2>
              <p className="text-xs text-muted-foreground">
                Choose your preferred theme
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all ${
                theme === "light"
                  ? "border-primary shadow-glow"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  theme === "light"
                    ? "gradient-warm text-white"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                <Sun className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all ${
                theme === "dark"
                  ? "border-primary shadow-glow"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  theme === "dark"
                    ? "gradient-pink text-white"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                <Moon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">Dark</span>
            </button>
          </div>
        </div>

        {/* Admin Credentials Card */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-pink shadow-pink">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Admin Credentials</h2>
              <p className="text-xs text-muted-foreground">
                Update your login email and password
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateCredentials} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Email Address</label>
                {currentEmail && (
                  <span className="text-xs text-muted-foreground">
                    Current: {currentEmail}
                  </span>
                )}
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pravixo.com"
                className="w-full rounded-xl border border-input bg-transparent px-4 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep unchanged"
                  className="w-full rounded-xl border border-input bg-transparent px-4 py-2 pr-10 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Minimum 6 characters. Leave blank if you only want to change your email.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl gradient-sunset py-2.5 text-sm font-semibold text-white shadow-glow hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
            >
              {isSubmitting ? "Updating..." : "Update Credentials"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
