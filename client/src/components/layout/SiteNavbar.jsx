import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { toast } from "sonner";
import api from "@/lib/api";
import logoImg from "@/assets/log.png";
import { NotificationBell } from "./NotificationBell";


import { getGenderAvatar } from "@/utils/avatar";

const baseLinks = [
  { to: "/", label: "Home" },
  { to: "/browse", label: "Browse" },
  { to: "/blog", label: "Blog" },
  { to: "/tips", label: "Pro Tips" },
  { to: "/reviews", label: "Reviews" },
  { to: "/addons", label: "Add-ons" },
];

export function SiteNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();

  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 80) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY.current + 8) {
        setIsNavVisible(false);
        setOpen(false);
      } else if (currentScrollY < lastScrollY.current - 8) {
        setIsNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (apiUrl.endsWith("/api")) apiUrl = apiUrl.slice(0, -4);
    return `${apiUrl}${url}`;
  };

  useEffect(() => {
    if (!profile?._id) return;

    const fetchCounts = async () => {
      try {
        const [convRes, notifCountRes] = await Promise.all([
          api.get("/conversations", {
            params: { profileId: profile._id, role: profile.role },
          }).catch(() => ({ data: [] })),
          api.get("/connections/notifications/count", {
            params: { profileId: profile._id, role: profile.role },
          }).catch(() => ({ data: { data: 0 } })),
        ]);

        const convs = convRes.data?.data || convRes.data || [];
        const totalUnread = Array.isArray(convs)
          ? convs.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
          : 0;
        setUnreadCount(totalUnread);

        const pendingCount = Number(notifCountRes.data?.data ?? notifCountRes.data ?? 0);
        setConnectionCount(pendingCount);
      } catch (err) {
        // silent fail
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 6000);
    return () => clearInterval(interval);
  }, [profile]);

  const links = [
    ...baseLinks,
    ...(user && profile?.role === "creator"
      ? [{ to: "/dashboard/influencer", label: "Creator" }]
      : []),
    ...(user && profile?.role === "brand"
      ? [{ to: "/dashboard/customer", label: "Brand" }]
      : []),
  ];

  const handleSignOut = () => {
    setShowLogoutModal(true);
  };

  const confirmSignOut = () => {
    signOut();
    setShowLogoutModal(false);
    toast.success("Signed out successfully");
    navigate("/");
    setOpen(false);
  };

  const initial =
    profile?.fullName?.trim()?.[0]?.toUpperCase() ||
    profile?.name?.trim()?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-transform duration-300 ease-in-out ${
          isNavVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logoImg}
              alt="Pravixo"
              className="h-8 w-auto object-contain dark:bg-white/90 dark:p-0.5 dark:rounded-md"
            />
            <span className="font-display text-lg font-bold tracking-tight text-foreground dark:text-white">
              Pravixo
            </span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-secondary"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* Authenticated Icons */}
            {user && (
              <>
                <NotificationBell profileId={profile?._id} />
                <Link
                  to="/connections"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-secondary"
                  aria-label="Connections"
                >
                  <UserPlus className="h-4 w-4" />
                  {connectionCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {connectionCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/messages"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-secondary"
                  aria-label="Messages"
                >
                  <MessageSquare className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* Auth Buttons / Profile Pill */}
            {loading ? (
              <div className="h-9 w-24 rounded-full bg-secondary animate-pulse" />
            ) : user ? (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to={
                    profile?.role === "creator"
                      ? "/dashboard/influencer"
                      : "/dashboard/customer"
                  }
                  className="flex h-9 items-center gap-2 rounded-full border border-border bg-card pl-1 pr-3 transition-colors hover:bg-secondary"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        resolveImageUrl(profile?.avatarUrl) ||
                        getGenderAvatar(profile?.fullName || profile?.name || user?.email, profile?.gender, profile?.role)
                      }
                      alt=""
                      className="h-7 w-7 rounded-full object-cover border border-border/50"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getGenderAvatar(profile?.fullName || profile?.name || user?.email, profile?.gender, profile?.role);
                      }}
                    />
                  </div>
                  <span className="max-w-[120px] truncate text-sm font-medium">
                    {profile?.fullName || profile?.name || user.email}
                  </span>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={handleSignOut}
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register" className="hidden sm:block">
                  <Button
                    size="sm"
                    className="rounded-full gradient-sunset border-0 text-white shadow-glow hover:opacity-95"
                  >
                    Get started
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile menu trigger */}
            <button
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-border"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {open && (
          <div className="border-t border-border md:hidden bg-background">
            <div className="mx-auto max-w-7xl space-y-1 px-4 py-3">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                >
                  {l.label}
                </Link>
              ))}
              {user ? (
                <div className="pt-2">
                  <div className="px-3 pb-2 text-xs text-muted-foreground">
                    Signed in as {profile?.fullName || profile?.name || user.email}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-full"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link
                    to="/login"
                    className="flex-1"
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-full"
                    >
                      Sign in
                    </Button>
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1"
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      size="sm"
                      className="w-full rounded-full gradient-sunset border-0 text-white"
                    >
                      Get started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close logout confirmation"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-elevated animate-in fade-in zoom-in duration-200">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-sunset text-white shadow-glow">
              <LogOut className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Are you sure you want to logout?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You can sign in again anytime.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="min-w-24 rounded-full border-primary/30 bg-white/10 text-foreground hover:bg-accent/40"
                onClick={() => setShowLogoutModal(false)}
              >
                No
              </Button>
              <Button
                type="button"
                className="min-w-24 rounded-full gradient-sunset border-0 text-white shadow-glow hover:opacity-95"
                onClick={confirmSignOut}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}