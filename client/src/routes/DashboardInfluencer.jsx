import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";
import { subscribeToPush } from "../utils/pushNotification";

import {
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaTwitter,
} from "react-icons/fa";


import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Upload,
  Plus,
  Trash2,
 
  Camera,
  ImageIcon,

  Check,
  ChevronsUpDown,
  X,
  Star,
  Lock,
  RotateCw,
  ShieldCheck,
  ExternalLink,
  Activity,
  CreditCard,
  Building2,
  Percent,
  Sparkles,
  Clock,
  Megaphone,
  Calendar,
  IndianRupee,
  Layers,
  Wallet,
  ArrowUpRight,
  History,
} from "lucide-react";



import { Button } from "@/components/ui/Button";
import { CATEGORY_OPTIONS } from "@/data/influencer";
import { Switch } from "@/components/ui/Switch";
import { SubscriptionTab } from "../components/subscription/SubscriptionTab";
import { CreatorOfferForm } from "../components/offers/CreatorOfferForm";
import { CreatorOffersSidebarWidget } from "../components/offers/CreatorOffersSidebarWidget";
import { profileService } from "@/services/profileService";
const { submitVerification } = profileService;

const QuoraIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.592 16.483c.783-.984 1.258-2.228 1.258-3.585 0-3.155-2.558-5.713-5.713-5.713S6.423 9.743 6.423 12.898s2.558 5.713 5.713 5.713c1.088 0 2.106-.305 2.975-.833l3.208 3.208c.28.28.73.28 1.01 0a.715.715 0 000-1.01l-2.737-2.493zm-4.455.518c-2.099 0-3.8-1.701-3.8-3.8 0-2.099 1.701-3.8 3.8-3.8s3.8 1.701 3.8 3.8c0 2.099-1.701 3.8-3.8 3.8z" />
  </svg>
);

