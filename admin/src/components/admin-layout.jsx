import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Moon,
  Sun,
  Sparkles,
  Menu,
  X,
  Shield,
  ClipboardCheck,
  CreditCard,
  FileText,
  VideoIcon,
  Lightbulb,
  Megaphone,
  Tag,
  CalendarCheck,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";
import { Toaster } from "./ui/sonner";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ThemeProvider } from "./theme-provider";
import { AdminGuard } from "./admin-guard";
import { Separator } from "./ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";


const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/users", label: "Users", icon: Users },
  { to: "/conversations", label: "Conversations", icon: MessageSquare },
  { to: "/tasks", label: "Tasks", icon: ClipboardCheck },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/subscriptions", label: "Subscriptions", icon: Sparkles },
  { to: "/client-reviews", label: "Client Reviews", icon: VideoIcon },
  { to: "/blogs", label: "Blogs", icon: FileText },
  { to: "/protips", label: "ProTips", icon: Lightbulb },
  { to: "/notifications", label: "Notifications", icon: Megaphone },
  { to: "/offers", label: "Creator Offers", icon: Tag },
  { to: "/settings", label: "Settings", icon: Settings },
];

function getEventIcon(type) {
  switch (type) {
    case "signup": return UserPlus;
    case "collaboration": return Handshake;
    case "payment": return CreditCard;
    case "subscription_upgrade_requested": return Sparkles;
    case "deleted": return UserX;
    case "suspended": return UserMinus;
    default: return CheckCircle;
  }
}

function getEventColor(type) {
  switch (type) {
    case "signup": return "text-emerald-500 bg-emerald-500/10";
    case "collaboration": return "text-violet-500 bg-violet-500/10";
    case "payment": return "text-amber-500 bg-amber-500/10";
    case "subscription_upgrade_requested": return "text-pink-500 bg-pink-500/10";
    case "deleted": return "text-red-500 bg-red-500/10";
    case "suspended": return "text-orange-500 bg-orange-500/10";
    default: return "text-primary bg-primary/10";
  }
}

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const lastSeenRef = useRef(localStorage.getItem("admin_notif_seen") || "0");

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/activity?limit=40");
      if (res.data.success) {
        const data = res.data.data || [];
        setEvents(data);
        const lastSeen = parseInt(lastSeenRef.current) || 0;
        const newCount = data.filter((e) => e.timestamp > lastSeen).length;
        setUnread(newCount);
      }
    } catch (err) {
      // silently fail — bell is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleOpen = () => {
    setOpen((o) => !o);
    if (!open) {
      const now = Date.now().toString();
      localStorage.setItem("admin_notif_seen", now);
      lastSeenRef.current = now;
      setUnread(0);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleOpen}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Notifications</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {open && (
        <div className="absolute left-full top-0 ml-3 z-50 w-80 rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Activity Feed</span>
              {unread > 0 && (
                <span className="flex h-4 px-1.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchActivity} className="text-xs text-primary hover:underline">
                Refresh
              </button>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[440px]">
            {loading && events.length === 0 ? (
              <div className="flex flex-col gap-3 p-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-secondary animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-32 rounded bg-secondary animate-pulse" />
                      <div className="h-2.5 w-48 rounded bg-secondary animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Events will appear here as users interact on the platform
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {events.map((event) => {
                  const Icon = getEventIcon(event.type);
                  const colorClass = getEventColor(event.type);
                  const isNew = event.timestamp > (parseInt(lastSeenRef.current) || 0);
                  return (
                    <div
                      key={event.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary/40 ${
                        isNew ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${colorClass}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {event.title}
                          </p>
                          {isNew && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {event.body}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {timeAgo(event.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {events.length > 0 && (
            <div className="border-t border-border px-4 py-2 text-center">
              <p className="text-[10px] text-muted-foreground">
                {events.length} events · Auto-refreshes every 30s
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SidebarContent({ onItemClick }) {
  const [verificationOpen, setVerificationOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const handleSignOut = () => {
    localStorage.removeItem("admin_authed");
    sessionStorage.removeItem("admin_authed");
    if (onItemClick) onItemClick();
    navigate("/");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-sunset shadow-glow">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-display text-lg font-bold tracking-tight">Pravixo</span>
          <div className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              Admin
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navLinks.map((link) => {
          const active =
            pathname === link.to ||
            (link.to !== "/dashboard" && pathname.startsWith(link.to));
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => onItemClick && onItemClick()}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "gradient-sunset text-white shadow-glow"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}

        {/* Verification Requests accordion */}
        <div className="space-y-1">
          <button
            onClick={() => setVerificationOpen(!verificationOpen)}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              pathname.startsWith("/verification-requests")
                ? "gradient-sunset text-white shadow-glow"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4" />
              <span>Verification Requests</span>
            </div>
            {verificationOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {verificationOpen && (
            <div className="ml-8 space-y-1">
              <Link
                to="/verification-requests/creators"
                onClick={() => onItemClick && onItemClick()}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  pathname === "/verification-requests/creators"
                    ? "gradient-sunset text-white shadow-glow"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                Creator Requests
              </Link>
              <Link
                to="/verification-requests/brands"
                onClick={() => onItemClick && onItemClick()}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  pathname === "/verification-requests/brands"
                    ? "gradient-sunset text-white shadow-glow"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                Brand Requests
              </Link>
            </div>
          )}
        </div>
      </nav>

      <Separator />

      {/* Bottom actions */}
      <div className="space-y-1 px-3 py-4">
        {/* Notification Bell row */}
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <span className="text-sm font-medium text-muted-foreground text-xs">Notifications on Dashboard ↗</span>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggle}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Toggle theme</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

function AdminShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-border bg-card transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <SidebarContent onItemClick={() => setMobileOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-sunset shadow-glow">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-display text-sm font-bold">Pravixo Admin</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminLayout() {
  return (
    <ThemeProvider>
      <AdminGuard>
        <AdminShell />
      </AdminGuard>
      <Toaster />
    </ThemeProvider>
  );
}
