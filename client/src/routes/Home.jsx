import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Search,
  Star,
  TrendingUp,
  Users,
  Zap,
  CheckCircle2,
  MapPin,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/Carousel";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  categories,
  formatFollowers,
  influencers,
  mockBrands,
} from "../data/influencer";
import { getGenderAvatar, DEFAULT_BANNER } from "../utils/avatar";
import { formatINR } from "@/lib/format";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

import heroBanner from "@/assets/hero-banner.jpg";
import pravixoFlow from "@/assets/pravixo-flow.jpeg";

const resolveImageUrl = (url) => {
  if (!url || url === "undefined" || url === "null" || typeof url !== "string") return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  let base = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  if (base.endsWith("/api")) base = base.slice(0, -4);
  const cleanBase = base.replace(/\/$/, "");
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
};

function FeaturedProfileCard({ inf, user, handleCardClick }) {
  const isBrand = inf.role === "brand";
  const targetUrl = isBrand ? `/brand/${inf.id}` : `/influencer/${inf.id}`;

  const handleClick = (e) => {
    if (!user) {
      e.preventDefault();
      handleCardClick(inf.id, isBrand ? "brand" : "creator");
    }
  };

  const bannerImg = resolveImageUrl(inf.cover || inf.coverUrl || inf.bannerUrl) || DEFAULT_BANNER;
  const avatarImg = resolveImageUrl(inf.avatar || inf.avatarUrl) || getGenderAvatar(inf.name || "User", inf.gender, inf.role || (isBrand ? "brand" : "creator"));

  const hasBarter = Boolean(inf.isBarterAllowed);
  const priceNum = Number(inf.startingPrice || 0);
  const isPureBarter = hasBarter && priceNum === 0;

  return (
    <Link
      to={targetUrl}
      onClick={handleClick}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary/40 hover:shadow-primary/10 card-3d"
    >
      {/* Light sweep hover effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />

      {/* COVER / BANNER */}
      <div className="relative aspect-[1361/450] w-full overflow-hidden bg-muted">
        <img
          src={bannerImg}
          alt={inf.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_BANNER;
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Category & Badge */}
        <div className="absolute right-2 top-2 flex items-center gap-1.5 z-10">
          <Badge
            className="
              rounded-full border-0
              bg-black/60 text-white
              dark:bg-zinc-900/80 dark:text-white
              backdrop-blur-md
              px-2.5 py-0.5 sm:px-3 sm:py-1
              text-[10px] sm:text-xs font-semibold
              shadow-sm
              transition-colors duration-300
              group-hover:bg-primary group-hover:text-white
            "
          >
            {inf.category}
          </Badge>
        </div>

        {hasBarter && (
          <div className="absolute left-2 top-2 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 text-white backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold shadow-md animate-pulse">
              <span>🤝</span> Barter
            </span>
          </div>
        )}
      </div>

      {/* PROFILE CONTENT */}
      <div className="-mt-7 flex flex-1 flex-col px-3 pb-3 sm:-mt-10 sm:px-5 sm:pb-5">
        <div className="relative inline-block w-fit">
          <img
            src={avatarImg}
            alt={inf.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="relative z-10 h-14 w-14 rounded-full border-4 border-card bg-muted object-cover shadow-elevated transition-transform duration-300 group-hover:scale-105 group-hover:ring-2 group-hover:ring-primary/40 sm:h-20 sm:w-20"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = getGenderAvatar(inf.name || "User", inf.gender, inf.role || (isBrand ? "brand" : "creator"));
            }}
          />
        </div>

        <div className="mt-2.5 flex items-start justify-between gap-2 sm:mt-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-xs font-bold sm:text-base text-foreground group-hover:text-primary transition-colors">
              {inf.name}
            </h3>
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs font-medium">
              {inf.handle}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-0.5 text-xs font-bold text-amber-500 sm:text-sm bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Star className="h-3 w-3 fill-current sm:h-3.5 sm:w-3.5" />
            {inf.rating || 5.0}
          </span>
        </div>

        <div className="mt-auto pt-3">
          {/* LOCATION + FOLLOWERS */}
          <div className="mt-2 flex flex-col justify-between gap-1 border-t border-border/80 pt-2.5 text-[10px] sm:mt-3 sm:flex-row sm:items-center sm:text-xs">
            <span className="flex items-center gap-1 truncate text-muted-foreground font-medium">
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary/70" />
              {inf.location?.split(",")[0] || "India"}
            </span>
            <span className="font-semibold text-foreground">
              {formatFollowers(inf.followers || 0)}{" "}
              <span className="text-muted-foreground font-normal">followers</span>
            </span>
          </div>

          {/* PRICE / BARTER */}
          <div className="mt-2 flex items-center justify-between text-[11px] sm:text-sm">
            <span className="text-muted-foreground font-medium text-[10px] sm:text-xs">
              {isPureBarter ? "Collaboration" : "Starting from"}
            </span>

            {isPureBarter ? (
              <span className="inline-flex items-center gap-1 font-display text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full shadow-xs transition-transform duration-300 group-hover:scale-105">
                <span>🤝</span> Barter Deal
              </span>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xs font-black text-gradient-sunset sm:text-base">
                  {formatINR(priceNum)}
                </span>
                {hasBarter && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-md">
                    🤝 Barter
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────
// Animated counter hook – counts from 0 to `end` when visible
// ─────────────────────────────────────────────────────────
function useAnimatedCounter(end, duration = 1800, decimals = 0) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const startVal = 0;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((startVal + eased * end).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end, duration, decimals]);

  return { count, ref };
}

const STATS = [
  {
    icon: Users,
    label: "Active creators",
    end: 52,
    suffix: "K+",
    decimals: 0,
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-[0_0_30px_rgba(139,92,246,0.3)]",
  },
  {
    icon: TrendingUp,
    label: "Campaigns run",
    end: 184,
    suffix: "K",
    decimals: 0,
    gradient: "from-rose-500 to-pink-600",
    glow: "shadow-[0_0_30px_rgba(244,63,94,0.3)]",
  },
  {
    icon: Zap,
    label: "Avg. launch time",
    end: 3.2,
    suffix: " days",
    decimals: 1,
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.3)]",
  },
  {
    icon: CheckCircle2,
    label: "Success rate",
    end: 96,
    suffix: "%",
    decimals: 0,
    gradient: "from-emerald-500 to-teal-500",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
  },
];

