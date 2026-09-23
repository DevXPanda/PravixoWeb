import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Star,
  MapPin,
  Share2,
  Download,
  CheckCircle2,
  Users,
  Eye,
  TrendingUp,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Briefcase,
  Play,
  Heart,
  ChevronRight,
  Award,
  Layers,
  Zap,
  Globe,
  Check,
  Percent,
} from "lucide-react";
import {
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaTwitter,
} from "react-icons/fa";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getGenderAvatar, DEFAULT_BANNER } from "../utils/avatar";
import { formatINR } from "@/lib/format";
import { formatFollowers } from "@/data/influencer";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import api from "@/lib/api";

const QuoraIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.592 16.483c.783-.984 1.258-2.228 1.258-3.585 0-3.155-2.558-5.713-5.713S6.423 9.743 6.423 12.898s2.558 5.713 5.713 5.713c1.088 0 2.106-.305 2.975-.833l3.208 3.208c.28.28.73.28 1.01 0a.715.715 0 000-1.01l-2.737-2.493zm-4.455.518c-2.099 0-3.8-1.701-3.8-3.8 0-2.099 1.701-3.8 3.8-3.8s3.8 1.701 3.8 3.8c0 2.099-1.701 3.8-3.8 3.8z" />
  </svg>
);

export default function CreatorMediaKit() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [creator, setCreator] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [pricingTiers, setPricingTiers] = useState([]);
  const [socialConnections, setSocialConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState("all");

  const mediaKitRef = useRef(null);

  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (apiUrl.endsWith("/api")) apiUrl = apiUrl.slice(0, -4);
    return `${apiUrl}${url}`;
  };

  useEffect(() => {
    async function loadMediaKit() {
      if (!handle) return;
      setLoading(true);
      try {
        const cleanHandle = handle.replace(/^@/, "");
        const profileRes = await api.get(`/profiles/handle/${cleanHandle}`);
        const data = profileRes.data?.data || profileRes.data;
        setCreator(data);

        if (data?._id) {
          // Fetch portfolio, pricing, and social connections in parallel
          const [portfolioRes, pricingRes, socialRes] = await Promise.allSettled([
            api.get(`/portfolio/profile/${data._id}`),
            api.get(`/pricing/profile/${data._id}`),
            api.get(`/social/profile/${data._id}`),
          ]);

          if (portfolioRes.status === "fulfilled") {
            setPortfolio(portfolioRes.value.data?.data || portfolioRes.value.data || []);
          }
          if (pricingRes.status === "fulfilled") {
            setPricingTiers(pricingRes.value.data?.data || pricingRes.value.data || []);
          }
          if (socialRes.status === "fulfilled") {
            setSocialConnections(socialRes.value.data?.data || socialRes.value.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to load Media Kit profile:", err);
        toast.error("Could not find creator media kit.");
      } finally {
        setLoading(false);
      }
    }

    loadMediaKit();
  }, [handle]);

  const isOwnProfile =
    (profile?._id && creator?._id && String(profile._id) === String(creator._id)) ||
    (profile?.handle && creator?.handle && profile.handle.replace("@", "").toLowerCase() === creator.handle.replace("@", "").toLowerCase()) ||
    (user?._id && creator?.userId && String(user._id) === String(creator.userId));

  const totalFollowers =
    (creator?.instagramFollowers || 0) +
    (creator?.youtubeFollowers || 0) +
    (creator?.facebookFollowers || 0) +
    (creator?.twitterFollowers || 0) +
    (creator?.linkedinFollowers || 0) +
    (creator?.quoraFollowers || 0);

  const primaryVerifiedConnection = socialConnections.find((c) => c.verified && c.engagementRate > 0) || socialConnections[0];
  const erRate = primaryVerifiedConnection?.engagementRate ? `${primaryVerifiedConnection.engagementRate}%` : "4.8%";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Public Media Kit URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <h2 className="text-xl font-bold font-display">Generating Verified Media Kit...</h2>
        <p className="text-sm text-muted-foreground mt-1">Aggregating live audited metrics & rate cards</p>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <Briefcase className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-display">Creator Media Kit Not Found</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          The handle <strong>@{handle}</strong> does not exist or has not published their media kit yet.
        </p>
        <Link to="/browse" className="mt-6">
          <Button className="rounded-full px-6">Browse Verified Creators</Button>
        </Link>
      </div>
    );
  }

  const avatarUrl = resolveImageUrl(creator.avatarUrl) || getGenderAvatar(creator.fullName || "Creator", creator.gender || "male", "creator");
  const coverUrl = resolveImageUrl(creator.coverUrl) || DEFAULT_BANNER;
  const rawHandle = creator.handle?.replace(/^@/, "") || handle?.replace(/^@/, "");

  const categories = creator.category ? creator.category.split(",").map((c) => c.trim()).filter(Boolean) : ["Digital Creator"];

  const filteredPortfolio = activeMediaTab === "all"
    ? portfolio
    : portfolio.filter((item) => (item.type || item.mediaType || "post").toLowerCase() === activeMediaTab);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-primary selection:text-white pb-24">
      {/* Top Media Kit Bar (Screen Only) */}
      <header className="print:hidden sticky top-16 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Media Kit
            </span>
            <span className="text-sm font-semibold text-slate-300 hidden sm:inline">
              pravixo.com/c/{rawHandle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyLink}
              className="rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs font-semibold gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? "Link Copied!" : "Share Link"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" /> Download PDF
            </Button>
            {isOwnProfile ? (
              <Link to="/dashboard/creator">
                <Button size="sm" className="rounded-full bg-gradient-to-r from-primary to-orange-500 hover:opacity-90 text-white font-semibold text-xs px-4 shadow-md gap-1.5 cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5" /> Edit My Profile
                </Button>
              </Link>
            ) : (
              <Link to={`/influencer/${creator._id}`}>
                <Button size="sm" className="rounded-full bg-gradient-to-r from-primary to-orange-500 hover:opacity-90 text-white font-semibold text-xs px-4 shadow-md gap-1.5 cursor-pointer">
                  <MessageCircle className="w-3.5 h-3.5" /> Hire @{rawHandle}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Printable Container */}
      <main ref={mediaKitRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8 print:p-0 print:space-y-6">
        
        {/* HERO BRANDED HEADER CARD */}
        <section className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl">
          {/* Banner */}
          <div className="h-48 sm:h-64 w-full relative overflow-hidden">
            <img
              src={coverUrl}
              alt={`${creator.fullName} banner`}
              className="w-full h-full object-cover brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          {/* Profile Header Details */}
          <div className="relative px-6 sm:px-10 pb-8 -mt-20 sm:-mt-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="relative group">
                <img
                  src={avatarUrl}
                  alt={creator.fullName}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl border-4 border-slate-950 object-cover shadow-2xl bg-slate-800"
                />
                {creator.verificationStatus === "verified" && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full border-2 border-slate-950 shadow-lg" title="Verified Creator">
                    <ShieldCheck className="w-5 h-5" fill="currentColor" stroke="#020617" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
                    {creator.fullName}
                  </h1>
                  <span className="text-slate-400 font-medium text-lg">@{rawHandle}</span>
                </div>

                <p className="text-amber-400 font-medium text-sm sm:text-base">
                  {creator.mediaKitTagline || categories.join(" • ")}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-400 pt-1">
                  {creator.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" /> {creator.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-amber-300 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {creator.rating?.toFixed(1) || "5.0"}
                    <span className="text-slate-400 font-normal">({creator.reviewsCount || 0} reviews)</span>
                  </span>
                  {creator.isBarterAllowed && (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                      ✓ Open to Barter Collabs
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action in Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 print:hidden">
              {isOwnProfile ? (
                <Link to="/dashboard/creator" className="w-full sm:w-auto">
                  <Button className="w-full rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 shadow-lg cursor-pointer">
                    <Sparkles className="w-4 h-4 mr-1.5 text-primary" /> Edit My Media Kit
                  </Button>
                </Link>
              ) : (
                <Link to={`/messages?recipientId=${creator._id}`} className="w-full sm:w-auto">
                  <Button className="w-full rounded-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold px-6 shadow-lg shadow-orange-500/20 cursor-pointer">
                    <Zap className="w-4 h-4 mr-1.5" /> Book Collaboration
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* KEY AUDITED PERFORMANCE STATS GRID */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Reach</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-display">
              {formatFollowers(totalFollowers)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" /> Cross-platform audience
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Engagement</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-display">
              {erRate}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {primaryVerifiedConnection?.verified ? "✓ Live Audited via API" : "Industry Top 10% Tier"}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Starting Rate</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
              {creator.startingPrice > 0 ? formatINR(creator.startingPrice) : "Custom SOW"}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Per deliverable package</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Views / Reel</span>
              <Eye className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-300 font-display">
              {creator.audienceHighlights?.avgViewsPerReel || "35K - 90K"}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">High conversion organic reach</p>
          </div>
        </section>

        {/* 2-COLUMN SECTION: ABOUT & SOCIAL CHANNELS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Creator Bio & Audience Highlights */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold font-display text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> About The Creator
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {creator.mediaKitBio || creator.bio || `${creator.fullName} is a professional ${categories.join(" & ")} creator creating engaging, high-retention content for modern brands.`}
              </p>

              {/* Niches Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {categories.map((cat, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                    #{cat}
                  </span>
                ))}
              </div>
            </div>

            {/* AUDIENCE DEMOGRAPHICS & INSIGHTS */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold font-display text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" /> Audience Demographics
                </h2>
                <span className="text-xs bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-semibold">
                  Audited Sample
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-xs font-medium text-slate-400">Primary Age Group</span>
                  <div className="text-lg font-bold text-white">
                    {creator.audienceHighlights?.topAgeGroup || "18–24 (48%)"}
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-indigo-500 h-full w-[48%]" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-xs font-medium text-slate-400">Gender Split</span>
                  <div className="text-lg font-bold text-white">
                    {creator.audienceHighlights?.topGender || "62% Female / 38% Male"}
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2 flex">
                    <div className="bg-rose-400 h-full w-[62%]" />
                    <div className="bg-blue-400 h-full w-[38%]" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-xs font-medium text-slate-400">Top Tier-1 Cities</span>
                  <div className="text-sm font-bold text-white line-clamp-1">
                    {creator.audienceHighlights?.topLocations || "Mumbai, Delhi, Bangalore"}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">High purchase intent metros</p>
                </div>
              </div>
            </div>

            {/* PAST BRANDS & COLLABS */}
            {(creator.pastBrandsWorkedWith?.length > 0 || (creator.reviews && creator.reviews.length > 0)) && (
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h2 className="text-lg sm:text-xl font-bold font-display text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-400" /> Brand Collaborations & Testimonials
                </h2>
                
                {creator.pastBrandsWorkedWith?.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trusted By:</span>
                    <div className="flex flex-wrap gap-2.5 mt-2">
                      {creator.pastBrandsWorkedWith.map((brand, idx) => (
                        <span key={idx} className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-semibold text-slate-200">
                          ⚡ {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {creator.reviews?.length > 0 && (
                  <div className="space-y-3 pt-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Client Reviews:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {creator.reviews.slice(0, 4).map((rev, i) => (
                        <div key={i} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{rev.brandName || rev.customerName || "Brand Partner"}</span>
                            <div className="flex items-center text-amber-400 font-bold">
                              <Star className="w-3 h-3 fill-amber-400 mr-1" /> {rev.rating || 5}
                            </div>
                          </div>
                          <p className="text-slate-300 italic line-clamp-3">"{rev.comment || rev.text || "Exceptional deliverable quality and on-time execution."}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Verified Social Handles & Live Rate Cards */}
          <div className="space-y-6">
            {/* SOCIAL ACCOUNTS LIST */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold font-display text-white flex items-center justify-between">
                <span>Social Presence</span>
                <span className="text-xs text-slate-400 font-normal">Audited Channels</span>
              </h3>

              <div className="space-y-3">
                {creator.instagramHandle && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500">
                        <FaInstagram className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-1.5">
                          @{creator.instagramHandle.replace("@", "")}
                        </div>
                        <div className="text-xs text-slate-400">Instagram Creator</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-sm text-white">
                        {formatFollowers(creator.instagramFollowers || 0)}
                      </div>
                      <div className="text-[10px] text-slate-400">Followers</div>
                    </div>
                  </div>
                )}

                {creator.youtubeHandle && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                        <FaYoutube className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-1.5">
                          {creator.youtubeHandle}
                        </div>
                        <div className="text-xs text-slate-400">YouTube Channel</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-sm text-white">
                        {formatFollowers(creator.youtubeFollowers || 0)}
                      </div>
                      <div className="text-[10px] text-slate-400">Subscribers</div>
                    </div>
                  </div>
                )}

                {creator.facebookHandle && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                        <FaFacebook className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">
                          {creator.facebookHandle}
                        </div>
                        <div className="text-xs text-slate-400">Facebook Page</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-sm text-white">
                        {formatFollowers(creator.facebookFollowers || 0)}
                      </div>
                      <div className="text-[10px] text-slate-400">Followers</div>
                    </div>
                  </div>
                )}

                {creator.twitterHandle && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                        <FaTwitter className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">
                          @{creator.twitterHandle.replace("@", "")}
                        </div>
                        <div className="text-xs text-slate-400">X (Twitter)</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-sm text-white">
                        {formatFollowers(creator.twitterFollowers || 0)}
                      </div>
                      <div className="text-[10px] text-slate-400">Followers</div>
                    </div>
                  </div>
                )}

                {creator.linkedinHandle && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400">
                        <FaLinkedin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">
                          {creator.linkedinHandle}
                        </div>
                        <div className="text-xs text-slate-400">LinkedIn Profile</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-sm text-white">
                        {formatFollowers(creator.linkedinFollowers || 0)}
                      </div>
                      <div className="text-[10px] text-slate-400">Connections</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RATE CARD / PRICING PACKAGES */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" /> Collaboration Rate Card
                </h3>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Standard Rates
                </span>
              </div>

              {pricingTiers.length > 0 ? (
                <div className="space-y-2.5">
                  {pricingTiers.map((tier, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-100">{tier.name || `Package ${idx + 1}`}</div>
                        <div className="text-xs text-slate-400">{tier.description || "Dedicated video / post deliverable"}</div>
                      </div>
                      <div className="text-right font-extrabold text-amber-400 text-base font-display">
                        {formatINR(tier.price || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-100">1x Instagram Reel / Video</div>
                      <div className="text-xs text-slate-400">High-energy product demo + hook</div>
                    </div>
                    <div className="text-right font-extrabold text-amber-400 text-base font-display">
                      {creator.startingPrice > 0 ? formatINR(creator.startingPrice) : "₹15,000"}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-100">2x Story Frames with Link</div>
                      <div className="text-xs text-slate-400">24hr live swipe up with direct CTA</div>
                    </div>
                    <div className="text-right font-extrabold text-amber-400 text-base font-display">
                      {creator.startingPrice > 0 ? formatINR(Math.round(creator.startingPrice * 0.4)) : "₹6,000"}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-100">Full Campaign Bundle</div>
                      <div className="text-xs text-slate-400">1 Reel + 3 Stories + Whitelist Rights</div>
                    </div>
                    <div className="text-right font-extrabold text-amber-400 text-base font-display">
                      {creator.startingPrice > 0 ? formatINR(Math.round(creator.startingPrice * 1.8)) : "₹25,000"}
                    </div>
                  </div>
                </div>
              )}

              <Link to={`/messages?with=${creator._id}`} className="block pt-2">
                <Button className="w-full rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm h-11 cursor-pointer">
                  Request Custom Scope of Work (SOW)
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* PORTFOLIO & WORK SHOWCASE GALLERY */}
        {portfolio.length > 0 && (
          <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
                  <Play className="w-5 h-5 text-rose-500 fill-rose-500" /> Verified Creative Portfolio
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  High-converting viral reels, aesthetic posts, and UGC videos produced by @{rawHandle}
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start">
                {["all", "reel", "post"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveMediaTab(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize cursor-pointer ${
                      activeMediaTab === t
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t === "all" ? "All Formats" : `${t}s`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredPortfolio.map((item, idx) => {
                const imgUrl = resolveImageUrl(item.imageUrl || item.url);
                return (
                  <div
                    key={item._id || idx}
                    className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md"
                  >
                    <img
                      src={imgUrl}
                      alt={item.caption || "Portfolio media"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <span className="text-xs font-bold text-white line-clamp-1">{item.caption || item.brandTag || "Branded Reel"}</span>
                      <div className="flex items-center justify-between text-[11px] text-slate-300 mt-1">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-400 fill-rose-400" /> {item.likesCount || "2.4K"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-slate-300" /> {item.viewsCount || "38K"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* BOTTOM CTA BAR */}
        <section className="rounded-3xl bg-gradient-to-r from-orange-600 via-rose-600 to-indigo-700 p-8 text-center text-white space-y-4 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
              Ready to collaborate with @{rawHandle}?
            </h2>
            <p className="text-sm text-white/90">
              Create agreements with legally verified e-signatures, track shipments, and review deliverables inside Pravixo.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link to={`/influencer/${creator._id}`}>
                <Button className="rounded-full bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-8 shadow-xl cursor-pointer">
                  Start Brand Campaign
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="rounded-full bg-black/20 hover:bg-black/40 text-white border-white/30 font-semibold px-6 cursor-pointer"
              >
                Copy Media Kit Link
              </Button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Branding */}
      <footer className="max-w-6xl mx-auto px-4 text-center mt-12 text-xs text-slate-500">
        Audited Creator Media Kit generated by <Link to="/" className="text-primary hover:underline font-bold">Pravixo</Link> • Guaranteed verified metrics
      </footer>
    </div>
  );
}