function getCountdown(dueDateTimestamp) {
  const diff = dueDateTimestamp - Date.now();
  if (diff <= 0) {
    return { overdue: true, text: "Task Overdue" };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let text = "";
  if (days > 0) text += `${days}d `;
  if (hours > 0 || days > 0) text += `${hours}h `;
  text += `${minutes}m remaining`;
  return { overdue: false, text };
}

function CountdownTimer({ dueDate }) {
  const [timeLeft, setTimeLeft] = useState(getCountdown(dueDate));

  useEffect(() => {
    setTimeLeft(getCountdown(dueDate));
    const timer = setInterval(() => {
      setTimeLeft(getCountdown(dueDate));
    }, 15000);

    return () => clearInterval(timer);
  }, [dueDate]);

  if (timeLeft.overdue) {
    return (
      <span className="inline-flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-red-500/20">
        Task Overdue
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-primary/20 animate-pulse">
      {timeLeft.text}
    </span>
  );
}

const LOCATION_OPTIONS = [
  "Pan India",
  "Delhi NCR",
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Surat",
  "Jaipur",
  "Lucknow",
  "Kanpur",
  "Noida",
  "Greater Noida",
  "Ghaziabad",
  "Gurugram",
  "Faridabad",
  "Indore",
  "Bhopal",
  "Nagpur",
  "Nashik",
  "Patna",
  "Ranchi",
  "Chandigarh",
  "Ludhiana",
  "Amritsar",
  "Jalandhar",
  "Dehradun",
  "Haridwar",
  "Varanasi",
  "Agra",
  "Prayagraj",
  "Meerut",
  "Gorakhpur",
  "Kochi",
  "Thiruvananthapuram",
  "Kozhikode",
  "Coimbatore",
  "Madurai",
  "Visakhapatnam",
  "Vijayawada",
  "Bhubaneswar",
  "Cuttack",
  "Guwahati",
  "Siliguri",
  "Jodhpur",
  "Udaipur",
  "Kota",
  "Mysore",
  "Mangalore",
  "Other Location",
];

const DEFAULT_BANNER_IMAGES = [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1800&q=85",
];

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/TextArea";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import api from "@/lib/api";

export function DashboardInfluencer() {
  const navigate = useNavigate();
  const { profile, user, loading, updateProfile: updateLocalProfile, fetchProfile } = useAuth();

  const fileRef = useRef(null);
  const avatarFileRef = useRef(null);
  const coverFileRef = useRef(null);

  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (apiUrl.endsWith("/api")) apiUrl = apiUrl.slice(0, -4);
    return `${apiUrl}${url}`;
  };

  // ================= REST API =================
  const apiGet = async (url, params = {}) => {
    const res = await api.get(url, { params });
    return res.data?.data ?? res.data;
  };
  const apiPost = async (url, data, config = {}) => {
    const res = await api.post(url, data, config);
    return res.data?.data ?? res.data;
  };
  const apiPut = async (url, data, config = {}) => {
    const res = await api.put(url, data, config);
    return res.data?.data ?? res.data;
  };
  const apiPatch = async (url, data, config = {}) => {
    const res = await api.patch(url, data, config);
    return res.data?.data ?? res.data;
  };
  const apiDelete = async (url, config = {}) => {
    const res = await api.delete(url, config);
    return res.data?.data ?? res.data;
  };

  const useRestQuery = (key, getter, enabled = true) => {
    const [data, setData] = useState(undefined);
    const [error, setError] = useState(null);

    useEffect(() => {
      let alive = true;

      if (!enabled) {
        setData(undefined);
        setError(null);
        return () => { alive = false; };
      }

      getter()
        .then((v) => {
          if (alive) {
            setData(v);
            setError(null);
          }
        })
        .catch((e) => {
          if (alive) {
            console.error(`REST query failed [${key}]`, e);
            setError(e);
            setData([]);
          }
        });

      return () => { alive = false; };
    }, [key, enabled]);

    return data;
  };

  // =====================================================
  // SAFE MONGO PROFILE ID
  // =====================================================
  // The pricing API expects Mongo Profile._id, NOT the custom userId
  // such as user_bmFAZ21haWwuY29t.
  const mongoProfileId =
    profile?._id ||
    profile?.id ||
    profile?.profileId ||
    null;

  const hasValidMongoProfileId =
    typeof mongoProfileId === "string" &&
    /^[a-fA-F0-9]{24}$/.test(mongoProfileId);

  const profileKey = mongoProfileId || "none";
  const [portfolioRefreshKey, setPortfolioRefreshKey] = useState(0);
  const [showPushBanner, setShowPushBanner] = useState(false);
  const [enablingPush, setEnablingPush] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        setShowPushBanner(true);
      }
    }
  }, []);

  const handleEnablePush = async () => {
    setEnablingPush(true);
    try {
      const res = await subscribeToPush();
      if (res.success) {
        setShowPushBanner(false);
        toast.success("Push notifications enabled! You'll receive alerts for new campaigns.");
      } else if (res.reason === "denied") {
        setShowPushBanner(false);
        toast.info("Notifications are blocked in browser settings.");
      }
    } catch (err) {
      console.error("Push subscription error:", err);
    } finally {
      setEnablingPush(false);
    }
  };

  console.log("DASHBOARD PROFILE:", profile);
  console.log("DASHBOARD MONGO PROFILE ID:", mongoProfileId);

  // =====================================================
  // PROFILE-DEPENDENT QUERIES
  // =====================================================
  const pricingTiers = useRestQuery(
    `pricing-${profileKey}`,
    () => apiGet(`/pricing/profile/${mongoProfileId}`),
    hasValidMongoProfileId
  );

  const portfolioImages = useRestQuery(
    `portfolio-${profileKey}-${portfolioRefreshKey}`,
    () => apiGet(`/portfolio/profile/${mongoProfileId}`),
    hasValidMongoProfileId
  );

  const connections = useRestQuery(
    `social-${profileKey}`,
    () => apiGet(`/social/profile/${mongoProfileId}`),
    hasValidMongoProfileId
  );

  const clientIds = useRestQuery(
    "oauth-client-ids",
    () => apiGet("/social/oauth/client-ids"),
    true
  );

  const syncConnection = async ({ connectionId }) => apiPost(`/social/oauth/exchange`, { connectionId });
  const disconnectPlatform = ({ connectionId }) => apiDelete(`/social/${connectionId}`);
  const updateProfile = ({ id, ...data }) => apiPut(`/profiles/${id}`, data);
  const upsertPricing = ({ profileId, tiers }) => apiPut(`/pricing`, { profileId, tiers });
  const removeTierMutation = ({ id }) => apiDelete(`/pricing/${id}`);

  const addPortfolioImage = async ({ profileId, imageFile, sortOrder }) => {
    const form = new FormData();
    form.append("image", imageFile);
    form.append("profileId", profileId);
    form.append("sortOrder", String(sortOrder ?? 0));
    return apiPost(`/portfolio`, form, { headers: { "Content-Type": "multipart/form-data" } });
  };
  const removePortfolioImage = ({ id }) => apiDelete(`/portfolio/${id}`);

  const setAvatarImage = async ({ file, profileId }) => {
    const form = new FormData();
    form.append("image", file);
    return apiPost(`/profiles/${profileId || mongoProfileId}/avatar`, form, { headers: { "Content-Type": "multipart/form-data" } });
  };
  const setCoverImage = async ({ file, profileId }) => {
    const form = new FormData();
    form.append("image", file);
    return apiPost(`/profiles/${profileId || mongoProfileId}/cover`, form, { headers: { "Content-Type": "multipart/form-data" } });
  };


  const popupSettings = null;
  const offers = useRestQuery("offers", () => apiGet(`/subscriptions/offers`), true) || [];
  const packages = useRestQuery("packages", () => apiGet(`/subscriptions/packages`), true) || [];
  const currentSub = useRestQuery(
    `subscription-${profileKey}`,
    () => apiGet(`/subscriptions/user/${mongoProfileId}`),
    hasValidMongoProfileId
  );
  const trackAnalytics = async () => {};
  const checkSubscriptionStatus = async () => {};
  const upgradeSubscription = ({ profileId, packageId, offerId }) =>
    apiPost(`/subscriptions`, { profileId, packageId, offerId });

  const reviews = useRestQuery(
    `reviews-${profileKey}`,
    () => apiGet(`/reviews/creator/${mongoProfileId}`, { visibleOnly: false }),
    hasValidMongoProfileId
  );
  const toggleVisibility = ({ reviewId }) => apiPatch(`/reviews/${reviewId}/visibility`, {});
  const [requestsRefreshKey, setRequestsRefreshKey] = useState(0);
  const myRequests = useRestQuery(
    `requests-${profileKey}-${requestsRefreshKey}`,
    () => apiGet(`/connections/creator/${mongoProfileId}/my-requests`),
    hasValidMongoProfileId
  );
  const myTasks = useRestQuery(
    `tasks-${profileKey}`,
    () => apiGet(`/tasks/creator/${mongoProfileId}`),
    hasValidMongoProfileId
  );
  const creatorPayments = useRestQuery(
    `payments-${profileKey}`,
    () => apiGet(`/payments/creator/${mongoProfileId}`),
    hasValidMongoProfileId
  );
  const startTask = ({ taskId }) => apiPatch(`/tasks/${taskId}/start`, {});
  const submitTask = ({ taskId, submissionLink, notes, attachmentLink }) =>
    apiPatch(`/tasks/${taskId}/submit`, { submissionLink, notes, attachmentLink });
  const saveBankDetails = (data) =>
    apiPost(`/payments/bank-details`, { ...data, creatorId: mongoProfileId });
  const bankDetails = useRestQuery(
    `bank-${profileKey}`,
    () => apiGet(`/payments/bank-details/${mongoProfileId}`),
    hasValidMongoProfileId
  );
  const [walletRefreshKey, setWalletRefreshKey] = useState(0);
  const creatorWalletData = useRestQuery(
    `wallet-${profileKey}-${walletRefreshKey}`,
    () => apiGet(`/wallet/my-wallet`),
    hasValidMongoProfileId
  );
  const creatorWithdrawalsData = useRestQuery(
    `withdrawals-${profileKey}-${walletRefreshKey}`,
    () => apiGet(`/wallet/my-withdrawals`),
    hasValidMongoProfileId
  );

  // Safe normalized fallbacks so rendering never crashes on null/empty/arrays
  const creatorWallet = (creatorWalletData && typeof creatorWalletData === "object" && !Array.isArray(creatorWalletData))
    ? (creatorWalletData.wallet || {})
    : {};
  const creatorTransactionsList = (creatorWalletData && Array.isArray(creatorWalletData.recentTransactions))
    ? creatorWalletData.recentTransactions
    : [];
  const creatorWithdrawalsList = Array.isArray(creatorWithdrawalsData)
    ? creatorWithdrawalsData
    : (creatorWithdrawalsData && Array.isArray(creatorWithdrawalsData.data))
    ? creatorWithdrawalsData.data
    : [];

  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState("");
  const [requestingWithdrawal, setRequestingWithdrawal] = useState(false);

  const [discoverRefreshKey, setDiscoverRefreshKey] = useState(0);
  const discoverableCampaigns = useRestQuery(
    `campaigns-discover-${discoverRefreshKey}`,
    () => apiGet(`/campaigns/discover`),
    true
  );

  // Campaign Discovery Modal & Join Request States
  const [selectedCampaignForDiscovery, setSelectedCampaignForDiscovery] = useState(null);
  const [joinPitch, setJoinPitch] = useState("");
  const [joiningCampaign, setJoiningCampaign] = useState(false);

  // Deliverable Submission Modal States (Task 6 & Task 7)
  const [selectedCollabForSubmission, setSelectedCollabForSubmission] = useState(null);
  const [submissionDeliverableType, setSubmissionDeliverableType] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionFilePreview, setSubmissionFilePreview] = useState(null);
  const [submissionCaption, setSubmissionCaption] = useState("");
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false);

  // Submissions History Review Modal for Creator (Task 7) & Rework State (Task 8)
  const [selectedCollabForHistory, setSelectedCollabForHistory] = useState(null);
  const [creatorSubmissionsList, setCreatorSubmissionsList] = useState([]);
  const [loadingCreatorSubmissions, setLoadingCreatorSubmissions] = useState(false);
  const [reworkingSubmission, setReworkingSubmission] = useState(null);
  const [reworkFile, setReworkFile] = useState(null);
  const [reworkFilePreview, setReworkFilePreview] = useState(null);
  const [reworkCaption, setReworkCaption] = useState("");
  const [submittingRework, setSubmittingRework] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState("dashboard");
  // Sub-section quick selector to eliminate excessive scrolling
  const [creatorSubSection, setCreatorSubSection] = useState("all");


  // Popup & Banner State
  const [showOfferPopup, setShowOfferPopup] = useState(false);
  const [activeOffer, setActiveOffer] = useState(null);
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [upgradingId, setUpgradingId] = useState(null);

  const handleUpgradeFromPopup = async (packageId, offerId) => {
    if (!profile) return;
    setUpgradingId(packageId);
    try {
      await upgradeSubscription({
        profileId: mongoProfileId,
        packageId,
        offerId,
      });
      toast.success("Package upgraded successfully! Enjoy your new features.");
      setShowOfferPopup(false);
    } catch (err) {
      console.error(err);
      toast.error((err).message || "Failed to upgrade package");
    } finally {
      setUpgradingId(null);
    }
  };

  useEffect(() => {
    if (profile) {
      checkSubscriptionStatus({ profileId: mongoProfileId }).catch(console.error);
    }
  }, [profile]);

  useEffect(() => {
    if (!popupSettings || !offers || !profile || !user) return;
    if (!popupSettings.showPopup) return;

    // Check target users
    const matchesTarget =
      popupSettings.targetUsers === "both" ||
      (popupSettings.targetUsers === "brands" && profile.role === "brand") ||
      (popupSettings.targetUsers === "creators" && profile.role === "creator");
    if (!matchesTarget) return;

    // Find active offer (optional)
    const activeOfferRecord = offers.find(
      (o) => o.active && o._id === popupSettings.activeOfferId && o.expiryDate > Date.now()
    );
    setActiveOffer(activeOfferRecord || null);

    const hasSeenKey = `popup_seen_${mongoProfileId}_${activeOfferRecord?._id || "no_offer"}`;
    const lastSeenTimeKey = `popup_last_seen_${mongoProfileId}`;
    const dontShowUntilKey = `popup_dont_show_until_${mongoProfileId}`;

    const now = Date.now();

    // Check "Don't Show Again for 7 Days"
    const dontShowUntil = localStorage.getItem(dontShowUntilKey);
    if (dontShowUntil && parseInt(dontShowUntil, 10) > now) {
      return;
    }

    let shouldDisplay = false;
    const frequency = popupSettings.popupFrequency;

    if (frequency === "every_login") {
      const seenThisSession = sessionStorage.getItem(hasSeenKey);
      if (!seenThisSession) {
        shouldDisplay = true;
      }
    } else if (frequency === "first_login" || frequency === "only_once") {
      const hasSeen = localStorage.getItem(hasSeenKey);
      if (!hasSeen) {
        shouldDisplay = true;
      }
    } else if (frequency === "every_7_days") {
      const lastSeen = localStorage.getItem(lastSeenTimeKey);
      if (!lastSeen || now - parseInt(lastSeen, 10) > 7 * 24 * 60 * 60 * 1000) {
        shouldDisplay = true;
      }
    }

    if (shouldDisplay) {
      setShowOfferPopup(true);
      sessionStorage.setItem(hasSeenKey, "true");
      localStorage.setItem(hasSeenKey, "true");
      localStorage.setItem(lastSeenTimeKey, now.toString());
      if (activeOfferRecord) {
        trackAnalytics({ offerId: activeOfferRecord._id, type: "view" });
      }
    }
  }, [popupSettings, offers, profile, user]);


  const [selectedAuditLogPayment, setSelectedAuditLogPayment] = useState(null);

  // Bank Account Form State
  const [bankFullName, setBankFullName] = useState("");
  const [bankPhone, setBankPhone] = useState("");
  const [bankEmail, setBankEmail] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankHolderName, setBankHolderName] = useState("");
  const [bankNumber, setBankNumber] = useState("");
  const [bankNumberConfirm, setBankNumberConfirm] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankUpi, setBankUpi] = useState("");
  const [bankPan, setBankPan] = useState("");
  const [savingBank, setSavingBank] = useState(false);

  useEffect(() => {
    if (bankDetails) {
      setBankFullName(bankDetails.fullName || "");
      setBankPhone(bankDetails.phone || "");
      setBankEmail(bankDetails.email || "");
      setBankName(bankDetails.bankName || "");
      setBankHolderName(bankDetails.accountHolderName || "");
      setBankNumber(bankDetails.accountNumber || "");
      setBankNumberConfirm(bankDetails.accountNumber || "");
      setBankIfsc(bankDetails.ifsc || "");
      setBankUpi(bankDetails.upiId || "");
      setBankPan(bankDetails.panNumber || "");
    }
  }, [bankDetails]);

  // Task Submission States
  const [submitTargetTask, setSubmitTargetTask] = useState(null);
  const [submissionLink, setSubmissionLink] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [submissionAttachment, setSubmissionAttachment] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);

  const [fullName, setFullName] = useState("");
  const [handle, setHandle] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [startingPrice, setStartingPrice] = useState(0);
  const [tiers, setTiers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [aadharStorageId, setAadharStorageId] = useState("");
  const [aadharFileName, setAadharFileName] = useState("");
  const [uploadingAadhar, setUploadingAadhar] = useState(false);
  const [panStorageId, setPanStorageId] = useState("");
  const [panFileName, setPanFileName] = useState("");
  const [uploadingPan, setUploadingPan] = useState(false);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  // Social states
  const [instaHandle, setInstaHandle] = useState("");
  const [instaFollowers, setInstaFollowers] = useState(0);
  const [fbHandle, setFbHandle] = useState("");
  const [fbFollowers, setFbFollowers] = useState(0);
  const [liHandle, setLiHandle] = useState("");
  const [liFollowers, setLiFollowers] = useState(0);
  const [ytHandle, setYtHandle] = useState("");
  const [ytFollowers, setYtFollowers] = useState(0);
  const [quoraHandle, setQuoraHandle] = useState("");
  const [quoraFollowers, setQuoraFollowers] = useState(0);
  const [twHandle, setTwHandle] = useState("");
  const [twFollowers, setTwFollowers] = useState(0);
  const [showVerificationDialog, setShowVerificationDialog] =
  useState(false);

const [aadharFile, setAadharFile] =
  useState(null);

const [panFile, setPanFile] =
  useState(null);

const [verificationUploading, setVerificationUploading] =
  useState(false);
const [showPostSaveDialog, setShowPostSaveDialog] = useState(false);
const [discoverPage, setDiscoverPage] = useState(1);
const CAMPAIGNS_PER_PAGE = 6;

  // Social Verification States & Methods
  const [syncingPlatform, setSyncingPlatform] = useState(null);
  const [selectedChartPlatform, setSelectedChartPlatform] = useState("instagram");
  const activeChartConnection = connections?.find((c) => c.platform === selectedChartPlatform);
  const history = useRestQuery(
    `history-${activeChartConnection?._id || "none"}`,
    () => apiGet(`/social/${activeChartConnection._id}/history`),
    !!activeChartConnection
  );


  const chartData = useMemo(() => {
    if (!history) return [];
    return [...history]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((item) => ({
        date: new Date(item.timestamp).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        followers: item.followers,
        views: item.views,
        engagement: item.engagementRate,
      }));
  }, [history]);

  const handleConnectPlatform = (platform) => {
    if (!profile || !clientIds) return;
    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/callback`);
    const state = `${platform}:${mongoProfileId}:${profile.role}`;

    let url = "";
    if (platform === "youtube") {
      const clientId = clientIds.googleClientId;
      if (!clientId) {
        toast.error("Google OAuth is not configured on the backend yet.");
        return;
      }
      url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/youtube.readonly&state=${state}&access_type=offline&prompt=consent`;
    } else if (platform === "instagram" || platform === "facebook") {
      const clientId = clientIds.metaClientId;
      if (!clientId) {
        toast.error("Meta OAuth is not configured on the backend yet.");
        return;
      }
      const scope = "pages_show_list,instagram_basic,instagram_manage_insights,pages_read_engagement";
      url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
    } else if (platform === "linkedin") {
      const clientId = clientIds.linkedinClientId;
      if (!clientId) {
        toast.error("LinkedIn OAuth is not configured on the backend yet.");
        return;
      }
      url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=openid%20profile%20w_member_social`;
    } else if (platform === "twitter") {
      const clientId = clientIds.twitterClientId;
      if (!clientId) {
        toast.error("Twitter OAuth is not configured on the backend yet.");
        return;
      }
      sessionStorage.setItem("twitter_code_verifier", "challenge");
      url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=users.read%20tweet.read%20offline.access&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
    }

    if (url) {
      window.location.href = url;
    }
  };

  const handleManualSync = async (connectionId, platform) => {
    setSyncingPlatform(platform);
    const toastId = toast.loading(`Synchronizing ${platform.toUpperCase()} analytics...`);
    try {
      const res = await syncConnection({ connectionId });
      if (res.success) {
        toast.success(`${platform.toUpperCase()} metrics updated successfully!`, { id: toastId });
      } else {
        toast.error(`Sync failed: ${res.error}`, { id: toastId });
      }
    } catch (err) {
      const e = err ;
      toast.error(e.message || "Failed to trigger sync", { id: toastId });
    } finally {
      setSyncingPlatform(null);
    }
  };

  const handleDisconnect = async (connectionId, platform) => {
    if (!confirm(`Are you sure you want to disconnect your verified ${platform.toUpperCase()} account?`)) return;
    try {
      await disconnectPlatform({ connectionId });
      toast.success(`Disconnected verified ${platform.toUpperCase()} account.`);
    } catch (err) {
      const e = err ;
      toast.error(e.message || "Failed to disconnect account.");
    }
  };

  const selectedCategories = category
    ? category
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const handleSelectCategory = (val) => {
    let updated;
    if (selectedCategories.includes(val)) {
      updated = selectedCategories.filter((c) => c !== val);
    } else {
      updated = [...selectedCategories, val];
    }
    setCategory(updated.join(", "));
  };

  const selectedLocations = location
    ? location
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const handleSelectLocation = (val) => {
    let updated;
    if (selectedLocations.includes(val)) {
      updated = selectedLocations.filter((c) => c !== val);
    } else {
      updated = [...selectedLocations, val];
    }
    setLocation(updated.join(", "));
  };

  useEffect(() => {
    document.title = "Creator dashboard —  Pravixo";
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || profile.displayName || "");
      setHandle(profile.handle?.replace("@", "") || "");
      setPhone(profile.phone || "");
      setCategory(profile.category || "");
      setLocation(profile.location || "");
      setBio(profile.bio || "");
      setStartingPrice(Number(profile.startingPrice ?? 0));
      // Socials
      setInstaHandle(profile.instagramHandle || "");
      setInstaFollowers(profile.instagramFollowers || 0);
      setFbHandle(profile.facebookHandle || "");
      setFbFollowers(profile.facebookFollowers || 0);
      setLiHandle(profile.linkedinHandle || "");
      setLiFollowers(profile.linkedinFollowers || 0);
      setYtHandle(profile.youtubeHandle || "");
      setYtFollowers(profile.youtubeFollowers || 0);
      setQuoraHandle(profile.quoraHandle || "");
      setQuoraFollowers(profile.quoraFollowers || 0);
      setTwHandle(profile.twitterHandle || "");
      setTwFollowers(profile.twitterFollowers || 0);
    }
  }, [profile]);

  useEffect(() => {
    if (pricingTiers && pricingTiers.length) {
      setTiers(
        pricingTiers.map((t) => ({
          id: t._id,
          name: t.name,
          price: t.price,
          sortOrder: t.sortOrder,
        })),
      );
    } else if (pricingTiers && pricingTiers.length === 0) {
      setTiers([
        { name: "Story", price: 0, sortOrder: 0 },
        { name: "Post", price: 0, sortOrder: 1 },
        { name: "Reel", price: 0, sortOrder: 2 },
      ]);
    }
  }, [pricingTiers]);

  const getMissingProfileDetails = () => {
    const missing = [];
    if (!fullName.trim()) missing.push("name");
    if (!phone.trim()) missing.push("phone number");
    if (!handle.trim()) missing.push("social handle / username");
    if (!bio.trim()) missing.push("bio");
    return missing;
  };

  const saveProfileDetails = async () => {
    if (!profile || !hasValidMongoProfileId) return;

    const missing = getMissingProfileDetails();
    if (!category.trim()) missing.push("category");
    if (!location.trim()) missing.push("location");
    if (!Number(startingPrice)) missing.push("starting price");
    if (missing.length) {
      toast.error(`Please complete your ${missing.join(", ")}.`);
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile({
        id: mongoProfileId,
        fullName: fullName.trim(),
        handle: `@${handle.trim().replace(/^@+/, "")}`,
        phone: phone.trim(),
        bio: bio.trim(),
        category: category,
        location: location,
        startingPrice: startingPrice,
      });
      const updated = res?.data || res?.profile || res;
      if (updated && updateLocalProfile) {
        updateLocalProfile(updated);
      }
      toast.success("Profile details saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to save profile details");
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;

    const missing = getMissingProfileDetails();
    if (missing.length) {
      toast.error(`Please complete your ${missing.join(", ")}.`);
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile({
        id: mongoProfileId,
        fullName: fullName,
        handle: handle ? `@${handle.replace("@", "")}` : "",
        phone: phone,
        category: category,
        location: location,
        bio: bio,
        startingPrice,
      });
      const updated = res?.data || res?.profile || res;
      if (updated && updateLocalProfile) {
        updateLocalProfile(updated);
      }
      toast.success("Profile saved successfully!");
      if (!profile?.verificationStatus || profile.verificationStatus === "unverified" || profile.verificationStatus === "rejected") {
        setShowPostSaveDialog(true);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const saveSocialPresence = async () => {
    if (!profile) return;
    try {
      const res = await updateProfile({
        id: mongoProfileId,
        instagramHandle: instaHandle,
        instagramFollowers: instaFollowers,
        facebookHandle: fbHandle,
        facebookFollowers: fbFollowers,
        linkedinHandle: liHandle,
        linkedinFollowers: liFollowers,
        youtubeHandle: ytHandle,
        youtubeFollowers: ytFollowers,
        quoraHandle: quoraHandle,
        quoraFollowers: quoraFollowers,
        twitterHandle: twHandle,
        twitterFollowers: twFollowers,
      });
      const updated = res?.data || res?.profile || res;
      if (updated && updateLocalProfile) {
        updateLocalProfile(updated);
      }
      toast.success("Social presence saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to save social presence");
    }
  };


  const savePricing = async () => {
    if (!profile) return;
    try {
      await upsertPricing({
        profileId: mongoProfileId,
        tiers: tiers.map((t, idx) => ({
          id: t.id,
          name: t.name,
          price: t.price,
          sortOrder: idx,
        })),
      });
      toast.success("Pricing updated");
    } catch (err) {
      const e = err ;
      toast.error(e.message);
    }
  };

  const removeTier = async (idx) => {
    const t = tiers[idx];
    if (t.id) {
      try {
        await removeTierMutation({ id: t.id });
      } catch (err) {
        const e = err ;
        toast.error(e.message);
        return;
      }
    }
    setTiers(tiers.filter((_, i) => i !== idx));
  };

  const onUpload = async (e) => {
    if (!profile || !e.target.files?.length) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      await addPortfolioImage({
        profileId: mongoProfileId,
        imageFile: file,
        sortOrder: portfolioImages?.length || 0,
      });

      setPortfolioRefreshKey((current) => current + 1);
      toast.success("Image uploaded");
    } catch (err) {
      const e = err ;
      toast.error(e.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onAvatarUpload = async (e) => {
    if (!profile || !e.target.files?.length) return;
    const file = e.target.files[0];
    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await apiPost(`/profiles/${mongoProfileId}/avatar`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedProfile = res?.data || res?.profile || res;
      if (updatedProfile && updateLocalProfile) {
        updateLocalProfile(updatedProfile);
      }
      toast.success("Profile photo updated successfully!");
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to update profile photo");
    } finally {
      setUploadingAvatar(false);
      if (avatarFileRef.current) avatarFileRef.current.value = "";
    }
  };

  const onCoverUpload = async (e) => {
    if (!profile || !e.target.files?.length) return;
    const file = e.target.files[0];

    const isImageValid = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(true); // removed size restriction to allow auto compression/fixing
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });

    if (!isImageValid) {
      toast.error("Invalid image file.");
      if (coverFileRef.current) coverFileRef.current.value = "";
      return;
    }

    setUploadingCover(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await apiPost(`/profiles/${mongoProfileId}/cover`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedProfile = res?.data || res?.profile || res;
      if (updatedProfile && updateLocalProfile) {
        updateLocalProfile(updatedProfile);
      }
      toast.success("Banner updated successfully!");
    } catch (err) {
      console.error("Cover upload error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to update cover banner");
    } finally {
      setUploadingCover(false);
      if (coverFileRef.current) coverFileRef.current.value = "";
    }
  };

  const onAadharUpload = (e) => {
    if (!profile || !e.target.files?.length) return;
    const file = e.target.files[0];
    setAadharFile(file);
    setAadharFileName(file.name);
    setAadharStorageId("selected");
    toast.success(`Aadhar Card selected: ${file.name}`);
  };

  const onPanUpload = (e) => {
    if (!profile || !e.target.files?.length) return;
    const file = e.target.files[0];
    setPanFile(file);
    setPanFileName(file.name);
    setPanStorageId("selected");
    toast.success(`PAN Card selected: ${file.name}`);
  };

  const handleVerificationSubmit = async () => {
    if (!profile || (!aadharFile && !panFile)) {
      toast.error("Please upload at least Aadhar or PAN card.");
      return;
    }
    setSubmittingVerification(true);
    try {
      const form = new FormData();
      if (aadharFile) form.append("aadhar", aadharFile);
      if (panFile) form.append("pan", panFile);

      const res = await apiPost(`/profiles/${mongoProfileId}/kyc-documents`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedProfile = res?.data || res?.profile || res;
      if (updatedProfile && updateLocalProfile) {
        updateLocalProfile(updatedProfile);
      }
      toast.success("Documents saved successfully.");
      setAadharFile(null);
      setAadharStorageId("");
      setPanFile(null);
      setPanStorageId("");
    } catch (err) {
      console.error("KYC submit error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to save documents");
    } finally {
      setSubmittingVerification(false);
    }
  };

  const submitVerificationRequest = async () => {
    if (!profile || !hasValidMongoProfileId) return;

    const missing = getMissingProfileDetails();
    if (missing.length) {
      toast.error(`Please save your ${missing.join(", ")} before requesting verification.`);
      return;
    }

    const hasVerificationDocument = Boolean(
      profile.aadharUrl || profile.aadharStorageId || profile.panUrl || profile.panStorageId,
    );
    if (!hasVerificationDocument) {
      toast.error("Please save an Aadhaar or PAN document before requesting verification.");
      return;
    }

    try {
      const res = await submitVerification({ profileId: mongoProfileId });
      const updatedProfile = res?.data || res?.profile || res;
      if (updatedProfile && updateLocalProfile) {
        updateLocalProfile(updatedProfile);
      }
      toast.success("Verification request submitted successfully!");
    } catch (err) {
      console.error("Verification submit error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to submit verification request");
    }
  };


  const removeImage = async (id) => {
    try {
      await removePortfolioImage({ id });
      setPortfolioRefreshKey((current) => current + 1);
      toast.success("Image removed");
    } catch (err) {
      const e = err ;
      toast.error(e.message);
    }
  };

  const handleToggleVisibility = async (reviewId) => {
    if (!profile) return;
    try {
      const res = await toggleVisibility({
        reviewId,
        creatorId: mongoProfileId,
      });
      if (res.visible) {
        toast.success("Review is now visible on your public profile");
      } else {
        toast.info("Review is now hidden from your public profile");
      }
    } catch (err) {
      const e = err ;
      toast.error(e.message || "Failed to update review visibility");
    }
  };

  const displayName =
    fullName?.split(" ")[0] ||
    profile?.fullName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";
  const defaultBannerIndex = [...(profile?._id || profile?.userId || "creator")]
    .reduce((total, character) => total + character.charCodeAt(0), 0) % DEFAULT_BANNER_IMAGES.length;
  const bannerUrl = resolveImageUrl(profile?.coverUrl) || DEFAULT_BANNER_IMAGES[defaultBannerIndex];
  const status = profile?.verificationStatus || user?.verificationStatus || "unverified";
  console.log("PROFILE FROM API:", profile);
  console.log("Verification Status:", status);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Sticky Top Promo Banner */}
      {activeOffer && !dismissedBanner && (
        <div className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white py-2 px-4 shadow-md sticky top-[64px] z-40">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[9px] uppercase font-bold animate-pulse">Limited Deal</span>
              <span>🔥 Upgrade Account: Get special discounts on premium packages!</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="link"
                className="text-white hover:text-white/80 p-0 h-auto font-bold underline text-xs"
                onClick={() => {
                  setActiveTab("subscription");
                  trackAnalytics({ offerId: activeOffer._id, type: "click" });
                }}
              >
                Upgrade Now
              </Button>
              <button
                className="hover:opacity-80 p-1"
                onClick={() => setDismissedBanner(true)}
                aria-label="Dismiss banner"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Push Notification Permission Banner */}
      {showPushBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-2.5 px-4 shadow-md sticky top-[64px] z-40">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">🔔 NEW</span>
              <span>Turn on notifications to get instant alerts whenever brands launch new campaigns!</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                disabled={enablingPush}
                className="bg-white text-blue-700 hover:bg-slate-100 font-bold text-xs h-7 px-3 rounded-full"
                onClick={handleEnablePush}
              >
                {enablingPush ? "Enabling..." : "Enable Notifications"}
              </Button>
              <button
                className="hover:opacity-80 p-1"
                onClick={() => setShowPushBanner(false)}
                aria-label="Dismiss banner"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COVER BANNER PREVIEW */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="relative aspect-[1361/450] overflow-hidden bg-muted w-full rounded-b-2xl sm:rounded-b-3xl rounded-t-none shadow-sm border border-border/50">
          <img
            src={bannerUrl}
            alt="Creator profile banner"
            className="h-full w-full object-cover"
          />
        </section>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
  <div className="flex flex-col gap-2">
    <p className="text-sm text-muted-foreground">
      Creator dashboard
    </p>

    <h1 className="font-display text-3xl font-bold sm:text-4xl flex items-center gap-2">
      Hello, {displayName} 
      {status === "verified" && (
        <ShieldCheck className="h-8 w-8 text-blue-500 inline-block" fill="currentColor" stroke="white" title="Verified Creator" />
      )}
      👋
    </h1>
  </div>

  {(() => {
    if (status === "verified") {
      return (
        <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20 font-semibold text-sm cursor-default">
          <ShieldCheck className="h-4 w-4" /> Verified Creator
        </div>
      );
    }
    if (status === "pending") {
      return (
        <Button disabled className="rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 px-6 font-semibold opacity-70 cursor-not-allowed">
          Verification Pending
        </Button>
      );
    }
    if (status === "rejected") {
      return (
        <Button
          onClick={submitVerificationRequest}
          className="rounded-full bg-red-600 hover:bg-red-700 text-white px-6 font-semibold shadow-sm"
        >
          Verification Failed (Try Again)
        </Button>
      );
    }
    // Default: unverified
    return (
      <Button
        onClick={submitVerificationRequest}
        className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 font-semibold shadow-sm"
      >
        Get Verified
      </Button>
    );
  })()}

  <Dialog open={showPostSaveDialog} onOpenChange={setShowPostSaveDialog}>
    <DialogContent className="sm:max-w-md rounded-3xl">
      <DialogHeader>
        <DialogTitle className="font-display text-xl font-bold">Request Verification?</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Your profile changes have been saved successfully. Would you like to submit a request for verification now?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex sm:justify-end gap-2 mt-4">
        <Button
          variant="outline"
          onClick={() => {
            setShowPostSaveDialog(false);
          }}
          className="rounded-full"
        >
          Cancel
        </Button>
        <Button
          onClick={async () => {
            setShowPostSaveDialog(false);
            await submitVerificationRequest();
          }}
          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-glow px-5"
        >
          Get Verified
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>

        <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-3 font-jakarta">
          {[
            {
              icon: Eye,
              label: "Profile views",
              value: profile?.profileViews?.toLocaleString() || "0",
            },
            {
              icon: MousePointerClick,
              label: "Clicks",
              value: profile?.clicks?.toLocaleString() || "0",
            },
            {
              icon: TrendingUp,
              label: "Bookings",
              value: profile?.bookings?.toLocaleString() || "0",
            },
          ].map(
              (s, idx) => (
              <div
                key={s.label}
                className={cn(
                  "stat-card-3d rounded-3xl border border-border/60 bg-gradient-to-b from-card to-card/70 p-6 shadow-soft transition-all",
                  idx === 2 && "col-span-2 md:col-span-1",
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                    <s.icon className="h-5 w-5" />
                  </div>
                  {s.delta && (
                    <Badge
                      variant="secondary"
                      className="rounded-full text-xs text-emerald-600 font-bold"
                    >
                      {s.delta}
                    </Badge>
                  )}
                </div>
                <div className="mt-4 font-outfit text-3xl font-black text-foreground">
                  {s.value}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
              </div>
            ),
          )}
        </div>

        {/* TAB NAVIGATION PILLS */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`btn-bouncy flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-200 ${
                activeTab === "dashboard"
                  ? "gradient-sunset text-white shadow-glow"
                  : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/40"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("wallet")}
              className={`btn-bouncy flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-200 ${
                activeTab === "wallet"
                  ? "gradient-sunset text-white shadow-glow"
                  : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/40"
              }`}
            >
              <Wallet className="h-4 w-4" />
              Wallet & Earnings
            </button>
            <button
              onClick={() => setActiveTab("subscription")}
              className={`btn-bouncy flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-200 ${
                activeTab === "subscription"
                  ? "gradient-sunset text-white shadow-glow"
                  : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/40"
              }`}
            >
              <Star className="h-4 w-4" />
              ⭐ Packages
            </button>
          </div>

          {/* Sub-Section Quick Navigator to prevent long scrolling */}
          {activeTab === "dashboard" && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 rounded-2xl bg-secondary/30 border border-border/40 no-scrollbar">
              <span className="text-[10px] font-bold text-muted-foreground/80 px-2.5 uppercase tracking-wider hidden sm:inline">
                Jump to:
              </span>
              {[
                { id: "all", label: "✨ All" },
                { id: "profile", label: "🎨 Profile & Portfolio" },
                { id: "collaborations", label: "🤝 Deals & Tasks" },
                { id: "discover", label: "🔍 Find Campaigns" },
                { id: "payments", label: "💰 Escrow & Bank" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCreatorSubSection(tab.id)}
                  className={cn(
                    "pill-cute px-3 py-1.5 text-xs font-semibold whitespace-nowrap",
                    creatorSubSection === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 font-jakarta">
          <div className="w-full">
            {activeTab === "dashboard" ? (
              <>
                <div className="grid gap-6 lg:grid-cols-3 items-start">
          {(creatorSubSection === "all" || creatorSubSection === "profile") && (
          <div className="card-3d rounded-3xl border border-border/60 bg-card p-6 lg:col-span-2 shadow-sm">
            <h2 className="font-outfit text-xl font-bold">Edit Profile</h2>
            <div className="mt-5">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img src={
                    resolveImageUrl(profile?.avatarUrl) ||
                    profile?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      profile?.fullName || user?.email || "User"
                    )}&background=random`
                  }
                  alt=""
                  className="h-20 w-20 rounded-full border border-border object-cover bg-muted"
                 onError={(e) => { e.target.onerror = null; e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback"; }} />
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary">
                    <Camera className="h-4 w-4" />
                    {uploadingAvatar ? "Uploading..." : "Upload profile photo"}
                    <input
                      ref={avatarFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary">
                    <ImageIcon className="h-4 w-4" />
                    {uploadingCover ? "Uploading..." : "Upload banner"}
                    <input
                      ref={coverFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onCoverUpload}
                      disabled={uploadingCover}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Display name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Handle</Label>
                <Input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@yourname"
                  className="mt-1.5"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex min-h-[2.5rem] w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-left mt-1.5 cursor-pointer"
                    >
                      <div className="flex flex-wrap gap-1">
                        {selectedCategories.length === 0 ? (
                          <span className="text-muted-foreground">
                            Select categories...
                          </span>
                        ) : (
                          selectedCategories.map((cat) => (
                            <Badge
                              key={cat}
                              variant="secondary"
                              className="rounded-sm px-1.5 py-0.5 font-normal text-xs flex items-center gap-1"
                            >
                              {cat}
                              <span
                                role="button"
                                tabIndex={0}
                                className="rounded-full outline-none hover:bg-muted p-0.5 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectCategory(cat);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.stopPropagation();
                                    handleSelectCategory(cat);
                                  }
                                }}
                              >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                              </span>
                            </Badge>
                          ))
                        )}
                      </div>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                  >
                    <Command className="w-full">
                      <CommandInput
                        placeholder="Search categories..."
                        className="h-9"
                      />
                      <CommandList className="max-h-[300px] overflow-y-auto">
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                          {CATEGORY_OPTIONS.map((cat) => {
                            const isSelected = selectedCategories.includes(cat);
                            return (
                              <CommandItem
                                key={cat}
                                value={cat}
                                onSelect={() => handleSelectCategory(cat)}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                      isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50 [&_svg]:invisible",
                                    )}
                                  >
                                    <Check className="h-3 w-3" />
                                  </div>
                                  <span>{cat}</span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Location</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex min-h-[2.5rem] w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-left mt-1.5 cursor-pointer"
                    >
                      <div className="flex flex-wrap gap-1">
                        {selectedLocations.length === 0 ? (
                          <span className="text-muted-foreground">
                            Select locations...
                          </span>
                        ) : (
                          selectedLocations.map((loc) => (
                            <Badge
                              key={loc}
                              variant="secondary"
                              className="rounded-sm px-1.5 py-0.5 font-normal text-xs flex items-center gap-1"
                            >
                              {loc}
                              <span
                                role="button"
                                tabIndex={0}
                                className="rounded-full outline-none hover:bg-muted p-0.5 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectLocation(loc);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.stopPropagation();
                                    handleSelectLocation(loc);
                                  }
                                }}
                              >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                              </span>
                            </Badge>
                          ))
                        )}
                      </div>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                  >
                    <Command className="w-full">
                      <CommandInput
                        placeholder="Search locations..."
                        className="h-9"
                      />
                      <CommandList className="max-h-[300px] overflow-y-auto">
                        <CommandEmpty>No location found.</CommandEmpty>
                        <CommandGroup>
                          {LOCATION_OPTIONS.map((loc) => {
                            const isSelected = selectedLocations.includes(loc);
                            return (
                              <CommandItem
                                key={loc}
                                value={loc}
                                onSelect={() => handleSelectLocation(loc)}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                      isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50 [&_svg]:invisible",
                                    )}
                                  >
                                    <Check className="h-3 w-3" />
                                  </div>
                                  <span>{loc}</span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Phone number</Label>
                <Input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1.5"
                  placeholder="e.g. +91 9876543210"
                />
              </div>
              <div>
                <Label>Starting price (₹)</Label>
                <Input
                  type="text"
                  value={startingPrice}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setStartingPrice(val === "" ? "" : Number(val));
                  }}
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Bio</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                onClick={saveProfileDetails}
                disabled={saving}
                className="rounded-full gradient-sunset border-0 text-white shadow-glow"
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>

            <h3 className="mt-8 font-display text-base font-semibold">
              KYC Documents
            </h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Upload and save your Aadhaar card, PAN card, or both. At least one document is required for verification.
            </p>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 bg-muted/10 p-4 rounded-2xl border border-border">
              {/* Aadhar Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Aadhar Card (PDF, JPG, PNG)</Label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 hover:bg-secondary/40 px-4 py-4 text-sm font-medium transition-colors">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">
                      {aadharFileName || (profile?.aadharUrl ? "Aadhar Uploaded ✓" : "Upload Aadhar")}
                    </span>
                    <input type="file" className="hidden" accept=".pdf,image/*" onChange={onAadharUpload} />
                  </label>
                  {(profile?.aadharUrl || aadharFile) && (
                    <Button type="button" variant="outline" size="icon" className="shrink-0 h-12 w-12 rounded-xl"
                      onClick={() => profile?.aadharUrl ? window.open(resolveImageUrl(profile.aadharUrl), "_blank") : toast.info("File selected but not yet uploaded")}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* PAN Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">PAN Card (PDF, JPG, PNG)</Label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 hover:bg-secondary/40 px-4 py-4 text-sm font-medium transition-colors">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">
                      {panFileName || (profile?.panUrl ? "PAN Uploaded ✓" : "Upload PAN")}
                    </span>
                    <input type="file" className="hidden" accept=".pdf,image/*" onChange={onPanUpload} />
                  </label>
                  {(profile?.panUrl || panFile) && (
                    <Button type="button" variant="outline" size="icon" className="shrink-0 h-12 w-12 rounded-xl"
                      onClick={() => profile?.panUrl ? window.open(resolveImageUrl(profile.panUrl), "_blank") : toast.info("File selected but not yet uploaded")}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button onClick={handleVerificationSubmit} disabled={submittingVerification || (!aadharFile && !panFile)} className="rounded-full bg-primary text-primary-foreground px-6 font-semibold">
                  {submittingVerification ? "Uploading..." : "Save Documents"}
                </Button>
              </div>
            </div>

            <h3 className="mt-8 font-display text-base font-semibold">
              Social presence
            </h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Verify your accounts using official OAuth platforms or update them manually.
            </p>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  id: "instagram",
                  name: "Instagram",
                  icon: FaInstagram,
                  iconClass: "text-pink-600",
                  handle: instaHandle,
                  setHandle: setInstaHandle,
                  followers: instaFollowers,
                  setFollowers: setInstaFollowers,
                  oauth: true,
                },
                {
                  id: "facebook",
                  name: "Facebook",
                  icon: FaFacebook,
                  iconClass: "text-blue-600",
                  handle: fbHandle,
                  setHandle: setFbHandle,
                  followers: fbFollowers,
                  setFollowers: setFbFollowers,
                  oauth: true,
                },
                {
                  id: "linkedin",
                  name: "LinkedIn",
                  icon: FaLinkedin,
                  iconClass: "text-blue-800",
                  handle: liHandle,
                  setHandle: setLiHandle,
                  followers: liFollowers,
                  setFollowers: setLiFollowers,
                  oauth: true,
                },
                {
                  id: "youtube",
                  name: "YouTube",
                  icon: FaYoutube,
                  iconClass: "text-red-600",
                  handle: ytHandle,
                  setHandle: setYtHandle,
                  followers: ytFollowers,
                  setFollowers: setYtFollowers,
                  oauth: true,
                },
                {
                  id: "quora",
                  name: "Quora",
                  icon: QuoraIcon,
                  iconClass: "text-red-700",
                  handle: quoraHandle,
                  setHandle: setQuoraHandle,
                  followers: quoraFollowers,
                  setFollowers: setQuoraFollowers,
                  oauth: false,
                },
                {
                  id: "twitter",
                  name: "X (Twitter)",
                  icon: FaTwitter,
                  iconClass: "text-sky-500",
                  handle: twHandle,
                  setHandle: setTwHandle,
                  followers: twFollowers,
                  setFollowers: setTwFollowers,
                  oauth: true,
                },
              ].map((plat) => {
                const conn = connections?.find((c) => c.platform === plat.id);
                const isVerified = conn?.verified;
                const Icon = plat.icon;

                return (
                  <div
                    key={plat.id}
                    className={cn(
                      "space-y-3 rounded-2xl border p-3 sm:p-4 bg-muted/20 relative transition-all duration-200",
                      isVerified ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                          <a
                            href={
                              plat.handle 
                                ? (plat.id === "linkedin" ? `https://linkedin.com/${plat.handle}` : plat.id === "quora" ? `https://quora.com/profile/${plat.handle}` : `https://${plat.id}.com/${plat.handle.replace('@', '')}`)
                                : `https://${plat.id}.com`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                          >
                            <Icon className={cn("h-4 w-4 shrink-0", plat.iconClass)} />
                          </a>
                        <span className="text-sm font-semibold truncate">
                          {plat.name}
                        </span>
                        {isVerified && (
                          <span title="OAuth Verified">
                            <ShieldCheck className="h-4 w-4 text-primary fill-primary/10 shrink-0" />
                          </span>
                        )}
                      </div>
                      {plat.oauth && (
                        <div className="flex items-center gap-1.5">
                          {isVerified && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleManualSync(conn._id, plat.id)}
                                disabled={syncingPlatform !== null}
                                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary cursor-pointer"
                                title="Force sync now"
                              >
                                <RotateCw className={cn("h-3.5 w-3.5", syncingPlatform === plat.id && "animate-spin")} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDisconnect(conn._id, plat.id)}
                                className="text-xs text-destructive hover:underline font-medium cursor-pointer"
                              >
                                Disconnect
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {isVerified ? (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs border-b border-border/40 pb-1.5">
                          <span className="text-muted-foreground">Handle:</span>
                          <span className="font-semibold text-foreground truncate max-w-[120px]">
                            {conn.handle}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs border-b border-border/40 pb-1.5">
                          <span className="text-muted-foreground">Followers:</span>
                          <span className="font-semibold text-foreground flex items-center gap-1">
                            <Lock className="h-3 w-3 text-muted-foreground/60" />
                            {conn.followers?.toLocaleString() || "0"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Sync Status:</span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                conn.syncStatus === "success" && "bg-emerald-500",
                                conn.syncStatus === "syncing" && "bg-amber-500 animate-pulse",
                                conn.syncStatus === "failed" && "bg-destructive"
                              )}
                            />
                            <span className="text-[10px] capitalize text-muted-foreground">
                              {conn.syncStatus}
                            </span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Handle
                          </Label>
                          <Input
                            size={1}
                            value={plat.handle}
                            onChange={(e) => plat.setHandle(e.target.value)}
                            placeholder={plat.id === "linkedin" ? "in/username" : plat.id === "quora" ? "username" : "@username"}
                            className="h-8 text-xs mt-0.5"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Followers
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            value={plat.followers}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") {
                                plat.setFollowers("");
                              } else {
                                const num = Number(val);
                                if (num >= 0) plat.setFollowers(num);
                              }
                            }}
                            className="h-8 text-xs mt-0.5"
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => saveSocialPresence()}
                disabled={saving}
                size="sm"
                className="rounded-full gradient-sunset border-0 text-white shadow-glow"
              >
                {saving ? "Saving…" : "Save Social Presence"}
              </Button>
            </div>

            {/* Growth trends charts if verified accounts exist */}
            {connections && connections.some((c) => c.verified) && (
              <div className="mt-6 border border-border rounded-2xl p-4 bg-muted/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-primary" /> Verified Analytics Trends
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      Growth analytics fetched from official platform endpoints.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">Platform:</span>
                    <select
                      value={selectedChartPlatform}
                      onChange={(e) => setSelectedChartPlatform(e.target.value)}
                      className="rounded-full border border-border bg-background px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      {connections
                        .filter((c) => c.verified)
                        .map((c) => (
                          <option key={c._id} value={c.platform}>
                            {c.platform.toUpperCase()}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {chartData.length > 0 ? (
                  <div className="h-48 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
                        <YAxis stroke="#94a3b8" fontSize={9} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="followers"
                          stroke="#f43f5e"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorFollowers)"
                          name="Followers"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                    No historical sync metrics logged for this account yet. Sync runs automatically every 12 hours.
                  </div>
                )}
              </div>
            )}

            <h3 className="mt-8 font-outfit text-lg font-bold">
              Portfolio
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {portfolioImages?.map((img) => (
                <div
                  key={img._id}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-border/70 hover:shadow-md transition-all"
                >
                  {img.url && (
                    <img
                      src={resolveImageUrl(img.url)}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                    />
                  )}
                  <button
                    onClick={() => removeImage(img._id)}
                    className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 opacity-0 shadow-soft transition-opacity group-hover:opacity-100 hover:scale-110"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
              ))}
              <label className="btn-bouncy flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border/80 text-xs font-semibold text-muted-foreground hover:bg-secondary/70 hover:border-primary/50 transition-all">
                <Upload className="h-5 w-5 text-primary" />
                {uploading ? "Uploading…" : "Upload"}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={saveProfile}
                disabled={saving}
                className="btn-bouncy rounded-full gradient-sunset border-0 text-white shadow-glow px-7 font-bold text-xs h-10"
              >
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>

            {/* LIMITED-TIME OFFERS LAUNCH & MANAGEMENT */}
            <div className="mt-8">
              <CreatorOfferForm profileId={profile?._id} role="creator" />
            </div>

            {/* PRICING */}
            <div className="mt-8 rounded-3xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Pricing</h2>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() =>
                    setTiers([
                      ...tiers,
                      { name: "New tier", price: 0, sortOrder: tiers.length },
                    ])
                  }
                >
                  <Plus className="mr-1 h-3 w-3" /> Add
                </Button>
              </div>
              <div className="mt-5 space-y-3">
                {tiers.map((t, idx) => (
                  <div key={idx} className="rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        value={t.name}
                        onChange={(e) => {
                          const next = [...tiers];
                          next[idx] = { ...t, name: e.target.value };
                          setTiers(next);
                        }}
                        className="h-8 max-w-[60%] font-display font-semibold"
                      />
                      <span className="font-display font-bold">
                        {formatINR(t.price)}
                      </span>
                      <button
                        onClick={() => removeTier(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <Input
                      type="number"
                      value={t.price}
                      onChange={(e) => {
                        const next = [...tiers];
                        next[idx] = { ...t, price: Number(e.target.value) };
                        setTiers(next);
                      }}
                      className="mt-3"
                    />
                  </div>
                ))}
              </div>
              <Button
                onClick={savePricing}
                variant="secondary"
                className="btn-bouncy mt-5 w-full rounded-full font-bold text-xs h-9"
              >
                Update pricing
              </Button>
            </div>
          </div>
          )}

          {(creatorSubSection === "all" || creatorSubSection === "collaborations") && (
          <div className="space-y-6 lg:col-span-1">
            {/* ASSIGNED TASKS */}
            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Assigned Tasks</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your active campaign deliverables.
              </p>
              <div className="mt-5 space-y-4">
                {!myTasks ? (
                  <p className="text-xs text-muted-foreground">Loading tasks...</p>
                ) : myTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tasks assigned yet.</p>
                ) : (
                  myTasks.map((task) => (
                    <div
                      key={task._id}
                      className="rounded-2xl border border-border p-4 space-y-3 bg-secondary/10 hover:bg-secondary/20 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {task.title}
                          </h4>
                          <p className="text-[10px] text-muted-foreground truncate">
                            Campaign: {task.campaign?.title || "General"}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            Brand: {task.brand?.fullName}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "rounded-full text-[9px] uppercase px-1.5 py-0.5 font-semibold shrink-0",
                            task.status === "approved" && "bg-emerald-500/10 text-emerald-600",
                            task.status === "completed" && "bg-blue-500/10 text-blue-500",
                            task.status === "in_progress" && "bg-primary/10 text-primary",
                            task.status === "revision_requested" && "bg-red-500/10 text-red-500",
                            task.status === "assigned" && "bg-amber/10 text-amber"
                          )}
                        >
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="text-xs space-y-1 bg-background/50 border border-border/40 rounded-xl p-2.5">
                        <p className="text-muted-foreground">
                          <strong>Deliverables:</strong> {task.deliverables}
                        </p>
                        <p className="text-muted-foreground">
                          <strong>Due:</strong> {new Date(task.dueDate).toLocaleString()}
                        </p>
                        <p className="text-muted-foreground capitalize">
                          <strong>Priority:</strong> {task.priority}
                        </p>
                      </div>

                      {/* Live Countdown for In Progress / Revision Requested */}
                      {(task.status === "in_progress" || task.status === "revision_requested") && (
                        <div className="flex items-center justify-between text-xs border-t border-border/40 pt-2.5">
                          <span className="text-muted-foreground">Time Left:</span>
                          <CountdownTimer dueDate={task.dueDate} />
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        {task.status === "assigned" ? (
                          <Button
                            size="sm"
                            className="flex-1 rounded-full gradient-sunset border-0 text-white text-[11px] font-semibold h-8"
                            onClick={async () => {
                              try {
                                await startTask({ taskId: task._id });
                                toast.success("Task started! Countdown active.");
                              } catch (e) {
                                toast.error((e).message);
                              }
                            }}
                          >
                            Start Task
                          </Button>
                        ) : (task.status === "in_progress" || task.status === "revision_requested") ? (
                          <Button
                            size="sm"
                            className="flex-1 rounded-full gradient-sunset border-0 text-white text-[11px] font-semibold h-8"
                            onClick={() => {
                              setSubmitTargetTask(task);
                              setSubmissionLink("");
                              setSubmissionNotes("");
                              setSubmissionAttachment("");
                            }}
                          >
                            Submit Task
                          </Button>
                        ) : null}

                        <Link
                          to={`/messages?conversationId=${task.conversationId}`}
                          className="flex-1"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full rounded-full border-border hover:bg-secondary text-[11px] font-semibold h-8"
                          >
                            Open Chat
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* MY REQUESTS */}
            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">My Requests</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Track your active collaboration requests.
              </p>
              <div className="mt-5 space-y-3">
                {!myRequests ? (
                  <p className="text-xs text-muted-foreground">Loading requests...</p>
                ) : myRequests.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No connection requests sent yet.</p>
                ) : (
                  myRequests.map((req) => (
                    <div
                      key={req._id}
                      className="rounded-2xl border border-border p-3 space-y-2 bg-secondary/10 hover:bg-secondary/20 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {req.campaign?.title || "General Connection"}
                          </h4>
                          <p className="text-[10px] text-muted-foreground truncate">
                            Brand: {req.brandProfile?.fullName || "Unknown"}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "rounded-full text-[9px] uppercase px-1.5 py-0.5 font-semibold",
                            req.status === "accepted" && "bg-emerald-500/10 text-emerald-600",
                            req.status === "pending" && "bg-amber/10 text-amber",
                            req.status === "rejected" && "bg-red-500/10 text-red-500"
                          )}
                        >
                          {req.status}
                        </Badge>
                      </div>

                      {req.status === "accepted" && (
                        <div className="rounded-xl border border-border/50 bg-background/50 p-2.5 text-[11px] space-y-2">
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span>Payment Status:</span>
                            {req.paymentStatus === "PAID" ? (
                              <span className="font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px]">
                                ✓ Paid to Pravixo (Secured)
                              </span>
                            ) : req.collaborationStatus === "AMOUNT_AGREED" ? (
                              <span className="font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px]">
                                Awaiting Brand Payment
                              </span>
                            ) : (
                              <span className="font-semibold text-muted-foreground">
                                Negotiating
                              </span>
                            )}
                          </div>
                          {req.collaborationStatus === "AMOUNT_AGREED" && (
                            <div className="flex items-center justify-between pt-1 border-t border-border/30 text-muted-foreground">
                              <span>Agreed Payout:</span>
                              <span className="font-bold text-foreground">₹{req.creatorAmount?.toLocaleString()}</span>
                            </div>
                          )}

                          {/* Task 5: Campaign Deliverables Tracking */}
                          {req.deliverablesTracking && req.deliverablesTracking.length > 0 && (
                            <div className="pt-2 border-t border-border/40 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[10px] text-foreground uppercase tracking-wider">
                                  Campaign Deliverables
                                </span>
                                {req.paymentStatus === "PAID" ? (
                                  (() => {
                                    const totalReq = req.deliverablesTracking.reduce((acc, d) => acc + (d.requiredQuantity || 0), 0);
                                    const totalComp = req.deliverablesTracking.reduce((acc, d) => acc + (d.completedQuantity || 0), 0);
                                    const pct = totalReq > 0 ? Math.round((totalComp / totalReq) * 100) : 0;
                                    return (
                                      <span className="text-[10px] font-bold text-primary">
                                        {totalComp}/{totalReq} ({pct}%)
                                      </span>
                                    );
                                  })()
                                ) : (
                                  <span className="text-[9px] text-muted-foreground italic">
                                    Activates upon payment
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-1.5">
                                {req.deliverablesTracking.map((deliv, dIdx) => {
                                  const typeLabels = {
                                    REEL: "Reels",
                                    POST: "Posts",
                                    STORY: "Stories",
                                    VIDEO: "Videos",
                                  };
                                  const isDelivCompleted = (deliv.completedQuantity || 0) >= (deliv.requiredQuantity || 1);
                                  return (
                                    <div
                                      key={dIdx}
                                      className={cn(
                                        "flex items-center justify-between rounded-lg px-2 py-1 text-[10px] border",
                                        isDelivCompleted
                                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700"
                                          : req.paymentStatus === "PAID"
                                          ? "bg-secondary/40 border-border/60 text-foreground"
                                          : "bg-muted/20 border-border/30 opacity-70 text-muted-foreground"
                                      )}
                                    >
                                      <span className="font-medium">
                                        {typeLabels[deliv.type] || deliv.type}
                                      </span>
                                      <span className="font-bold flex items-center gap-1">
                                        {deliv.completedQuantity || 0} / {deliv.requiredQuantity}
                                        {isDelivCompleted && <Check className="h-3 w-3 text-emerald-600" />}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Task 6, 7, 8, 9: Deliverables Actions & Work Completion Status */}
                              {req.paymentStatus === "PAID" && (
                                <div className="pt-1 flex flex-col gap-1.5">
                                  {(() => {
                                    const allCompleted =
                                      req.allDeliverablesCompleted ||
                                      req.deliverablesTracking.every(
                                        (d) => (d.completedQuantity || 0) >= (d.requiredQuantity || 1)
                                      );

                                    if (allCompleted) {
                                      const isReleased = req.paymentReleaseStatus === "RELEASED";
                                      const nowTime = Date.now();
                                      const targetEligible = req.paymentReleaseEligibleAt || (req.approvalCompletedAt ? req.approvalCompletedAt + 72 * 60 * 60 * 1000 : null);
                                      const isEligible = targetEligible ? nowTime >= targetEligible : false;
                                      const remainingMs = targetEligible ? Math.max(0, targetEligible - nowTime) : 0;
                                      const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
                                      const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

                                      return (
                                        <div className="space-y-1.5">
                                          <div className="text-[10px] text-center font-bold text-emerald-600 bg-emerald-500/15 rounded-xl py-1.5 px-2 border border-emerald-500/30 flex items-center justify-center gap-1.5">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Campaign Work: COMPLETED (All Deliverables Approved)
                                          </div>
                                          
                                          {/* Task 10 & 11: 72-Hour Payment Release & Payout Status */}
                                          <div className="rounded-xl border border-border/60 bg-secondary/20 p-2 text-[10px] space-y-1">
                                            <div className="flex items-center justify-between font-bold">
                                              <span className="text-muted-foreground uppercase text-[9px] tracking-wider flex items-center gap-1">
                                                <Landmark className="h-3 w-3 text-primary" /> Payout Status
                                              </span>
                                              {isReleased ? (
                                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                                  ✓ Payout Released
                                                </span>
                                              ) : isEligible ? (
                                                <span className="text-emerald-600 font-bold">
                                                  ✓ Review Completed · Eligible for Release
                                                </span>
                                              ) : (
                                                <span className="text-amber-600 font-bold">
                                                  ⏳ Under Review ({remainingHours}h {remainingMins}m remaining)
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-muted-foreground text-[10px]">
                                              {isReleased ? (
                                                <span className="text-emerald-700 font-semibold block">
                                                  Payment of <strong>₹{req.creatorAmount?.toLocaleString()}</strong> was successfully released to your account.
                                                </span>
                                              ) : isEligible ? (
                                                <span className="text-foreground">
                                                  Payment of <strong>₹{req.creatorAmount?.toLocaleString()}</strong> is eligible for Admin release.
                                                </span>
                                              ) : targetEligible ? (
                                                <span>
                                                  Payment release available after: <strong>{new Date(targetEligible).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</strong>
                                                </span>
                                              ) : (
                                                <span>Under 72-hour review period. Funds held securely in escrow.</span>
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    }

                                    const hasPendingDeliverables = req.deliverablesTracking.some(
                                      (d) => (d.completedQuantity || 0) < d.requiredQuantity
                                    );
                                    if (hasPendingDeliverables) {
                                      return (
                                        <Button
                                          size="sm"
                                          className="w-full h-8 rounded-full gradient-sunset border-0 text-white text-[10px] font-bold shadow-glow flex items-center justify-center gap-1 cursor-pointer"
                                          onClick={() => {
                                            setSelectedCollabForSubmission(req);
                                            // Pre-select first deliverable that needs submission
                                            const firstIncomplete = req.deliverablesTracking.find(
                                              (d) => (d.completedQuantity || 0) < d.requiredQuantity
                                            );
                                            setSubmissionDeliverableType(firstIncomplete ? firstIncomplete.type : req.deliverablesTracking[0]?.type || "REEL");
                                            setSubmissionFile(null);
                                            setSubmissionFilePreview(null);
                                            setSubmissionCaption("");
                                          }}
                                        >
                                          <Upload className="h-3.5 w-3.5" /> Submit Work
                                        </Button>
                                      );
                                    } else {
                                      return (
                                        <div className="text-[10px] text-center font-bold text-amber-600 bg-amber-500/10 rounded-full py-1 border border-amber-500/20">
                                          ⏳ Submissions Awaiting Brand Review
                                        </div>
                                      );
                                    }
                                  })()}

                                  {/* View Submissions & Review History Button for Creator */}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full h-7 rounded-full border-border hover:bg-secondary text-foreground text-[10px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                                    onClick={async () => {
                                      setSelectedCollabForHistory(req);
                                      setLoadingCreatorSubmissions(true);
                                      try {
                                        const res = await api.get(`/api/submissions/${req._id}/submissions`);
                                        const data = res.data?.data || res.data;
                                        setCreatorSubmissionsList(data.submissions || []);
                                      } catch (err) {
                                        console.error("Fetch creator submissions error:", err);
                                        toast.error(err?.response?.data?.message || "Failed to load submission history.");
                                      } finally {
                                        setLoadingCreatorSubmissions(false);
                                      }
                                    }}
                                  >
                                    <Eye className="h-3 w-3" /> View Submissions & Feedback
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {req.status === "accepted" && req.conversationId ? (
                        <Link
                          to={`/messages?conversationId=${req.conversationId}`}
                          className="block w-full"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-8 rounded-full border-border hover:bg-secondary text-foreground text-[10px] font-semibold cursor-pointer"
                          >
                            Open Chat
                          </Button>
                        </Link>
                      ) : req.status === "pending" ? (
                        <div className="text-[10px] text-center text-amber bg-amber/5 rounded-full py-1 font-semibold border border-amber/10">
                          Waiting for Brand Approval
                        </div>
                      ) : (
                        <div className="text-[10px] text-center text-red-500 bg-red-500/5 rounded-full py-1 font-semibold border border-red-500/10">
                          Request Rejected
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* LIVE BRAND OPPORTUNITIES & INCENTIVES (Visible to creators) */}
            <CreatorOffersSidebarWidget audience="creator" />
          </div>
          )}
        </div>

        {/* CAMPAIGN DISCOVERY SECTION FOR CREATORS */}
        {(creatorSubSection === "all" || creatorSubSection === "discover") && (
        <div className="card-3d mt-8 rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="font-outfit text-xl font-bold flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" /> Discover Campaigns
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Explore brand-funded, verified campaigns open for creators.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full text-xs self-start sm:self-auto"
              onClick={() => setDiscoverRefreshKey((k) => k + 1)}
            >
              Refresh Listings
            </Button>
          </div>

          {!discoverableCampaigns ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Loading available campaigns...
            </div>
          ) : discoverableCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
              <Megaphone className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="font-semibold text-sm text-foreground">
                No active campaigns available right now
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[320px]">
                New verified brand campaigns will appear here once approved by admin. Check back soon!
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {discoverableCampaigns
                  .slice((discoverPage - 1) * CAMPAIGNS_PER_PAGE, discoverPage * CAMPAIGNS_PER_PAGE)
                  .map((camp) => (
                  <div
                    key={camp._id}
                    className="rounded-2xl border border-border bg-background p-4 flex flex-col justify-between hover:border-primary/50 hover:shadow-sm transition-all group"
                  >
                    <div className="space-y-3">
                      {/* Brand Header */}
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            camp.brand?.avatarUrl ||
                            `https://api.dicebear.com/9.x/avataaars/svg?seed=${camp.brand?.fullName || "Brand"}`
                          }
                          alt=""
                          className="h-10 w-10 rounded-xl object-cover border border-border shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback";
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-xs text-foreground truncate block">
                            {camp.brand?.fullName || "Verified Brand"}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            {camp.brand?.rating > 0 && (
                              <span className="flex items-center gap-0.5 text-amber font-semibold">
                                <Star className="h-3 w-3 fill-amber" /> {camp.brand.rating}
                              </span>
                            )}
                            <span>·</span>
                            <span className="truncate">{camp.location || "Pan India"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Campaign Title & Description */}
                      <div>
                        <h4 className="font-display text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {camp.title}
                        </h4>
                        {camp.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {camp.description}
                          </p>
                        )}
                      </div>

                      {/* Budget & Timeline */}
                      <div className="bg-secondary/15 rounded-xl p-2.5 space-y-1 text-xs border border-border/40">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-[11px]">Creator Budget:</span>
                          <span className="font-bold text-foreground">
                            ₹{Number(camp.minBudgetPerCreator || 0).toLocaleString("en-IN")} - ₹{Number(camp.maxBudgetPerCreator || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">Total Budget:</span>
                          <span className="text-muted-foreground font-medium">
                            ₹{Number(camp.totalBudget || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/30">
                          <span className="text-muted-foreground">Timeline:</span>
                          <span className="text-muted-foreground font-medium">
                            {new Date(camp.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })} - {new Date(camp.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>

                      {/* Deliverables tags */}
                      {camp.deliverables && (
                        <div className="flex flex-wrap gap-1">
                          {camp.deliverables.reels > 0 && (
                            <span className="text-[10px] bg-secondary/30 text-foreground px-2 py-0.5 rounded-md font-medium">
                              🎬 {camp.deliverables.reels} Reels
                            </span>
                          )}
                          {camp.deliverables.posts > 0 && (
                            <span className="text-[10px] bg-secondary/30 text-foreground px-2 py-0.5 rounded-md font-medium">
                              📸 {camp.deliverables.posts} Posts
                            </span>
                          )}
                          {camp.deliverables.stories > 0 && (
                            <span className="text-[10px] bg-secondary/30 text-foreground px-2 py-0.5 rounded-md font-medium">
                              📱 {camp.deliverables.stories} Stories
                            </span>
                          )}
                          {camp.deliverables.videos > 0 && (
                            <span className="text-[10px] bg-secondary/30 text-foreground px-2 py-0.5 rounded-md font-medium">
                              🎥 {camp.deliverables.videos} Videos
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs h-8 flex-1"
                        onClick={() => {
                          setSelectedCampaignForDiscovery(camp);
                          setJoinPitch(`Hi ${camp.brand?.fullName || "there"}! I'm excited to collaborate on your "${camp.title}" campaign.`);
                        }}
                      >
                        View Details
                      </Button>

                      {camp.isParticipating ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-full text-[10px] h-8 px-3 font-semibold">
                          Participating
                        </Badge>
                      ) : camp.isRequested ? (
                        <Badge className="bg-amber/10 text-amber border-amber/20 rounded-full text-[10px] h-8 px-3 font-semibold">
                          Request Pending
                        </Badge>
                      ) : camp.requestStatus === "rejected" ? (
                        <Badge className="bg-red-500/10 text-red-500 border-red-500/20 rounded-full text-[10px] h-8 px-3 font-semibold">
                          Declined
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          className="rounded-full gradient-sunset border-0 text-white shadow-glow text-xs h-8 px-4 font-semibold"
                          onClick={() => {
                            setSelectedCampaignForDiscovery(camp);
                            setJoinPitch(`Hi ${camp.brand?.fullName || "there"}! I'm excited to collaborate on your "${camp.title}" campaign.`);
                          }}
                        >
                          Request to Join
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls for smooth & fast responsiveness */}
              {discoverableCampaigns.length > CAMPAIGNS_PER_PAGE && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/50 text-xs">
                  <span className="text-muted-foreground">
                    Showing {(discoverPage - 1) * CAMPAIGNS_PER_PAGE + 1} to{" "}
                    {Math.min(discoverPage * CAMPAIGNS_PER_PAGE, discoverableCampaigns.length)} of{" "}
                    {discoverableCampaigns.length} campaigns
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={discoverPage === 1}
                      onClick={() => setDiscoverPage((p) => Math.max(1, p - 1))}
                      className="rounded-full h-8 px-3 text-xs"
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.ceil(discoverableCampaigns.length / CAMPAIGNS_PER_PAGE) }).map((_, i) => (
                      <Button
                        key={i}
                        size="sm"
                        variant={discoverPage === i + 1 ? "default" : "outline"}
                        className={cn(
                          "rounded-full h-8 w-8 p-0 text-xs",
                          discoverPage === i + 1 && "gradient-sunset text-white border-0"
                        )}
                        onClick={() => setDiscoverPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={discoverPage >= Math.ceil(discoverableCampaigns.length / CAMPAIGNS_PER_PAGE)}
                      onClick={() => setDiscoverPage((p) => p + 1)}
                      className="rounded-full h-8 px-3 text-xs font-bold"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        )}

        {/* Payments Section */}
        {(creatorSubSection === "all" || creatorSubSection === "payments") && (
        <>
        <div className="card-3d mt-8 rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-outfit text-xl font-bold">
              My Escrow Payments
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track your earnings, secure holdings, and escrow release status.
            </p>
          </div>

          {!creatorPayments ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading payments...
            </div>
          ) : creatorPayments.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border rounded-2xl bg-secondary/5">
              <CreditCard className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="font-semibold text-sm text-muted-foreground">
                No payment payouts tracked yet
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px] mx-auto">
                Once a brand approves your task and pays, the held funds will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                    <th className="pb-3 pr-2">Campaign</th>
                    <th className="pb-3 px-2">Brand</th>
                    <th className="pb-3 px-2">Gross Amount</th>
                    <th className="pb-3 px-2">Platform Fee (20%)</th>
                    <th className="pb-3 px-2">Your Earnings (80%)</th>
                    <th className="pb-3 px-2">Payment Status</th>
                    <th className="pb-3 px-2">Hold / Release Status</th>
                    <th className="pb-3 pl-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {creatorPayments.map((pay) => (
                    <tr key={pay._id} className="hover:bg-secondary/10">
                      <td className="py-3 pr-2 font-medium max-w-[150px] truncate">
                        {pay.campaign?.title || "General"}
                      </td>
                      <td className="py-3 px-2 max-w-[120px] truncate">
                        {pay.brand?.fullName || "Brand"}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        ₹{pay.grossAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        ₹{pay.platformCommissionAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 font-bold text-foreground">
                        ₹{pay.creatorAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "rounded-full text-[9px] uppercase px-2 py-0.5 font-bold shrink-0",
                            pay.paymentStatus === "completed" && "bg-emerald-500/10 text-emerald-600",
                            pay.paymentStatus === "holding" && "bg-blue-500/10 text-blue-500",
                            pay.paymentStatus === "invoice_generated" && "bg-amber/10 text-amber",
                            pay.paymentStatus === "disputed" && "bg-red-500/10 text-red-500",
                            pay.paymentStatus === "refunded" && "bg-slate-500/10 text-slate-500",
                            pay.paymentStatus === "pending" && "bg-amber/10 text-amber"
                          )}
                        >
                          {pay.paymentStatus.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        {pay.paymentStatus === "invoice_generated" ? (
                          <span className="text-amber text-[10px] font-semibold italic">
                            Awaiting Brand Payment
                          </span>
                        ) : pay.paymentStatus === "holding" && pay.holdingEndsAt ? (
                          <div className="flex flex-col items-start gap-0.5">
                            <span className="inline-flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-md text-[10px] font-bold border border-primary/20 animate-pulse">
                              Payment Secured
                            </span>
                            <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                              Releasing in: <CountdownTimer dueDate={pay.holdingEndsAt} />
                            </span>
                          </div>
                        ) : pay.paymentStatus === "disputed" ? (
                          <span className="inline-flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md text-[10px] font-bold border border-red-500/20">
                            Payment On Hold (Disputed)
                          </span>
                        ) : pay.paymentStatus === "completed" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md text-[10px] font-bold border border-emerald-500/20">
                            Released
                          </span>
                        ) : pay.paymentStatus === "refunded" ? (
                          <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded-md text-[10px] font-bold border border-slate-500/20">
                            Refunded to Brand
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[10px]">
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 rounded-full text-[10px] px-2.5"
                          onClick={() => setSelectedAuditLogPayment(pay)}
                        >
                          View Logs
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Settings Card */}
        <div className="mt-8 rounded-3xl border border-border bg-card p-6">
          <div className="mb-6">
            <h2 className="font-display text-lg font-semibold flex items-center gap-1.5">
              <CreditCard className="h-5 w-5 text-primary" /> Payment Settings
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your bank details and payout preferences securely. (Only you can edit)
            </p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (bankNumber !== bankNumberConfirm) {
                toast.error("Bank account numbers do not match");
                return;
              }
              if (bankIfsc.length !== 11) {
                toast.error("IFSC must be exactly 11 characters");
                return;
              }
              if (bankPan.length !== 10) {
                toast.error("PAN number must be exactly 10 characters");
                return;
              }

              setSavingBank(true);
              try {
                await saveBankDetails({
                  fullName: bankFullName,
                  phone: bankPhone,
                  email: bankEmail,
                  bankName,
                  accountHolderName: bankHolderName,
                  accountNumber: bankNumber,
                  confirmAccountNumber: bankNumberConfirm,
                  ifsc: bankIfsc,
                  upiId: bankUpi,
                  panNumber: bankPan,
                });
                toast.success("Payment details saved securely!");
              } catch (err) {
                toast.error((err).message);
              } finally {
                setSavingBank(false);
              }
            }}
            className="space-y-4 max-w-2xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bankFullName" className="text-xs font-semibold">Full Name *</Label>
                <Input
                  id="bankFullName"
                  placeholder="Your legal full name"
                  required
                  value={bankFullName}
                  onChange={(e) => setBankFullName(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bankPhone" className="text-xs font-semibold">Phone *</Label>
                  <Input
                    id="bankPhone"
                    placeholder="10 digit phone number"
                    required
                    value={bankPhone}
                    onChange={(e) => setBankPhone(e.target.value)}
                    className="rounded-xl border-border bg-background text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bankEmail" className="text-xs font-semibold">Email *</Label>
                  <Input
                    id="bankEmail"
                    type="email"
                    placeholder="name@domain.com"
                    required
                    value={bankEmail}
                    onChange={(e) => setBankEmail(e.target.value)}
                    className="rounded-xl border-border bg-background text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bankName" className="text-xs font-semibold">Bank Name *</Label>
                <Input
                  id="bankName"
                  placeholder="e.g. HDFC Bank"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bankHolderName" className="text-xs font-semibold">Account Holder Name *</Label>
                <Input
                  id="bankHolderName"
                  placeholder="Name as on bank passbook"
                  required
                  value={bankHolderName}
                  onChange={(e) => setBankHolderName(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bankNumber" className="text-xs font-semibold">Account Number *</Label>
                <Input
                  id="bankNumber"
                  type="password"
                  placeholder="Enter bank account number"
                  required
                  value={bankNumber}
                  onChange={(e) => setBankNumber(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bankNumberConfirm" className="text-xs font-semibold">Confirm Account Number *</Label>
                <Input
                  id="bankNumberConfirm"
                  placeholder="Re-enter bank account number"
                  required
                  value={bankNumberConfirm}
                  onChange={(e) => setBankNumberConfirm(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bankIfsc" className="text-xs font-semibold">IFSC Code *</Label>
                <Input
                  id="bankIfsc"
                  placeholder="11 characters IFSC (e.g. HDFC0001234)"
                  required
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  className="rounded-xl border-border bg-background text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bankPan" className="text-xs font-semibold">PAN Card Number *</Label>
                <Input
                  id="bankPan"
                  placeholder="10 character PAN"
                  required
                  value={bankPan}
                  onChange={(e) => setBankPan(e.target.value.toUpperCase())}
                  className="rounded-xl border-border bg-background text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bankUpi" className="text-xs font-semibold">UPI ID (Optional)</Label>
                <Input
                  id="bankUpi"
                  placeholder="username@bank"
                  value={bankUpi}
                  onChange={(e) => setBankUpi(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={savingBank}
              className="btn-bouncy rounded-full px-8 gradient-sunset border-0 text-white shadow-glow text-xs h-10 font-bold"
            >
              {savingBank ? "Saving Settings..." : "Save Payment Details"}
            </Button>
          </form>
        </div>
        </>
        )}

        {/* Reviews Section */}
        {(creatorSubSection === "all" || creatorSubSection === "profile") && (
        <div className="card-3d mt-8 rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-outfit text-xl font-bold">
              Reviews & Feedback
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage reviews displayed on your public profile page.
            </p>
          </div>

          {!reviews ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border rounded-2xl">
              <Star className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="font-semibold text-sm text-muted-foreground font-outfit">
                No reviews received yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Reviews left by brands you collaborate with will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="card-3d flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border/60 bg-background/70 rounded-2xl p-4 transition-all hover:border-primary/40"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <img src={
                          review.brandAvatar ||
                          `https://api.dicebear.com/9.x/avataaars/svg?seed=${review.brandName}`
                        }
                        alt=""
                        className="h-10 w-10 rounded-full object-cover border border-border/50 shadow-sm aspect-square"
                       onError={(e) => { e.target.onerror = null; e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback"; }} />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-outfit text-sm font-bold text-foreground">
                            {review.brandName}
                          </h4>
                          {review.campaignRef && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] rounded-full font-bold"
                            >
                              Campaign: {review.campaignRef}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= review.rating
                                    ? "fill-amber text-amber"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-foreground/90">
                      {review.comment && (
                        <p className="font-medium text-foreground">
                          "{review.comment}"
                        </p>
                      )}
                      <p className="text-muted-foreground mt-1">
                        {review.text}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-between md:justify-start">
                    <div className="text-right">
                      <span className="block text-xs font-semibold text-foreground">
                        Public Display
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        {review.visible
                          ? "Shown on public profile"
                          : "Hidden from public"}
                      </span>
                    </div>
                    <Switch
                      checked={review.visible}
                      onCheckedChange={() => handleToggleVisibility(review._id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </>
          ) : activeTab === "wallet" ? (
            <div className="space-y-6">
              {/* WALLET HEADER / STATS */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl font-bold flex items-center gap-2">
                      <Wallet className="h-6 w-6 text-primary" /> Creator Wallet & Earnings
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Direct, transparent balance from completed and released campaign collaborations.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs flex items-center gap-1.5"
                      onClick={() => setWalletRefreshKey((k) => k + 1)}
                    >
                      <History className="h-3.5 w-3.5" /> Refresh
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-full text-xs font-bold px-5 gradient-sunset text-white shadow-glow border-0 flex items-center gap-1.5"
                      onClick={() => {
                        setWithdrawAmountInput("");
                        setShowWithdrawDialog(true);
                      }}
                    >
                      <ArrowUpRight className="h-4 w-4" /> Withdraw Funds
                    </Button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* Available Balance Card */}
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Available Balance</span>
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <IndianRupee className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-3 text-3xl font-extrabold text-foreground font-display">
                      ₹{Number(creatorWallet.availableBalance || 0).toLocaleString("en-IN")}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Available for immediate withdrawal
                    </p>
                  </div>

                  {/* Pending Withdrawals Card */}
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Withdrawals</span>
                      <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                        <Clock className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-3 text-3xl font-bold text-foreground font-display text-amber-700">
                      ₹{Number(creatorWallet.pendingWithdrawalBalance || 0).toLocaleString("en-IN")}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Reserved & awaiting disbursement
                    </p>
                  </div>

                  {/* Total Earned Card */}
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Earned</span>
                      <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-3 text-3xl font-bold text-foreground font-display text-emerald-600">
                      ₹{Number(creatorWallet.totalEarned || 0).toLocaleString("en-IN")}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Lifetime collaboration earnings
                    </p>
                  </div>

                  {/* Protection Policy Notice */}
                  <div className="rounded-2xl border border-border bg-secondary/30 p-5 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <span className="text-xs font-bold text-foreground">100% Payout Guaranteed</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                      Zero fee deductions from creator earnings. The 20% platform fee is paid by brands and is never deducted from your agreed amount.
                    </p>
                  </div>
                </div>
              </div>

              {/* WITHDRAWAL REQUESTS HISTORY (TASK 14) */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display text-base font-bold flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-primary" /> Withdrawal Requests
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Track status of all your bank disbursements and processed transfers.
                    </p>
                  </div>
                </div>

                {!creatorWithdrawalsData ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    Loading withdrawal history...
                  </div>
                ) : creatorWithdrawalsList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-8 text-center">
                    <Landmark className="mx-auto h-7 w-7 text-muted-foreground/30 mb-2" />
                    <p className="font-semibold text-xs text-foreground">
                      No withdrawal requests yet
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Use the "Withdraw Funds" button above to disburse your available balance.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/50 text-muted-foreground">
                          <th className="pb-3 pl-2 font-semibold">Requested Date</th>
                          <th className="pb-3 px-2 font-semibold">Reference ID</th>
                          <th className="pb-3 px-2 font-semibold">Bank Destination</th>
                          <th className="pb-3 px-2 font-semibold">Amount</th>
                          <th className="pb-3 px-2 font-semibold">Status</th>
                          <th className="pb-3 pr-2 text-right font-semibold">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {creatorWithdrawalsList.map((w) => (
                          <tr key={w._id} className="hover:bg-secondary/10 transition-colors">
                            <td className="py-3 pl-2 text-muted-foreground whitespace-nowrap">
                              {new Date(w.requestedAt || w.createdAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="py-3 px-2 font-mono text-[10px] text-muted-foreground">
                              {w.referenceId}
                            </td>
                            <td className="py-3 px-2 text-foreground font-medium">
                              {w.bankDetailsSnapshot?.bankName || "Bank Account"} ({w.bankDetailsSnapshot?.accountNumberMasked || "••••"})
                            </td>
                            <td className="py-3 px-2 font-bold text-foreground text-sm whitespace-nowrap">
                              ₹{Number(w.amount || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 px-2">
                              <Badge
                                className={`rounded-full text-[9px] font-bold px-2 py-0.5 border ${
                                  w.status === "COMPLETED"
                                    ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                                    : w.status === "FAILED" || w.status === "CANCELLED"
                                    ? "bg-red-500/15 text-red-700 border-red-500/30"
                                    : "bg-amber-500/15 text-amber-700 border-amber-500/30"
                                }`}
                              >
                                {w.status === "COMPLETED"
                                  ? "✓ Disbursed"
                                  : w.status === "FAILED"
                                  ? "✕ Declined"
                                  : "⏳ Pending Review"}
                              </Badge>
                            </td>
                            <td className="py-3 pr-2 text-right text-[11px] text-muted-foreground">
                              {w.payoutReference ? (
                                <span className="text-emerald-600 font-mono text-[10px]">Ref: {w.payoutReference}</span>
                              ) : w.failureReason ? (
                                <span className="text-red-500 text-[10px]" title={w.failureReason}>
                                  {w.failureReason.slice(0, 25)}{w.failureReason.length > 25 ? "..." : ""}
                                </span>
                              ) : (
                                <span>In verification</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* TRANSACTION HISTORY */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display text-base font-bold flex items-center gap-2">
                      <History className="h-4 w-4 text-primary" /> Transaction Ledger
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Immutable record of all credits and debits from your wallet.
                    </p>
                  </div>
                </div>

                {!creatorWalletData ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    Loading transactions...
                  </div>
                ) : creatorTransactionsList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
                    <Wallet className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="font-semibold text-sm text-foreground">
                      No wallet transactions yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[320px]">
                      When your campaign deliverables are approved and the admin releases your payment, your wallet credits will appear right here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/50 text-muted-foreground">
                          <th className="pb-3 pl-2 font-semibold">Date & Time</th>
                          <th className="pb-3 px-2 font-semibold">Type</th>
                          <th className="pb-3 px-2 font-semibold">Description / Campaign</th>
                          <th className="pb-3 px-2 font-semibold">Reference ID</th>
                          <th className="pb-3 px-2 font-semibold">Amount</th>
                          <th className="pb-3 px-2 font-semibold">Balance After</th>
                          <th className="pb-3 pr-2 text-right font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {creatorTransactionsList.map((tx) => (
                          <tr key={tx._id} className="hover:bg-secondary/10 transition-colors">
                            <td className="py-3.5 pl-2 text-muted-foreground whitespace-nowrap">
                              {new Date(tx.createdAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="py-3.5 px-2">
                              <Badge
                                className={`rounded-full text-[10px] font-bold px-2 py-0.5 border ${
                                  tx.type === "DEBIT"
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                }`}
                              >
                                {tx.type === "DEBIT" ? "- DEBIT" : "+ CREDIT"}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-2 font-medium max-w-[200px] truncate">
                              <span className="block font-semibold text-foreground">
                                {tx.campaignId?.title || tx.description || "Collaboration Payout"}
                              </span>
                              <span className="block text-[10px] text-muted-foreground truncate">
                                {tx.description}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 font-mono text-[10px] text-muted-foreground">
                              {tx.referenceId}
                            </td>
                            <td className={`py-3.5 px-2 font-bold text-sm whitespace-nowrap ${
                              tx.type === "DEBIT" ? "text-amber-600" : "text-emerald-600"
                            }`}>
                              {tx.type === "DEBIT" ? "- " : "+ "}₹{Number(tx.amount || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3.5 px-2 font-semibold text-foreground text-xs whitespace-nowrap">
                              ₹{Number(tx.balanceAfter || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3.5 pr-2 text-right">
                              <Badge
                                className={`rounded-full text-[9px] font-bold px-2 py-0.5 border ${
                                  tx.status === "COMPLETED"
                                    ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                                    : tx.status === "FAILED"
                                    ? "bg-red-500/15 text-red-700 border-red-500/30"
                                    : "bg-amber-500/15 text-amber-700 border-amber-500/30"
                                }`}
                              >
                                {tx.status === "COMPLETED" ? "✓ Completed" : tx.status === "FAILED" ? "✕ Failed" : "⏳ Pending"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <SubscriptionTab role="creator" profile={profile} />
          )}
        </div>
      </div>
    </div>

      {/* Submit Task Dialog */}
      <Dialog
        open={!!submitTargetTask}
        onOpenChange={(open) => !open && setSubmitTargetTask(null)}
      >
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Submit Task Deliverables
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Provide your submission link and optional notes for the brand.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!submissionLink.trim()) {
                toast.error("Please provide a submission link");
                return;
              }
              setSubmittingTask(true);
              try {
                await submitTask({
                  taskId: submitTargetTask._id,
                  submissionLink: submissionLink.trim(),
                  notes: submissionNotes.trim(),
                  attachmentLink: submissionAttachment.trim(),
                });
                toast.success("Task submitted successfully! Brand notified.");
                setSubmitTargetTask(null);
              } catch (err) {
                toast.error((err).message);
              } finally {
                setSubmittingTask(false);
              }
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-1">
              <Label htmlFor="sub-link" className="text-xs font-semibold">
                Submission Link *
              </Label>
              <Input
                id="sub-link"
                placeholder="https://instagram.com/... or Google Drive URL"
                required
                value={submissionLink}
                onChange={(e) => setSubmissionLink(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sub-notes" className="text-xs font-semibold">
                Submission Notes (Optional)
              </Label>
              <Textarea
                id="sub-notes"
                placeholder="Add any extra notes or explanations..."
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sub-attachment" className="text-xs font-semibold">
                Optional Attachment Link
              </Label>
              <Input
                id="sub-attachment"
                placeholder="Additional assets link (e.g. Dropbox, Figma)"
                value={submissionAttachment}
                onChange={(e) => setSubmissionAttachment(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setSubmitTargetTask(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingTask}
                className="rounded-full gradient-sunset border-0 text-white shadow-glow"
              >
                {submittingTask ? "Submitting..." : "Submit Deliverable"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Audit Logs Timeline Modal */}
      <Dialog
        open={!!selectedAuditLogPayment}
        onOpenChange={(open) => !open && setSelectedAuditLogPayment(null)}
      >
        <DialogContent className="sm:max-w-md rounded-3xl border border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              Escrow Payout Timeline
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review transaction audit log trail events.
            </DialogDescription>
          </DialogHeader>

          {selectedAuditLogPayment && (
            <div className="space-y-4 mt-3">
              <div className="text-xs space-y-1 bg-secondary/10 border border-border/40 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase">Payment ID</p>
                <p className="font-mono">{selectedAuditLogPayment._id}</p>
                {selectedAuditLogPayment.gatewayOrderId && (
                  <>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-1">Razorpay Order ID</p>
                    <p className="font-mono">{selectedAuditLogPayment.gatewayOrderId}</p>
                  </>
                )}
                {selectedAuditLogPayment.gatewayPaymentId && (
                  <>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-1">Razorpay Payment ID</p>
                    <p className="font-mono">{selectedAuditLogPayment.gatewayPaymentId}</p>
                  </>
                )}
              </div>

              <div className="relative border-l-2 border-border ml-2 pl-4 space-y-4 py-2">
                {!selectedAuditLogPayment.auditLogs || selectedAuditLogPayment.auditLogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No events logged yet.</p>
                ) : (
                  [...selectedAuditLogPayment.auditLogs]
                    .sort((a, b) => a.createdAt - b.createdAt)
                    .map((log, idx) => (
                      <div key={log._id || idx} className="relative">
                        <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary" />
                        <h4 className="text-xs font-bold text-foreground">
                          {log.action}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {log.details}
                        </p>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="secondary"
                  className="rounded-full w-full"
                  onClick={() => setSelectedAuditLogPayment(null)}
                >
                  Close Timeline
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Campaign Details & Join Request Modal for Creators */}
      <Dialog
        open={!!selectedCampaignForDiscovery}
        onOpenChange={(open) => !open && setSelectedCampaignForDiscovery(null)}
      >
        <DialogContent className="sm:max-w-2xl rounded-3xl border border-border bg-card p-6">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" /> Campaign Details
              </DialogTitle>
              {selectedCampaignForDiscovery?.isParticipating ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-full text-xs font-semibold">
                  Participating
                </Badge>
              ) : selectedCampaignForDiscovery?.isRequested ? (
                <Badge className="bg-amber/10 text-amber border-amber/20 rounded-full text-xs font-semibold">
                  Request Pending
                </Badge>
              ) : null}
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Review campaign specifications and send your pitch to the brand.
            </DialogDescription>
          </DialogHeader>

          {selectedCampaignForDiscovery && (
            <div className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto pr-1">
              {/* Brand Profile Banner */}
              <div className="flex items-center gap-3 p-3 bg-secondary/15 rounded-2xl border border-border/50">
                <img
                  src={
                    selectedCampaignForDiscovery.brand?.avatarUrl ||
                    `https://api.dicebear.com/9.x/avataaars/svg?seed=${selectedCampaignForDiscovery.brand?.fullName || "Brand"}`
                  }
                  alt=""
                  className="h-12 w-12 rounded-xl object-cover border border-border"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                    {selectedCampaignForDiscovery.brand?.fullName}
                    {selectedCampaignForDiscovery.brand?.rating > 0 && (
                      <span className="flex items-center gap-0.5 text-amber text-xs font-bold">
                        <Star className="h-3 w-3 fill-amber" /> {selectedCampaignForDiscovery.brand.rating} ({selectedCampaignForDiscovery.brand.reviewCount || 0})
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedCampaignForDiscovery.brand?.category || "Brand"} · {selectedCampaignForDiscovery.location || "Pan India"}
                  </p>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Campaign Title
                </label>
                <p className="text-base font-bold text-foreground">
                  {selectedCampaignForDiscovery.title}
                </p>
              </div>

              {selectedCampaignForDiscovery.description && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Description
                  </label>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-background/50 p-3 rounded-xl border border-border/40">
                    {selectedCampaignForDiscovery.description}
                  </p>
                </div>
              )}

              {/* Budget & Timeline Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-secondary/10 p-3 rounded-xl border border-border/40 space-y-1">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                    <IndianRupee className="h-3 w-3 text-primary" /> Creator Budget
                  </span>
                  <p className="text-xs font-bold text-foreground">
                    ₹{Number(selectedCampaignForDiscovery.minBudgetPerCreator || 0).toLocaleString("en-IN")} - ₹{Number(selectedCampaignForDiscovery.maxBudgetPerCreator || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="bg-secondary/10 p-3 rounded-xl border border-border/40 space-y-1">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                    <IndianRupee className="h-3 w-3 text-primary" /> Total Budget
                  </span>
                  <p className="text-sm font-bold text-foreground">
                    ₹{Number(selectedCampaignForDiscovery.totalBudget || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="bg-secondary/10 p-3 rounded-xl border border-border/40 space-y-1">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                    <Calendar className="h-3 w-3 text-primary" /> Start Date
                  </span>
                  <p className="text-xs font-medium text-foreground">
                    {new Date(selectedCampaignForDiscovery.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-secondary/10 p-3 rounded-xl border border-border/40 space-y-1">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                    <Calendar className="h-3 w-3 text-primary" /> End Date
                  </span>
                  <p className="text-xs font-medium text-foreground">
                    {new Date(selectedCampaignForDiscovery.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Deliverables Breakdown */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3 text-primary" /> Required Deliverables
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 bg-background border border-border/50 rounded-xl text-center">
                    <span className="text-xs text-muted-foreground block">🎬 Reels</span>
                    <span className="text-sm font-bold text-foreground">{selectedCampaignForDiscovery.deliverables?.reels || 0}</span>
                  </div>
                  <div className="p-2.5 bg-background border border-border/50 rounded-xl text-center">
                    <span className="text-xs text-muted-foreground block">📸 Posts</span>
                    <span className="text-sm font-bold text-foreground">{selectedCampaignForDiscovery.deliverables?.posts || 0}</span>
                  </div>
                  <div className="p-2.5 bg-background border border-border/50 rounded-xl text-center">
                    <span className="text-xs text-muted-foreground block">📱 Stories</span>
                    <span className="text-sm font-bold text-foreground">{selectedCampaignForDiscovery.deliverables?.stories || 0}</span>
                  </div>
                  <div className="p-2.5 bg-background border border-border/50 rounded-xl text-center">
                    <span className="text-xs text-muted-foreground block">🎥 Videos</span>
                    <span className="text-sm font-bold text-foreground">{selectedCampaignForDiscovery.deliverables?.videos || 0}</span>
                  </div>
                </div>
              </div>

              {/* Pitch Input */}
              {!selectedCampaignForDiscovery.isParticipating && !selectedCampaignForDiscovery.isRequested && (
                <div className="space-y-1.5 pt-2 border-t border-border/40">
                  <label className="text-xs font-semibold text-foreground">
                    Your Pitch to Brand
                  </label>
                  <Textarea
                    placeholder="Briefly describe why you are a great fit for this campaign..."
                    value={joinPitch}
                    onChange={(e) => setJoinPitch(e.target.value)}
                    className="text-xs rounded-xl resize-none"
                    rows={3}
                  />
                </div>
              )}

              <DialogFooter className="pt-2 flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-full flex-1 text-xs"
                  onClick={() => setSelectedCampaignForDiscovery(null)}
                >
                  Close
                </Button>

                {selectedCampaignForDiscovery.isParticipating ? (
                  <Button disabled className="rounded-full flex-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold">
                    Already Participating
                  </Button>
                ) : selectedCampaignForDiscovery.isRequested ? (
                  <Button disabled className="rounded-full flex-1 bg-amber/10 text-amber border border-amber/20 text-xs font-semibold">
                    Request Pending
                  </Button>
                ) : (
                  <Button
                    className="rounded-full flex-1 gradient-sunset border-0 text-white font-semibold text-xs shadow-glow"
                    disabled={joiningCampaign}
                    onClick={async () => {
                      setJoiningCampaign(true);
                      try {
                        const res = await apiPost(`/campaigns/${selectedCampaignForDiscovery._id}/join`, {
                          pitch: joinPitch.trim(),
                        });
                        toast.success("Request to join campaign sent successfully!");
                        setSelectedCampaignForDiscovery(null);
                        setDiscoverRefreshKey((k) => k + 1);
                      } catch (err) {
                        toast.error(err.response?.data?.message || err.message || "Failed to join campaign");
                      } finally {
                        setJoiningCampaign(false);
                      }
                    }}
                  >
                    {joiningCampaign ? "Submitting..." : "Send Request to Join"}
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Premium Subscription Offer Popup */}
      <Dialog open={showOfferPopup} onOpenChange={setShowOfferPopup}>
        <DialogContent className="sm:max-w-[720px] rounded-3xl border border-border bg-card p-0 overflow-hidden shadow-elevated">
          <div className="flex flex-col">
            {/* Offer Banner */}
            {activeOffer && activeOffer.bannerImageUrl ? (
              <div className="h-32 w-full relative">
                <img
                  src={activeOffer.bannerImageUrl}
                  alt="Offer Banner"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              </div>
            ) : (
              <div className="h-20 w-full bg-gradient-to-r from-primary/20 via-accent/15 to-background flex items-center justify-center relative">
                <Sparkles className="h-7 w-7 text-primary animate-pulse" />
              </div>
            )}

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 text-primary px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider animate-pulse">
                    {activeOffer ? "Limited Time Offer" : "Special Package Plan"}
                  </span>
                  {activeOffer && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" /> Expires: {new Date(activeOffer.expiryDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <DialogTitle className="font-display text-xl font-bold text-foreground">
                  {activeOffer ? activeOffer.name : "Premium Packages"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {activeOffer ? activeOffer.description : "Unlock premium search matches, unlimited campaign listings, and verify your account status today."}
                </DialogDescription>
              </div>

              {/* Subscription cards render */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                {(packages || []).map((pkg) => {
                  const isActive = currentSub && currentSub.packageId === pkg._id;
                  const isPromoPkg = activeOffer && activeOffer.packageId === pkg._id;
                  const isRecommended = pkg.name === "Pro";

                  let finalPrice = pkg.price;
                  if (isPromoPkg && activeOffer) {
                    if (activeOffer.discountPercentage) {
                      finalPrice = pkg.price * (1 - activeOffer.discountPercentage / 100);
                    } else if (activeOffer.discountAmount) {
                      finalPrice = Math.max(0, pkg.price - activeOffer.discountAmount);
                    }
                  }

                  return (
                    <div
                      key={pkg._id}
                      className={`rounded-2xl border p-4 flex flex-col justify-between relative bg-background/40 backdrop-blur-md transition-all duration-200 ${
                        isRecommended ? "border-primary shadow-elevated bg-secondary/5" : "border-border"
                      }`}
                    >
                      {pkg.badge && (
                        <span className="absolute -top-2 left-4 text-[8px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          {pkg.badge}
                        </span>
                      )}

                      <div className="space-y-2">
                        <h4 className="font-display text-sm font-bold text-foreground">{pkg.name}</h4>
                        <div className="flex items-baseline gap-1">
                          {isPromoPkg ? (
                            <>
                              <span className="text-xl font-bold text-foreground">₹{finalPrice}</span>
                              <span className="text-[10px] text-muted-foreground line-through">₹{pkg.price}</span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-foreground">₹{pkg.price}</span>
                          )}
                          <span className="text-[10px] text-muted-foreground">/{pkg.billingPeriod}</span>
                        </div>

                        <ul className="space-y-1 text-[10px] text-muted-foreground">
                          {pkg.features.slice(0, 4).map((f, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                              <span className="truncate">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4">
                        {isActive ? (
                          <Button size="sm" className="w-full rounded-full text-[10px]" variant="secondary" disabled>
                            Current Plan
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className={`w-full rounded-full text-[10px] font-semibold ${
                              isRecommended ? "gradient-sunset border-0 text-white shadow-glow" : ""
                            }`}
                            variant={isRecommended ? "default" : "outline"}
                            onClick={() => {
                              handleUpgradeFromPopup(pkg._id, isPromoPkg ? activeOffer?._id : undefined);
                            }}
                            disabled={upgradingId !== null}
                          >
                            {upgradingId === pkg._id ? "Processing..." : `Buy ${pkg.name}`}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => setShowOfferPopup(false)}
                >
                  Maybe Later
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-[10px] text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setShowOfferPopup(false);
                    const dontShowUntilKey = `popup_dont_show_until_${profile?._id || ""}`;
                    localStorage.setItem(
                      dontShowUntilKey,
                      (Date.now() + 7 * 24 * 60 * 60 * 1000).toString()
                    );
                    toast.success("We will not show this offer again for 7 days.");
                  }}
                >
                  Dismiss for 7 Days
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task 6: Deliverable Content Submission Dialog */}
      <Dialog
        open={Boolean(selectedCollabForSubmission)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCollabForSubmission(null);
            setSubmissionFile(null);
            setSubmissionFilePreview(null);
            setSubmissionCaption("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" /> Submit Deliverable Work
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Upload your completed work for "{selectedCollabForSubmission?.campaign?.title || "Campaign"}". The brand will review your submitted content.
            </DialogDescription>
          </DialogHeader>

          {selectedCollabForSubmission && (
            <div className="space-y-4 py-2">
              {/* Deliverable Type Select */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Select Deliverable Type <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selectedCollabForSubmission.deliverablesTracking?.map((deliv) => {
                    const isSelected = submissionDeliverableType === deliv.type;
                    const isFulfilled = (deliv.completedQuantity || 0) >= deliv.requiredQuantity;
                    const typeLabels = {
                      REEL: "Reel",
                      POST: "Post",
                      STORY: "Story",
                      VIDEO: "Video",
                    };
                    return (
                      <button
                        key={deliv.type}
                        type="button"
                        disabled={isFulfilled}
                        onClick={() => setSubmissionDeliverableType(deliv.type)}
                        className={cn(
                          "flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition font-semibold cursor-pointer",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary"
                            : isFulfilled
                            ? "border-border/40 bg-muted/20 text-muted-foreground opacity-50 cursor-not-allowed"
                            : "border-border bg-card hover:bg-secondary/60 text-foreground"
                        )}
                      >
                        <span>{typeLabels[deliv.type] || deliv.type}</span>
                        <span className="text-[10px] font-normal opacity-80 mt-0.5">
                          {deliv.completedQuantity || 0}/{deliv.requiredQuantity}
                        </span>
                        {isFulfilled && (
                          <span className="text-[9px] font-bold text-emerald-600">Done ✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* File Upload Area */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Upload Deliverable File (Video or Image) <span className="text-red-500">*</span>
                </Label>
                <div className="rounded-2xl border-2 border-dashed border-border/80 bg-secondary/20 p-4 text-center hover:border-primary/50 transition">
                  {submissionFilePreview ? (
                    <div className="space-y-3">
                      {submissionFile?.type?.startsWith("video") ? (
                        <video
                          src={submissionFilePreview}
                          controls
                          className="max-h-48 mx-auto rounded-xl shadow-sm border border-border"
                        />
                      ) : (
                        <img
                          src={submissionFilePreview}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-xl object-contain shadow-sm border border-border"
                        />
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
                        <span className="truncate max-w-[260px] font-medium text-foreground">
                          {submissionFile?.name}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-full"
                          onClick={() => {
                            setSubmissionFile(null);
                            setSubmissionFilePreview(null);
                          }}
                        >
                          Change File
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-sm">
                        <Upload className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-bold text-foreground">Click or drag file to upload</span>
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        MP4, MOV, WebM, JPG, PNG, WebP up to 50MB
                      </span>
                      <input
                        type="file"
                        accept="video/*,image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 50 * 1024 * 1024) {
                              toast.error("File exceeds 50MB maximum size limit.");
                              return;
                            }
                            setSubmissionFile(file);
                            setSubmissionFilePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Optional Caption / Description */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Caption / Description / Submission Notes (Optional)
                </Label>
                <Textarea
                  placeholder="e.g. Here is the first draft of the Reel focusing on the product unboxing..."
                  value={submissionCaption}
                  onChange={(e) => setSubmissionCaption(e.target.value)}
                  className="text-xs min-h-[70px] rounded-xl resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              onClick={() => {
                setSelectedCollabForSubmission(null);
                setSubmissionFile(null);
                setSubmissionFilePreview(null);
                setSubmissionCaption("");
              }}
              disabled={submittingDeliverable}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="rounded-full gradient-sunset text-white font-bold text-xs px-6 shadow-glow"
              disabled={!submissionDeliverableType || !submissionFile || submittingDeliverable}
              onClick={async () => {
                if (!selectedCollabForSubmission || !submissionDeliverableType || !submissionFile) {
                  toast.error("Please select deliverable type and upload a file.");
                  return;
                }

                setSubmittingDeliverable(true);
                try {
                  const formData = new FormData();
                  formData.append("deliverableType", submissionDeliverableType);
                  formData.append("file", submissionFile);
                  if (submissionCaption) {
                    formData.append("caption", submissionCaption);
                  }

                  await api.post(`/api/submissions/${selectedCollabForSubmission._id}/submit`, formData, {
                    headers: {
                      "Content-Type": "multipart/form-data",
                    },
                  });

                  toast.success("Deliverable submitted successfully! Brand has been notified.");
                  setSelectedCollabForSubmission(null);
                  setSubmissionFile(null);
                  setSubmissionFilePreview(null);
                  setSubmissionCaption("");
                  setRequestsRefreshKey((k) => k + 1);
                } catch (err) {
                  console.error("Submission error:", err);
                  toast.error(err?.response?.data?.message || err.message || "Failed to submit deliverable.");
                } finally {
                  setSubmittingDeliverable(false);
                }
              }}
            >
              {submittingDeliverable ? "Submitting Work..." : "Submit Deliverable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task 7: Submissions & Brand Review Feedback History Dialog for Creator */}
      <Dialog
        open={Boolean(selectedCollabForHistory)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCollabForHistory(null);
            setCreatorSubmissionsList([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" /> Submissions & Brand Review Feedback
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review status and feedback from the brand for "{selectedCollabForHistory?.campaign?.title || "Campaign"}".
            </DialogDescription>
          </DialogHeader>

          {selectedCollabForHistory && (
            <div className="space-y-4 py-2">
              {/* Deliverables Overview Stats */}
              <div className="rounded-2xl border border-border/80 bg-secondary/20 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Brand</span>
                  <span className="font-bold text-foreground">{selectedCollabForHistory.brandProfile?.fullName || "Brand"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Campaign</span>
                  <span className="font-bold text-foreground truncate max-w-[200px] block">{selectedCollabForHistory.campaign?.title || "Campaign"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Approved Deliverables</span>
                  {(() => {
                    const totalReq = selectedCollabForHistory.deliverablesTracking?.reduce((sum, d) => sum + (d.requiredQuantity || 0), 0) || 0;
                    const totalComp = selectedCollabForHistory.deliverablesTracking?.reduce((sum, d) => sum + (d.completedQuantity || 0), 0) || 0;
                    return (
                      <span className="font-bold text-primary">
                        {totalComp} / {totalReq} Approved
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Submissions List */}
              {loadingCreatorSubmissions ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  Loading submissions...
                </div>
              ) : creatorSubmissionsList.length === 0 ? (
                <div className="py-12 text-center rounded-2xl border border-dashed border-border p-6 space-y-1">
                  <p className="text-sm font-semibold text-foreground">No submissions yet</p>
                  <p className="text-xs text-muted-foreground">
                    You have not uploaded any deliverables for this collaboration.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {creatorSubmissionsList.map((sub, idx) => {
                    const isVideo = sub.contentUrl?.match(/\.(mp4|mov|webm|avi|mkv)$/i) || sub.deliverableType === "REEL" || sub.deliverableType === "VIDEO";
                    const formattedDate = new Date(sub.submittedAt || sub.createdAt).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });

                    return (
                      <div
                        key={sub._id || idx}
                        className={cn(
                          "rounded-2xl border p-4 space-y-3 transition",
                          sub.status === "APPROVED"
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : sub.status === "REJECTED"
                            ? "border-red-500/30 bg-red-500/5"
                            : "border-border/80 bg-card"
                        )}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary/10 text-primary border border-primary/20 font-bold text-[10px] px-2 py-0.5">
                              {sub.deliverableType}
                            </Badge>
                            <span className="text-xs font-semibold text-foreground">
                              Submission #{creatorSubmissionsList.length - idx}
                            </span>
                            {sub.version && sub.version > 1 && (
                              <Badge variant="outline" className="text-[9px] font-bold text-muted-foreground border-border px-1.5 py-0">
                                v{sub.version}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {sub.status === "APPROVED" ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> APPROVED
                              </Badge>
                            ) : sub.status === "REJECTED" ? (
                              <Badge variant="destructive" className="text-[10px] font-bold flex items-center gap-1">
                                <X className="h-3 w-3" /> REJECTED / CHANGES NEEDED
                              </Badge>
                            ) : sub.status === "RESUBMITTED" ? (
                              <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-bold">
                                RESUBMITTED · AWAITING REVIEW
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold">
                                AWAITING BRAND REVIEW
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Rejection Feedback Banner if Rejected */}
                        {sub.status === "REJECTED" && (
                          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 space-y-2">
                            <span className="font-bold text-[11px] text-red-600 uppercase flex items-center gap-1">
                              <X className="h-3.5 w-3.5" /> Brand Feedback / Reason:
                            </span>
                            <p className="text-xs text-foreground leading-relaxed">
                              {sub.rejectionReason || "Please review and adjust your work according to the campaign requirements."}
                            </p>

                            {/* Task 8: Rework & Resubmit Action Trigger */}
                            <div className="pt-1 flex items-center justify-between gap-2 border-t border-red-500/20">
                              <span className="text-[10px] text-red-500 font-semibold">
                                Corrected work can be uploaded & resubmitted for review.
                              </span>
                              <Button
                                size="sm"
                                className="h-7 text-xs font-bold rounded-full gradient-sunset text-white border-0 shadow-sm px-4 flex items-center gap-1.5"
                                onClick={() => {
                                  setReworkingSubmission(sub);
                                  setReworkFile(null);
                                  setReworkFilePreview(null);
                                  setReworkCaption(sub.caption || "");
                                }}
                              >
                                <Upload className="h-3 w-3" /> Rework & Resubmit
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Resubmitted info banner if RESUBMITTED */}
                        {sub.status === "RESUBMITTED" && (
                          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-2.5 text-xs text-blue-700 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                            <span>Corrected work (v{sub.version || 2}) was submitted and is now awaiting Brand review.</span>
                          </div>
                        )}

                        {/* Content Preview */}
                        <div className="rounded-xl overflow-hidden bg-background border border-border/60 max-h-56 flex items-center justify-center">
                          {isVideo ? (
                            <video
                              src={resolveImageUrl(sub.contentUrl)}
                              controls
                              className="max-h-56 w-full object-contain"
                            />
                          ) : (
                            <img
                              src={resolveImageUrl(sub.contentUrl)}
                              alt="Deliverable"
                              className="max-h-56 w-full object-contain"
                            />
                          )}
                        </div>

                        {/* Caption if provided */}
                        {sub.caption && (
                          <div className="text-xs text-muted-foreground bg-secondary/30 rounded-xl p-2.5 border border-border/40">
                            <span className="font-semibold text-foreground block text-[10px] uppercase mb-0.5">
                              Your Submission Notes:
                            </span>
                            "{sub.caption}"
                          </div>
                        )}

                        {/* Footer info */}
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                          <span>
                            {sub.status === "RESUBMITTED" ? "Resubmitted" : "Submitted"}: {formattedDate}
                          </span>
                          <a
                            href={resolveImageUrl(sub.contentUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 font-semibold"
                          >
                            <ExternalLink className="h-3 w-3" /> View Full File
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              onClick={() => {
                setSelectedCollabForHistory(null);
                setCreatorSubmissionsList([]);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task 8: Creator Rework & Resubmission Dialog */}
      <Dialog
        open={Boolean(reworkingSubmission)}
        onOpenChange={(open) => {
          if (!open) {
            setReworkingSubmission(null);
            setReworkFile(null);
            setReworkFilePreview(null);
            setReworkCaption("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" /> Rework & Resubmit Deliverable
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Upload your revised {reworkingSubmission?.deliverableType} addressing the Brand's feedback for "{selectedCollabForHistory?.campaign?.title || "Campaign"}".
            </DialogDescription>
          </DialogHeader>

          {reworkingSubmission && (
            <div className="space-y-4 py-2">
              {/* Previous Rejection Feedback Box */}
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 space-y-1 text-xs">
                <span className="font-bold text-[11px] text-red-600 uppercase flex items-center gap-1">
                  <X className="h-3.5 w-3.5" /> Previous Brand Feedback (v{reworkingSubmission.version || 1}):
                </span>
                <p className="text-foreground leading-relaxed">
                  "{reworkingSubmission.rejectionReason || "Please review and adjust according to campaign guidelines."}"
                </p>
              </div>

              {/* Corrected File Upload Area */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Upload Corrected Deliverable File <span className="text-red-500">*</span>
                </Label>
                <div className="rounded-2xl border-2 border-dashed border-border/80 bg-secondary/20 p-4 text-center hover:border-primary/50 transition">
                  {reworkFilePreview ? (
                    <div className="space-y-3">
                      {reworkFile?.type?.startsWith("video") ? (
                        <video
                          src={reworkFilePreview}
                          controls
                          className="max-h-48 mx-auto rounded-xl shadow-sm border border-border"
                        />
                      ) : (
                        <img
                          src={reworkFilePreview}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-xl object-contain shadow-sm border border-border"
                        />
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
                        <span className="truncate max-w-[260px] font-medium text-foreground">
                          {reworkFile?.name}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-full"
                          onClick={() => {
                            setReworkFile(null);
                            setReworkFilePreview(null);
                          }}
                        >
                          Change File
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-sm">
                        <Upload className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-bold text-foreground">Click to upload corrected file</span>
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        MP4, MOV, WebM, JPG, PNG, WebP up to 50MB
                      </span>
                      <input
                        type="file"
                        accept="video/*,image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 50 * 1024 * 1024) {
                              toast.error("File exceeds 50MB maximum size limit.");
                              return;
                            }
                            setReworkFile(file);
                            setReworkFilePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Rework Notes / Response */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Notes / Response to Brand (Optional)
                </Label>
                <Textarea
                  placeholder="e.g. Corrected the video to add the brand's required tag and updated the product intro..."
                  value={reworkCaption}
                  onChange={(e) => setReworkCaption(e.target.value)}
                  className="text-xs min-h-[70px] rounded-xl resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              onClick={() => {
                setReworkingSubmission(null);
                setReworkFile(null);
                setReworkFilePreview(null);
                setReworkCaption("");
              }}
              disabled={submittingRework}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="rounded-full gradient-sunset text-white font-bold text-xs px-6 shadow-glow"
              disabled={!reworkFile || submittingRework}
              onClick={async () => {
                if (!reworkingSubmission || !reworkFile) {
                  toast.error("Please upload the corrected deliverable file.");
                  return;
                }

                setSubmittingRework(true);
                try {
                  const formData = new FormData();
                  formData.append("file", reworkFile);
                  if (reworkCaption) {
                    formData.append("caption", reworkCaption);
                  }

                  await api.post(`/api/submissions/${reworkingSubmission._id}/resubmit`, formData, {
                    headers: {
                      "Content-Type": "multipart/form-data",
                    },
                  });

                  toast.success(`Deliverable resubmitted successfully as v${(reworkingSubmission.version || 1) + 1}! Brand notified.`);
                  setReworkingSubmission(null);
                  setReworkFile(null);
                  setReworkFilePreview(null);
                  setReworkCaption("");

                  // Refresh history modal submissions
                  if (selectedCollabForHistory) {
                    const refreshed = await api.get(`/api/submissions/${selectedCollabForHistory._id}/submissions`);
                    setCreatorSubmissionsList(refreshed.data?.data?.submissions || []);
                  }
                  setRequestsRefreshKey((k) => k + 1);
                } catch (err) {
                  console.error("Resubmission error:", err);
                  toast.error(err?.response?.data?.message || err.message || "Failed to resubmit deliverable.");
                } finally {
                  setSubmittingRework(false);
                }
              }}
            >
              {submittingRework ? "Resubmitting..." : `Resubmit Deliverable (v${(reworkingSubmission?.version || 1) + 1})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WITHDRAW FUNDS DIALOG (TASK 14) */}
      <Dialog
        open={showWithdrawDialog}
        onOpenChange={(open) => !open && !requestingWithdrawal && setShowWithdrawDialog(false)}
      >
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" /> Withdraw Funds to Bank
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Request a payout transfer from your available wallet balance directly to your registered bank account.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const amt = Number(withdrawAmountInput);
              const available = Number(creatorWallet.availableBalance || 0);

              if (isNaN(amt) || amt <= 0) {
                toast.error("Please enter a valid withdrawal amount.");
                return;
              }
              if (amt < 100) {
                toast.error("Minimum withdrawal amount is ₹100.");
                return;
              }
              if (amt > available) {
                toast.error(`Amount exceeds available balance (₹${available.toLocaleString("en-IN")}).`);
                return;
              }
              if (!bankDetails || !bankDetails.accountNumber) {
                toast.error("Please configure your bank details in Payment Settings first.");
                return;
              }

              setRequestingWithdrawal(true);
              try {
                const res = await api.post("/api/wallet/withdraw", {
                  amount: amt,
                  withdrawalMethod: "BANK_TRANSFER",
                });

                if (res.data?.success) {
                  toast.success(res.data.message || `Withdrawal request for ₹${amt.toLocaleString("en-IN")} submitted!`);
                  setShowWithdrawDialog(false);
                  setWithdrawAmountInput("");
                  setWalletRefreshKey((k) => k + 1);
                }
              } catch (err) {
                console.error("Withdrawal request error:", err);
                toast.error(err?.response?.data?.message || err.message || "Failed to submit withdrawal request.");
              } finally {
                setRequestingWithdrawal(false);
              }
            }}
            className="space-y-4 pt-1 text-xs"
          >
            {/* Balance Card */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex justify-between items-center">
              <div>
                <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Available to Withdraw</span>
                <div className="text-2xl font-extrabold text-foreground font-display mt-0.5">
                  ₹{Number(creatorWallet.availableBalance || 0).toLocaleString("en-IN")}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full text-[10px] h-7 px-2.5 font-bold"
                onClick={() => setWithdrawAmountInput(String(creatorWallet.availableBalance || 0))}
              >
                Max Amount
              </Button>
            </div>

            {/* Destination Bank Snapshot */}
            <div className="rounded-2xl border border-border bg-secondary/20 p-3.5 space-y-1 text-[11px]">
              <div className="flex justify-between items-center font-semibold text-foreground">
                <span>Destination Bank:</span>
                <span>{bankDetails?.bankName || "Bank Account Not Found"}</span>
              </div>
              {bankDetails?.accountNumber ? (
                <div className="text-muted-foreground text-[10px] space-y-0.5">
                  <p>A/C Holder: <strong className="text-foreground">{bankDetails.accountHolderName || bankDetails.fullName}</strong></p>
                  <p>A/C Number: ••••••••{bankDetails.accountNumber.slice(-4)} | IFSC: {bankDetails.ifsc}</p>
                </div>
              ) : (
                <p className="text-amber-600 text-[10px] font-medium pt-1">
                  ⚠️ No bank details found. Please save your bank details in the Payment Settings section below first.
                </p>
              )}
            </div>

            {/* Amount input */}
            <div className="space-y-1.5">
              <Label htmlFor="withdraw-amt" className="text-xs font-semibold">
                Withdrawal Amount (₹) *
              </Label>
              <Input
                id="withdraw-amt"
                type="number"
                min={100}
                max={creatorWallet.availableBalance || 0}
                placeholder="Enter amount (min ₹100)"
                required
                value={withdrawAmountInput}
                onChange={(e) => setWithdrawAmountInput(e.target.value)}
                className="text-sm font-bold"
              />
              <p className="text-[10px] text-muted-foreground">
                Funds will be reserved immediately and disbursed upon admin review.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
                disabled={requestingWithdrawal}
                onClick={() => setShowWithdrawDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="rounded-full gradient-sunset text-white font-bold text-xs px-6 shadow-glow"
                disabled={requestingWithdrawal || !bankDetails?.accountNumber || Number(creatorWallet.availableBalance || 0) <= 0}
              >
                {requestingWithdrawal ? "Submitting..." : "Confirm & Submit Withdrawal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DashboardInfluencer;