function StatCard({ stat }) {
  const { count, ref } = useAnimatedCounter(stat.end, 1800, stat.decimals);
  const Icon = stat.icon;

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 text-center transition-all duration-300 hover:-translate-y-2 ${stat.glow} hover:border-transparent`}
    >
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl`} />
      {/* Icon */}
      <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
        <Icon className="h-6 w-6" />
      </div>
      {/* Animated number */}
      <div className={`font-display text-4xl font-extrabold tracking-tight bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
        {count}{stat.suffix}
      </div>
      <div className="mt-1.5 text-sm font-medium text-muted-foreground">{stat.label}</div>
    </div>
  );
}

function StatsSection() {
  return (
    <section className="relative overflow-hidden border-y border-border">
      {/* Subtle animated background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/20 via-background to-muted/20" />
      <div className="absolute inset-0 -z-10 opacity-30"
        style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(139,92,246,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(244,63,94,0.08) 0%, transparent 50%)" }}
      />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Trusted by thousands
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
            Growing every day
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingRedirectUrl, setPendingRedirectUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [liveCreators, setLiveCreators] = useState([]);
  const [liveBrands, setLiveBrands] = useState([]);

  const [creatorsApi, setCreatorsApi] = useState(null);
  const [brandsApi, setBrandsApi] = useState(null);

  const [creatorsHovered, setCreatorsHovered] = useState(false);
  const [brandsHovered, setBrandsHovered] = useState(false);

  const [creatorsIndex, setCreatorsIndex] = useState(0);
  const [brandsIndex, setBrandsIndex] = useState(0);

  const [creatorsSnaps, setCreatorsSnaps] = useState([]);
  const [brandsSnaps, setBrandsSnaps] = useState([]);

  useEffect(() => {
    document.title = "Pravixo — Hire creators that move the needle";

    const fetchLiveProfiles = async () => {
      try {
        const [creatorsRes, brandsRes] = await Promise.all([
          api.get("/profiles", { params: { role: "creator" } }),
          api.get("/profiles", { params: { role: "brand" } }),
        ]);

        const creatorsData =
          creatorsRes.data?.data ||
          creatorsRes.data?.profiles ||
          creatorsRes.data ||
          [];

        const brandsData =
          brandsRes.data?.data ||
          brandsRes.data?.profiles ||
          brandsRes.data ||
          [];

        if (Array.isArray(creatorsData)) {
          setLiveCreators(creatorsData);
        }
        if (Array.isArray(brandsData)) {
          setLiveBrands(brandsData);
        }
      } catch (error) {
        console.error("Failed to load profiles for home:", error);
      }
    };

    fetchLiveProfiles();
  }, []);

  const isTestOrDummyProfile = (p) => {
    if (!p) return true;
    if (p.isSuspended) return true;
    const name = (p.fullName || p.name || "").toLowerCase().trim();
    const email = (p.email || "").toLowerCase().trim();
    if (email.includes("@pravixo.test") || email.includes("@test.com")) return true;
    return /task20|impostor|suspended|test brand|alice referrer|bob creator|charlie creator|^test$|^ppp$|^llalla$/i.test(name);
  };

  const featuredCreators = useMemo(() => {
    const live = (liveCreators || [])
      .filter((p) => !isTestOrDummyProfile(p))
      .map((p) => ({
        id: p._id || p.id,
        name: p.fullName || p.name || "Creator",
        handle:
          p.handle ||
          `@${(p.fullName || p.name || "creator")
            .toLowerCase()
            .replace(/\s/g, "")}`,
        category: p.category || "General",
        followers:
          (p.instagramFollowers || 0) +
          (p.facebookFollowers || 0) +
          (p.linkedinFollowers || 0) +
          (p.youtubeFollowers || 0) +
          (p.quoraFollowers || 0) +
          (p.twitterFollowers || 0),
        startingPrice: p.startingPrice || 0,
        isBarterAllowed: Boolean(p.isBarterAllowed),
        location: p.location || "India",
        rating: p.rating ?? 5.0,
        reviews: p.reviewsCount ?? 0,
        available: true,
        gender: p.gender || "",
        avatar: resolveImageUrl(p.avatarUrl || p.avatar || p.profileImage) ||
          getGenderAvatar(p.fullName || p.name || "Creator", p.gender, "creator"),
        cover: resolveImageUrl(p.coverUrl || p.cover || p.bannerUrl) ||
          DEFAULT_BANNER,
        bio: p.bio || "",
        role: p.role || "creator",
      }));

    const orderedLive = [...live].sort((a, b) => {
      if (profile?.role === "creator") {
        if (a.id === profile?._id) return -1;
        if (b.id === profile?._id) return 1;
      }
      return 0;
    });

    return orderedLive.length > 0 ? orderedLive.slice(0, 12) : influencers.slice(0, 6);
  }, [liveCreators, profile]);

  const featuredBrands = useMemo(() => {
    const live = (liveBrands || [])
      .filter((p) => !isTestOrDummyProfile(p))
      .map((p) => ({
        id: p._id || p.id,
        name: p.fullName || p.name || "Brand",
        handle:
          p.handle ||
          `@${(p.fullName || p.name || "brand")
            .toLowerCase()
            .replace(/\s/g, "")}`,
        category: p.category || "General",
        followers: 0,
        startingPrice: p.startingPrice || 0,
        isBarterAllowed: Boolean(p.isBarterAllowed),
        location: p.location || "India",
        rating: p.rating ?? 5.0,
        reviews: p.reviewsCount ?? 0,
        available: true,
        gender: p.gender || "",
        avatar: resolveImageUrl(p.avatarUrl || p.avatar || p.profileImage) ||
          getGenderAvatar(p.fullName || p.name || "Brand", p.gender, "brand"),
        cover: resolveImageUrl(p.coverUrl || p.cover || p.bannerUrl) ||
          DEFAULT_BANNER,
        bio: p.bio || "",
        role: p.role || "brand",
      }));

    return live.length > 0 ? live.slice(0, 12) : mockBrands.slice(0, 6);
  }, [liveBrands]);

  const handleProfileCardClick = (profileId, role) => {
    const targetUrl =
      role === "brand" ? `/brand/${profileId}` : `/influencer/${profileId}`;
    setPendingRedirectUrl(targetUrl);
    setShowAuthModal(true);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/browse");
    }
  };

  const isSuspended =
    profile?.isSuspended &&
    profile?.suspendedUntil &&
    new Date(profile.suspendedUntil) > new Date();

  // Autoplay for creators
  useEffect(() => {
    if (!creatorsApi || creatorsHovered) return;
    const interval = setInterval(() => {
      creatorsApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [creatorsApi, creatorsHovered]);

  // Autoplay for brands
  useEffect(() => {
    if (!brandsApi || brandsHovered) return;
    const interval = setInterval(() => {
      brandsApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [brandsApi, brandsHovered]);

  // Creators snaps & select listener
  useEffect(() => {
    if (!creatorsApi) return;
    const updateCreators = () => {
      setCreatorsSnaps(creatorsApi.scrollSnapList?.() || []);
      setCreatorsIndex(creatorsApi.selectedScrollSnap?.() || 0);
    };
    updateCreators();
    creatorsApi.on?.("select", updateCreators);
    return () => {
      creatorsApi.off?.("select", updateCreators);
    };
  }, [creatorsApi]);

  // Brands snaps & select listener
  useEffect(() => {
    if (!brandsApi) return;
    const updateBrands = () => {
      setBrandsSnaps(brandsApi.scrollSnapList?.() || []);
      setBrandsIndex(brandsApi.selectedScrollSnap?.() || 0);
    };
    updateBrands();
    brandsApi.on?.("select", updateBrands);
    return () => {
      brandsApi.off?.("select", updateBrands);
    };
  }, [brandsApi]);

  return (
    <div className="overflow-hidden">
      {/* SUSPENSION ALERT */}
      {isSuspended && (
        <div className="border-b border-destructive/30 bg-destructive/15 px-4 py-3 text-center text-sm font-medium text-destructive">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              Your account is temporarily suspended until{" "}
              {new Date(profile.suspendedUntil).toLocaleDateString()}. Reason:{" "}
              {profile.suspensionReason || "Guideline violation"}
            </span>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pb-16">
        {/* Background Banner Image */}
        <div className="absolute inset-0 -z-10">
          <img
            src={heroBanner}
            alt="Featured creators across fashion, fitness, tech, beauty, travel and food"
            className="h-full w-full scale-105 object-cover blur-xs"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/80 to-background" />
          <div className="absolute inset-0 bg-background/30" />
        </div>

        {/* 3D Ambient Gradient Blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-32 -top-40 h-[32rem] w-[32rem] rounded-full gradient-warm opacity-25 blur-3xl animate-blob" />
          <div
            className="absolute right-0 top-10 h-[30rem] w-[30rem] rounded-full gradient-pink opacity-25 blur-3xl animate-blob"
            style={{ animationDelay: "4s" }}
          />
          <div
            className="absolute left-1/3 bottom-0 h-[24rem] w-[24rem] rounded-full gradient-sunset opacity-15 blur-3xl animate-blob"
            style={{ animationDelay: "8s" }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 sm:px-8 sm:pt-20 lg:px-8">
          <div className="mx-auto max-w-5xl text-center relative">

            {/* 3D Floating Badges around Hero (GPU-accelerated) */}
            <div className="hidden lg:block">
              <div className="absolute -left-12 top-6 animate-float z-20">
                <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-card/85 px-3.5 py-2 shadow-xl backdrop-blur-md transition-transform hover:scale-105 select-none">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xs">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-foreground">AI Matching</p>
                    <p className="text-[9px] text-muted-foreground">Vetted in seconds</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-8 top-12 animate-float z-20" style={{ animationDelay: "2.5s" }}>
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-card/85 px-3.5 py-2 shadow-xl backdrop-blur-md transition-transform hover:scale-105 select-none">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
                    <span className="text-xs">🤝</span>
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-foreground">Barter & Paid Deals</p>
                    <p className="text-[9px] text-emerald-500 font-semibold">100% Verified</p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-6 bottom-4 animate-float z-20" style={{ animationDelay: "4s" }}>
                <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-card/85 px-3.5 py-2 shadow-xl backdrop-blur-md transition-transform hover:scale-105 select-none">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xs">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-foreground">Escrow Protection</p>
                    <p className="text-[9px] text-muted-foreground">Safe collaboration</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm shadow-xs mb-4">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
              <span>India's Leading Creator & Brand Marketplace</span>
            </div>

            {/* Heading */}
            <h1 className="mt-2 text-center font-display font-black leading-[1.05] tracking-tight">
              <span className="block text-[clamp(2.5rem,5.5vw,5.2rem)] text-foreground">
                Find the right influencers
              </span>
              <span className="block text-[clamp(2.5rem,5.5vw,5.2rem)] text-gradient-sunset drop-shadow-sm">
                for your Brand in Minutes.
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
              Discover verified influencers and top brands across every category. Support for cash budgets and barter collaborations with end-to-end safe escrow protection.
            </p>

            {/* Search Input with 3D Glow Container */}
            <form
              onSubmit={handleSearch}
              className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-full border border-border/80 bg-card/95 p-2 shadow-xl backdrop-blur-md focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15 transition-all duration-300"
            >
              <Search className="ml-3.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search creators by niche, location, handle, or 'barter'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground font-medium"
              />
              <Button
                type="submit"
                size="sm"
                className="rounded-full gradient-sunset border-0 px-6 py-2.5 text-white shadow-glow hover:opacity-95 transition-all hover:scale-105 active:scale-95 text-xs font-bold"
              >
                Search <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </form>

            {/* Interactive Quick Search Pills */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-bold text-muted-foreground mr-1 uppercase tracking-wider">Quick:</span>
              {[
                { label: "🤝 Barter Deals", query: "barter" },
                { label: "👗 Fashion", query: "fashion" },
                { label: "💻 Tech", query: "tech" },
                { label: "🍕 Food", query: "food" },
                { label: "💪 Fitness", query: "fitness" },
                { label: "✈️ Travel", query: "travel" },
              ].map((pill) => (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => navigate(`/browse?q=${encodeURIComponent(pill.query)}`)}
                  className="rounded-full border border-border/80 bg-card/70 px-3 py-1 text-xs font-medium text-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all duration-200 shadow-xs cursor-pointer hover:scale-105 active:scale-95"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Payment info buttons */}
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs font-semibold border-border/80 bg-background/60 backdrop-blur hover:bg-accent hover:border-primary/40 shadow-xs"
                onClick={() =>
                  navigate("/protection-info", {
                    state: { type: "creator" },
                  })
                }
              >
                💰 How do I get paid? (Creators)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs font-semibold border-border/80 bg-background/60 backdrop-blur hover:bg-accent hover:border-primary/40 shadow-xs"
                onClick={() =>
                  navigate("/protection-info", {
                    state: { type: "brand" },
                  })
                }
              >
                🛡️ How is my money protected? (Brands)
              </Button>
            </div>

            {/* If logged out CTA Buttons */}
            {!user && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link to="/register?role=brand">
                  <Button
                    size="lg"
                    className="min-w-[210px] justify-center rounded-full gradient-sunset border-0 text-white shadow-glow transition-transform hover:scale-105 hover:opacity-95 font-bold"
                  >
                    I'm a brand
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/register?role=creator">
                  <Button
                    size="lg"
                    className="min-w-[210px] justify-center rounded-full gradient-sunset border-0 text-white shadow-glow transition-transform hover:scale-105 hover:opacity-95 font-bold"
                  >
                    I'm an influencer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================
          BROWSE BY CATEGORY
      ========================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Browse by category
            </h2>
            <p className="mt-2 text-muted-foreground">
              Find the perfect voice for your brand.
            </p>
          </div>
          <Link
            to="/browse"
            className="text-sm font-semibold text-primary hover:underline transition-colors flex items-center gap-1"
          >
            All categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.name}
              to={`/browse?category=${encodeURIComponent(c.name)}`}
              className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 card-3d"
            >
              <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="mb-4 inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-secondary/80 text-2xl transition-transform duration-300 group-hover:scale-115 group-hover:rotate-3 shadow-xs">
                {c.emoji}
              </div>
              <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors text-base">
                {c.name}
              </h3>
              {c.count && (
                <p className="mt-1 text-xs text-muted-foreground font-medium">
                  {c.count.toLocaleString()} creators
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* =========================
          FEATURED CREATORS
      ========================= */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Featured creators
            </h2>
            <p className="mt-2 text-muted-foreground">
              Hand-picked by our team this week.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/browse?role=creator"
              className="hidden text-sm font-medium text-primary hover:underline sm:block"
            >
              View all →
            </Link>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-border bg-card hover:bg-accent"
                onClick={() => creatorsApi?.scrollPrev()}
                aria-label="Previous slide"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-border bg-card hover:bg-accent"
                onClick={() => creatorsApi?.scrollNext()}
                aria-label="Next slide"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div
          onMouseEnter={() => setCreatorsHovered(true)}
          onMouseLeave={() => setCreatorsHovered(false)}
        >
          <Carousel
            setApi={setCreatorsApi}
            opts={{ loop: true, align: "start" }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 sm:-ml-6">
              {featuredCreators.map((inf) => (
                <CarouselItem
                  key={inf.id}
                  className="basis-full pl-3 sm:basis-1/2 sm:pl-6 lg:basis-1/3"
                >
                  <FeaturedProfileCard
                    inf={inf}
                    user={user}
                    handleCardClick={handleProfileCardClick}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Creator Dots */}
        {creatorsSnaps.length > 1 && (
          <div className="mt-6 flex justify-center gap-1.5">
            {creatorsSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === creatorsIndex
                    ? "w-5 bg-primary"
                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                onClick={() => creatorsApi?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* =========================
          FEATURED BRANDS
      ========================= */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Featured brands
            </h2>
            <p className="mt-2 text-muted-foreground">
              Vetted brands hiring creators today.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/browse?role=brand"
              className="hidden text-sm font-medium text-primary hover:underline sm:block"
            >
              View all →
            </Link>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-border bg-card hover:bg-accent"
                onClick={() => brandsApi?.scrollPrev()}
                aria-label="Previous slide"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-border bg-card hover:bg-accent"
                onClick={() => brandsApi?.scrollNext()}
                aria-label="Next slide"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div
          onMouseEnter={() => setBrandsHovered(true)}
          onMouseLeave={() => setBrandsHovered(false)}
        >
          <Carousel
            setApi={setBrandsApi}
            opts={{ loop: true, align: "start" }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 sm:-ml-6">
              {featuredBrands.map((brand) => (
                <CarouselItem
                  key={brand.id}
                  className="basis-full pl-3 sm:basis-1/2 sm:pl-6 lg:basis-1/3"
                >
                  <FeaturedProfileCard
                    inf={brand}
                    user={user}
                    handleCardClick={handleProfileCardClick}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Brand Dots */}
        {brandsSnaps.length > 1 && (
          <div className="mt-6 flex justify-center gap-1.5">
            {brandsSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === brandsIndex
                    ? "w-5 bg-primary"
                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                onClick={() => brandsApi?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* =========================
          PRAVIXO FLOW
      ========================= */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            How Pravixo Works
          </h2>
          <p className="mt-2 text-muted-foreground">
            Secure. Transparent. Trusted.
          </p>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-elevated">
          <img
            src={pravixoFlow}
            alt="Pravixo Flow"
            className="w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
          />
        </div>
      </section>

      {/* =========================
          CTA
      ========================= */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] gradient-sunset p-10 text-center text-white shadow-glow sm:p-16">
          <div
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, white, transparent 40%), radial-gradient(circle at 80% 60%, white, transparent 40%)",
            }}
          />

          <div className="relative">
            <h2 className="font-display text-3xl font-bold sm:text-5xl">
              Ready to launch your next campaign?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              Join thousands of brands and creators using Pravixo to grow together.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {!user ? (
                <Link to="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                  >
                    Start free
                  </Button>
                </Link>
              ) : (
                <Link
                  to={
                    profile?.role === "creator"
                      ? "/dashboard/influencer"
                      : "/dashboard/customer"
                  }
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              )}

              <Link to="/browse">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                >
                  Explore creators
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          STATS - Animated Counters
      ========================= */}
      <StatsSection />

      {/* =========================
          AUTH REQUIRED MODAL
      ========================= */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          />

          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-elevated animate-in fade-in zoom-in duration-200">
            <h3 className="font-display text-lg font-bold text-foreground">
              Sign In Required
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Please sign in or create an account to view full profile details and pricing tiers.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAuthModal(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate("/login", {
                    state: { from: pendingRedirectUrl },
                  });
                }}
                className="rounded-full gradient-sunset border-0 text-white shadow-glow"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}