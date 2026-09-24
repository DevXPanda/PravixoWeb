import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../components/auth/AuthProvider";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { toast } from "sonner";
import {
  Users,
  Sparkles,
  Copy,
  CheckCircle2,
  Share2,
  IndianRupee,
  TrendingUp,
  Search,
  Award,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";

export default function ReferralsPage() {
  const navigate = useNavigate();
  const { profile, user, loading: authLoading } = useAuth();

  const [timeframe, setTimeframe] = useState("6m");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Referral code state
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter & Search states for the comprehensive list
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL"); // 'ALL' | 'creator' | 'brand'
  const [statusFilter, setStatusFilter] = useState("ALL"); // 'ALL' | 'active' | 'pending'
  const [sortBy, setSortBy] = useState("commission"); // 'commission' | 'volume' | 'date' | 'name'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch Analytics & Referrals
  const fetchAnalytics = async (isManualRefresh = false) => {
    if (!profile?._id) return;
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get(`/referrals/analytics?timeframe=${timeframe}`);
      if (res.data?.success && res.data?.data) {
        setAnalyticsData(res.data.data);
      }
    } catch (err) {
      console.error("Fetch referral analytics error:", err);
      toast.error("Failed to load referral analytics data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login?redirect=/referrals");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile?._id) {
      fetchAnalytics();
    }
  }, [profile?._id, timeframe]);

  const referralCode = profile?.referral_code || profile?.referralCode || "PRV-REF";
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  // Filter & Sort All Referrals
  const filteredReferrals = useMemo(() => {
    const list = analyticsData?.allReferrals || [];
    return list.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        (item.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.handle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.email || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole =
        roleFilter === "ALL" || (item.role || "creator").toLowerCase() === roleFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "ALL" || (item.status || "active").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === "commission") {
        valA = Number(a.commissionEarned || 0);
        valB = Number(b.commissionEarned || 0);
      } else if (sortBy === "volume") {
        valA = Number(a.totalVolume || 0);
        valB = Number(b.totalVolume || 0);
      } else if (sortBy === "name") {
        return sortOrder === "asc"
          ? (a.fullName || "").localeCompare(b.fullName || "")
          : (b.fullName || "").localeCompare(a.fullName || "");
      } else if (sortBy === "date") {
        valA = new Date(a.createdAt || 0).getTime();
        valB = new Date(b.createdAt || 0).getTime();
      }
      return sortOrder === "desc" ? valB - valA : valA - valB;
    });
  }, [analyticsData?.allReferrals, searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredReferrals.length / itemsPerPage));
  const paginatedReferrals = filteredReferrals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Highest bar in chart for scaling
  const maxChartAmount = useMemo(() => {
    const data = analyticsData?.chartData || [];
    const maxVal = Math.max(...data.map((d) => d.amount || 0), 100);
    return maxVal;
  }, [analyticsData?.chartData]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP NAVIGATION / BREADCRUMB */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Link to={profile?.role === "brand" ? "/dashboard/customer" : "/dashboard/influencer"} className="hover:text-primary transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-foreground font-semibold">Refer & Earn Program</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              <span>Referral Management & Growth Hub</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold uppercase tracking-wider">
                5% - 10% Tiered
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              Track your network, real-time commission earnings, top performing referral partners, and historical timeline analytics.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="rounded-full h-9 px-3.5 text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
            </Button>
            <Link to={profile?.role === "brand" ? "/dashboard/customer" : "/dashboard/influencer"}>
              <Button size="sm" className="rounded-full gradient-sunset text-white text-xs font-bold h-9 px-4 shadow-sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* HERO SHARE CARD */}
        <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Zero Creator Deductions • 100% Platform Funded Payouts</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-foreground">
                Earn recurring commission from every <span className="text-gradient-sunset">creator & brand collaboration</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Invite fellow creators, agencies, and brand collaborators. When they register using your code and complete deals, you automatically receive 5% to 10% tiered recurring income credited straight to your wallet.
              </p>

              {/* TIER BADGES */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-2xl border border-border/80 bg-background/70 text-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">Starter Plan</span>
                  <span className="text-lg font-black text-foreground">5.0%</span>
                  <span className="text-[10px] text-muted-foreground block">Free Baseline</span>
                </div>
                <div className="p-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-center">
                  <span className="text-[10px] font-bold text-amber-500 uppercase block">Pro Plan</span>
                  <span className="text-lg font-black text-amber-500">7.5%</span>
                  <span className="text-[10px] text-muted-foreground block">Active Pro Sub</span>
                </div>
                <div className="p-3 rounded-2xl border border-purple-500/30 bg-purple-500/5 text-center">
                  <span className="text-[10px] font-bold text-purple-500 uppercase block">Elite Plan</span>
                  <span className="text-lg font-black text-purple-500">10.0%</span>
                  <span className="text-[10px] text-muted-foreground block">Active Elite Sub</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3.5 bg-secondary/30 p-5 rounded-2xl border border-border/80 backdrop-blur-sm">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Your Unique Referral Code
                </span>
                <div className="flex items-center justify-between gap-2 bg-card px-3.5 py-2.5 rounded-xl border border-border">
                  <span className="font-mono font-black text-base text-foreground tracking-wider">
                    {referralCode}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3 rounded-lg text-xs font-bold text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => {
                      navigator.clipboard.writeText(referralCode);
                      setCopiedCode(true);
                      toast.success("Referral code copied!");
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                  >
                    {copiedCode ? (
                      <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mr-1" /> Copied</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5 mr-1" /> Copy</>
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Direct Invitation Link
                </span>
                <div className="flex items-center justify-between gap-2 bg-card px-3.5 py-2 rounded-xl border border-border">
                  <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                    {referralLink}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2.5 rounded-lg text-xs font-bold text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => {
                        navigator.clipboard.writeText(referralLink);
                        setCopiedLink(true);
                        toast.success("Referral link copied!");
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                    >
                      {copiedLink ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 px-3 rounded-lg text-xs font-bold gradient-sunset text-white border-0 shadow-sm flex items-center gap-1"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: "Join Pravixo Network",
                            text: `Join Pravixo with my code ${referralCode} to connect with creators and brands:`,
                            url: referralLink,
                          }).catch(() => {});
                        } else {
                          const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Join Pravixo with my referral code ${referralCode}: ${referralLink}`)}`;
                          window.open(whatsappUrl, "_blank");
                        }
                      }}
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* METRICS SUMMARY GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Total Commission Earned</span>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-foreground font-display">
              ₹{Number(analyticsData?.total_earned || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Directly credited to wallet</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Referrals</span>
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-foreground font-display">
              {analyticsData?.active_referrals_count || 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {analyticsData?.creators_count || 0} Creators • {analyticsData?.brands_count || 0} Brands
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{timeframe.toUpperCase()} Earning Growth</span>
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-blue-600 font-display">
              ₹{Number(analyticsData?.timeframe_earned || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Earned during selected timeframe</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Performer Revenue</span>
              <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-amber-600 font-display">
              ₹{Number(analyticsData?.topPerformers?.[0]?.commissionEarned || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              Lead: {analyticsData?.topPerformers?.[0]?.fullName || "None yet"}
            </p>
          </div>
        </div>

        {/* TIMEFRAME INTERACTIVE GRAPH & TOP PERFORMERS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* EARNINGS GRAPH / TIMELINE */}
          <div className="lg:col-span-8 rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span>Referral Commission Trend</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Commission income history across selected timeline interval.
                  </p>
                </div>

                {/* TIMEFRAME SELECTOR */}
                <div className="flex items-center bg-secondary/60 p-1 rounded-xl border border-border/80 self-start sm:self-center">
                  {[
                    { id: "1m", label: "1 Month" },
                    { id: "3m", label: "3 Months" },
                    { id: "6m", label: "6 Months" },
                    { id: "1y", label: "1 Year" },
                    { id: "all", label: "All Time" },
                  ].map((tf) => (
                    <button
                      key={tf.id}
                      onClick={() => setTimeframe(tf.id)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                        timeframe === tf.id
                          ? "bg-card text-primary shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* VISUAL BAR CHART */}
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (!analyticsData?.chartData || analyticsData.chartData.length === 0) ? (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-xs">
                  <BarChart3 className="h-8 w-8 opacity-40 mb-2" />
                  <span>No commission data available for this timeframe</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-56 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-border/40">
                    {analyticsData.chartData.map((point, idx) => {
                      const heightPercent = maxChartAmount > 0
                        ? Math.max(8, Math.round(((point.amount || 0) / maxChartAmount) * 100))
                        : 8;

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                          {/* Tooltip on Hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold bg-foreground text-background px-2 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none mb-1">
                            ₹{Number(point.amount || 0).toLocaleString()} ({point.count} deals)
                          </div>
                          
                          {/* Bar */}
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full max-w-[42px] rounded-t-lg transition-all group-hover:opacity-90 ${
                              point.amount > 0
                                ? "gradient-sunset shadow-sm"
                                : "bg-secondary/40"
                            }`}
                          />

                          {/* X-axis Label */}
                          <span className="text-[10px] text-muted-foreground truncate w-full text-center mt-1">
                            {point.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground px-2">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full gradient-sunset inline-block" /> Commission Generated (INR)
                    </span>
                    <span>Max: ₹{maxChartAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span>Commission automatically deposits to your wallet on completed escrow release.</span>
              <Link to="/messages" className="text-primary hover:underline font-semibold flex items-center gap-1">
                Collaborations <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* TOP PERFORMERS LEADERBOARD */}
          <div className="lg:col-span-4 rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground flex items-center gap-1.5">
                    <Award className="h-4.5 w-4.5 text-amber-500" />
                    <span>Top Performing Referrals</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Highest revenue creators & brands</p>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-bold border-amber-500/30 text-amber-500 bg-amber-500/10">
                  Leaderboard
                </Badge>
              </div>

              {(!analyticsData?.topPerformers || analyticsData.topPerformers.length === 0) ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  <Users className="h-8 w-8 mx-auto opacity-40 mb-2" />
                  <p>No active referral earnings yet</p>
                </div>
              ) : (
                <div className="space-y-3 mt-3">
                  {analyticsData.topPerformers.slice(0, 5).map((performer, idx) => (
                    <div
                      key={performer._id || idx}
                      className="p-3 rounded-2xl border border-border/70 bg-secondary/15 flex items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`h-7 w-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          idx === 0 ? "bg-amber-500 text-white shadow-xs" : idx === 1 ? "bg-slate-300 text-slate-800" : idx === 2 ? "bg-amber-700 text-white" : "bg-secondary text-foreground"
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{performer.fullName || "User"}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{performer.role === "brand" ? "Brand" : "Creator"} • {performer.handle || performer.email}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-emerald-600 block">
                          +₹{Number(performer.commissionEarned || 0).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[9px] text-muted-foreground block">
                          Vol: ₹{Number(performer.totalVolume || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Higher tiered plans unlock up to 10% commission.</span>
            </div>
          </div>

        </div>

        {/* ALL REFERRED USERS DIRECTORY & ADVANCED FILTERS */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Referred Partners Directory ({filteredReferrals.length})</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Search, filter, and inspect detailed collaboration statistics for all users registered under your referral code.
              </p>
            </div>

            {/* FILTER CONTROLS */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, handle, email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 text-xs h-9 rounded-full bg-background border-border"
                />
              </div>

              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 rounded-full border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-hidden"
              >
                <option value="ALL">All Roles</option>
                <option value="creator">Creators Only</option>
                <option value="brand">Brands Only</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 rounded-full border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-hidden"
              >
                <option value="commission">Sort by Commission</option>
                <option value="volume">Sort by Project Volume</option>
                <option value="date">Sort by Joined Date</option>
                <option value="name">Sort by Name</option>
              </select>

              {/* Sort Order Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
                className="h-9 px-3 rounded-full text-xs font-semibold flex items-center gap-1 border-border"
                title={`Order: ${sortOrder === "desc" ? "High to Low" : "Low to High"}`}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>{sortOrder === "desc" ? "Desc" : "Asc"}</span>
              </Button>
            </div>
          </div>

          {/* TABLE OF REFERRED USERS */}
          {paginatedReferrals.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-secondary/5">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
              <p className="font-semibold text-sm text-foreground">No referred partners found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {searchTerm || roleFilter !== "ALL"
                  ? "Try resetting your search filters to find matching partners."
                  : "Share your referral link with creators and brands to start building your referral earnings network."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-semibold">
                    <th className="pb-3 pl-2">Partner / User</th>
                    <th className="pb-3 px-3">Account Type</th>
                    <th className="pb-3 px-3">Joined Date</th>
                    <th className="pb-3 px-3">Total Completed Deals</th>
                    <th className="pb-3 px-3">Total Deal Volume</th>
                    <th className="pb-3 px-3">Your Commission (5-10%)</th>
                    <th className="pb-3 pr-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {paginatedReferrals.map((userItem) => (
                    <tr key={userItem._id} className="hover:bg-secondary/10 transition-colors">
                      <td className="py-3.5 pl-2 font-medium">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              userItem.avatarUrl ||
                              `https://api.dicebear.com/9.x/avataaars/svg?seed=${userItem.fullName || "User"}`
                            }
                            alt=""
                            className="h-8 w-8 rounded-full object-cover border border-border shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=User";
                            }}
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-foreground block truncate">{userItem.fullName || "User"}</span>
                            <span className="text-[10px] text-muted-foreground block truncate">{userItem.handle || userItem.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <Badge
                          variant="outline"
                          className={`rounded-full text-[9px] uppercase font-bold border-0 px-2 py-0.5 ${
                            userItem.role === "brand"
                              ? "bg-indigo-500/10 text-indigo-500"
                              : "bg-purple-500/10 text-purple-600"
                          }`}
                        >
                          {userItem.role === "brand" ? "Brand" : "Creator"}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-3 text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                        {userItem.createdAt
                          ? new Date(userItem.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-foreground">
                        {userItem.projectCount || 0} Project{(userItem.projectCount || 0) === 1 ? "" : "s"}
                      </td>

                      <td className="py-3.5 px-3 text-muted-foreground font-mono">
                        ₹{Number(userItem.totalVolume || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-3 font-bold text-emerald-600 text-sm font-mono">
                        +₹{Number(userItem.commissionEarned || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 pr-2 text-right">
                        <Badge className="rounded-full text-[9px] font-bold px-2 py-0.5 border bg-emerald-500/15 text-emerald-700 border-emerald-500/30">
                          ✓ Active
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/40 text-xs text-muted-foreground">
              <span>
                Showing Page <strong className="text-foreground">{currentPage}</strong> of <strong className="text-foreground">{totalPages}</strong>
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-full h-8 px-3 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-full h-8 px-3 text-xs"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
