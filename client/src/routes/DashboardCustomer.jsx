import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  Bookmark,
  Clock,
  Filter,
  Heart,
  Search,
  Trash2,
  History,
  Save,
  Edit2,
  UserPlus,
  Check,
  X,
  CheckCircle2,
  Camera,
  ImageIcon,
  Upload,
  Plus,
  Star,
  Globe,
  Users,
  Building2,
  MessageCircle,
  Sparkles,
  Percent,
  ExternalLink,
  Activity,
  CreditCard,
  Eye,
  Megaphone,
} from "lucide-react";


import {
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaTwitter,
} from "react-icons/fa";

import { Button } from "@/components/ui/Button";
import { CreatorOffersSidebarWidget } from "@/components/offers/CreatorOffersSidebarWidget";
import { MultiRoleOfferForm } from "@/components/offers/CreatorOfferForm";

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

import { Badge } from "@/components/ui/Badge";
import {
  formatFollowers,
  influencers,
  CATEGORY_OPTIONS,
} from "@/data/influencer";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { SubscriptionTab } from "../components/subscription/SubscriptionTab";
import axios from "axios";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/TextArea";
import { Switch } from "@/components/ui/Switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  "Jaipur",
  "Noida",
  "Gurugram",
  "Goa",
  "Kochi",
  "Other Location",
];

const COMPANY_SIZE_OPTIONS = [
  "1 - 10 employees",
  "11 - 50 employees",
  "50 - 200 employees",
  "200 - 500 employees",
  "500 - 1,000 employees",
  "1,000 - 5,000 employees",
  "5,000 - 10,000 employees",
  "10,000+ employees",
];

import api from "@/lib/api";

function useApiQuery(url, params = {}, enabled = true) {
  const [data, setData] = useState(undefined);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const query = JSON.stringify(params);
  useEffect(() => {
    if (!enabled || !url) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    api.get(url, { params }).then((res) => {
      if (!cancelled) {
        const payload = res.data?.data ?? res.data;
        setData(payload !== null && payload !== undefined ? payload : undefined);
      }
    }).catch((err) => {
      if (!cancelled) {
        setError(err);
        setData(undefined);
      }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [url, query, enabled]);
  return { data, error, loading };
}

export function DashboardCustomer() {
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

  const [requestsRefreshKey, setRequestsRefreshKey] = useState(0);
  const { data: pendingRequests = [] } = useApiQuery(`/connections/brand/${profile?._id}/requests?k=${requestsRefreshKey}`, {}, Boolean(profile));

  const { data: approvedCollabs = [] } = useApiQuery(`/connections/brand/${profile?._id}/approved?k=${requestsRefreshKey}`, {}, Boolean(profile));

  const { data: brandTasks = [] } = useApiQuery(`/tasks/brand/${profile?._id}`, {}, Boolean(profile));

  const { data: notifications = [] } = useApiQuery(`/tasks/notifications/${profile?._id}`, {}, Boolean(profile));

  // Campaign Requests Modal & Creator Details Modal States
  const [selectedCampaignForRequests, setSelectedCampaignForRequests] = useState(null);
  const [selectedCreatorForDetails, setSelectedCreatorForDetails] = useState(null);
  const [processingRequestId, setProcessingRequestId] = useState(null);

  // Task Assignment Modal States
  const [selectedCollabForTask, setSelectedCollabForTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDeliverables, setTaskDeliverables] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskDueTime, setTaskDueTime] = useState("23:59");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskNotes, setTaskNotes] = useState("");
  const [savingTask, setSavingTask] = useState(false);

  // Task Review Modal States
  const [selectedTaskForReview, setSelectedTaskForReview] = useState(null);
  const [reviewingTask, setReviewingTask] = useState(false);

  // Escrow Payments Queries, Mutations, and States
  const { data: brandPayments = [] } = useApiQuery(`/payments/brand/${profile?._id}`, {}, Boolean(profile));
  const [selectedAuditLogPayment, setSelectedAuditLogPayment] = useState(null);
  const [payingId, setPayingId] = useState(null);

  // Deliverables Submissions View & Review Modal (Task 6 & Task 7)
  const [selectedCollabForSubmissions, setSelectedCollabForSubmissions] = useState(null);
  const [collabSubmissionsList, setCollabSubmissionsList] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [reviewingSubmissionId, setReviewingSubmissionId] = useState(null);
  const [rejectingSubmission, setRejectingSubmission] = useState(null);
  const [hiredCreatorsModalOpen, setHiredCreatorsModalOpen] = useState(false);
  const [campaignFilterStatus, setCampaignFilterStatus] = useState("ALL");

  // Tab State
  const [activeTab, setActiveTab] = useState("dashboard");
  // Sub-section quick selector to eliminate excessive scrolling
  const [brandSubSection, setBrandSubSection] = useState("all");


  // Popup & Banner State
  const [showOfferPopup, setShowOfferPopup] = useState(false);
  const [activeOffer, setActiveOffer] = useState(null);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  const popupSettings = null; // No popup-settings Express route shared yet
  const { data: offers = [] } = useApiQuery(`/subscriptions/offers`);
  const { data: packages = [] } = useApiQuery(`/subscriptions/packages`);
  const { data: currentSub = null } = useApiQuery(`/subscriptions/user/${profile?._id}`, {}, Boolean(profile));

  const [upgradingId, setUpgradingId] = useState(null);

  const handleUpgradeFromPopup = async (packageId, offerId) => {
    setUpgradingId(packageId);
    try {
      await upgradeSubscription({
        profileId: profile._id,
        packageId,
        offerId,
      });
      toast.success("Package upgraded successfully! Enjoy your new features.");
      setShowOfferPopup(false);
    } catch (err) {
      console.error(err);
      toast.error((err ).message || "Failed to upgrade package");
    } finally {
      setUpgradingId(null);
    }
  };

  useEffect(() => {
    if (profile) {
      checkSubscriptionStatus({ profileId: profile._id }).catch(console.error);
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

    const hasSeenKey = `popup_seen_${profile._id}_${activeOfferRecord?._id || "no_offer"}`;
    const lastSeenTimeKey = `popup_last_seen_${profile._id}`;
    const dontShowUntilKey = `popup_dont_show_until_${profile._id}`;

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

  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);
  const { data: portfolioImages = [] } = useApiQuery(`/portfolio/profile/${profile?._id}?k=${galleryRefreshKey}`, {}, Boolean(profile));

  const { data: campaigns = [] } = useApiQuery(`/campaigns/brand/${profile?._id}`, {}, Boolean(profile));
  const brandCampaigns = campaigns;

  const { data: reviews = [] } = useApiQuery(`/reviews/creator/${profile?._id}`, {}, Boolean(profile));

  const { data: favsQuery = [] } = useApiQuery(`/favorites`, { brandId: profile?._id }, Boolean(profile));

  const { data: conversations = [] } = useApiQuery(
    `/conversations?profileId=${profile?._id}&role=${profile?.role || "brand"}`,
    {},
    Boolean(profile)
  );

  const { data: allLiveCreators = [] } = useApiQuery(`/profiles`, { role: "creator" });

  // Mutations

  // Campaigns Mutations

const updateProfile = async (payload) => { const res = await api.put(`/profiles/${payload.id}`, payload); return res.data?.data ?? res.data; };
const acceptConnection = async ({ connectionId }) => api.patch(`/connections/${connectionId}/accept`);
const rejectConnection = async ({ connectionId }) => api.patch(`/connections/${connectionId}/reject`);
const toggleFavorite = async ({ brandId, creatorId, remove = true }) => remove ? api.delete(`/favorites`, { data: { brandId, creatorId } }) : api.post(`/favorites`, { brandId, creatorId });
const addPortfolioImage = async ({ profileId, imageFile, sortOrder }) => { const fd = new FormData(); fd.append("image", imageFile); fd.append("profileId", profileId); if (sortOrder != null) fd.append("sortOrder", String(sortOrder)); return (await api.post(`/portfolio`, fd, { headers: { "Content-Type": "multipart/form-data" } })).data; };
const setAvatarImage = async ({ file, profileId }) => { const fd = new FormData(); fd.append("image", file); return (await api.post(`/profiles/${profileId || profile._id}/avatar`, fd, { headers: { "Content-Type": "multipart/form-data" } })).data; };
const setCoverImage = async ({ file, profileId }) => { const fd = new FormData(); fd.append("image", file); return (await api.post(`/profiles/${profileId || profile._id}/cover`, fd, { headers: { "Content-Type": "multipart/form-data" } })).data; };

const toggleVisibility = async ({ reviewId, creatorId }) => { const res = await api.patch(`/reviews/${reviewId}/visibility`, { creatorId }); return res.data?.data ?? res.data; };
const submitBrandVerification = async (payload) => api.post(`/profiles/brand-verification`, payload);
const createCampaign = async (payload) => api.post(`/campaigns`, payload);
const updateCampaign = async ({ id, ...payload }) => api.patch(`/campaigns/${id}`, payload);
const removeCampaign = async ({ id }) => api.delete(`/campaigns/${id}`);
const createTask = async (payload) => api.post(`/tasks`, payload);
const reviewTask = async ({ taskId, action }) => api.patch(`/tasks/${taskId}/review`, { action });
const markRead = async ({ notificationId }) => api.patch(`/tasks/notifications/${notificationId}/read`);
const initiatePaymentOrder = async ({ paymentId }) => { const res = await api.post(`/payments/${paymentId}/order`); return res.data?.data ?? res.data; };
const verifyPaymentSignature = async ({ paymentId, ...payload }) => { const res = await api.post(`/payments/${paymentId}/verify`, payload); return res.data?.data ?? res.data; };
const raiseDispute = async ({ paymentId, ...payload }) => api.post(`/payments/${paymentId}/dispute`, payload);
const trackAnalytics = async () => {};
const checkSubscriptionStatus = async () => {};
const upgradeSubscription = async ({ profileId, packageId, offerId }) => api.post(`/subscriptions`, { profileId, packageId, offerId });

  // State variables for profile form
  const [fullName, setFullName] = useState("");
  const [handle, setHandle] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [companySize, setCompanySize] = useState("");

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

  // State for preferences
  const [niches, setNiches] = useState("");
  const [budget, setBudget] = useState("");
  const [reach, setReach] = useState("");
  const [regions, setRegions] = useState("");

  // Loading / Action states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Campaign Modal / Form states
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [campTitle, setCampTitle] = useState("");
  const [campDescription, setCampDescription] = useState("");
  const [campStartDate, setCampStartDate] = useState("");
  const [campEndDate, setCampEndDate] = useState("");
  const [campCategory, setCampCategory] = useState("");
  const [campLocation, setCampLocation] = useState("Pan India");
  const [campTotalBudget, setCampTotalBudget] = useState("");
  const [campMinBudget, setCampMinBudget] = useState("");
  const [campMaxBudget, setCampMaxBudget] = useState("");
  const [campReels, setCampReels] = useState(0);
  const [campPosts, setCampPosts] = useState(0);
  const [campStories, setCampStories] = useState(0);
  const [campVideos, setCampVideos] = useState(0);
  const [campActive, setCampActive] = useState(true);
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [savingCampaign, setSavingCampaign] = useState(false);
  
  const [showVerificationDialog, setShowVerificationDialog] =
  useState(false);

const [gstNumber, setGstNumber] = useState("");

const [gstCertificateStorageId, setGstCertificateStorageId] =
  useState("");

const [gstFileName, setGstFileName] = useState("");




const [submittingVerification, setSubmittingVerification] =
  useState(false);

  useEffect(() => {
    document.title = "Brand dashboard —  Pravixo";
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setHandle(profile.handle || "");
      setCategory(profile.category || "");
      setLocation(profile.location || "");
      setBio(profile.bio || "");
      setWebsite(profile.website || "");
      setCompanySize(profile.companySize || "");

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

      // Preferences
      setNiches(profile.prefNiches || "");
      setBudget(profile.prefBudget || "");
      setReach(profile.prefReach || "");
      setRegions(profile.prefRegions || "");
    }
  }, [profile]);

  // Handle category and location lists
  const selectedCategories = category
    ? category
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const handleSelectCategory = (val) => {
    let updated = [];
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
    let updated =[];
    if (selectedLocations.includes(val)) {
      updated = selectedLocations.filter((c) => c !== val);
    } else {
      updated = [...selectedLocations, val];
    }
    setLocation(updated.join(", "));
  };

  // Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    try {
      const res = await updateProfile({
        id: profile._id,
        fullName,
        handle: handle || undefined,
        category: category || undefined,
        location: location || undefined,
        bio: bio || undefined,
        website: website || undefined,
        companySize: companySize || undefined,
        // Socials
        instagramHandle: instaHandle || undefined,
        instagramFollowers: instaFollowers,
        facebookHandle: fbHandle || undefined,
        facebookFollowers: fbFollowers,
        linkedinHandle: liHandle || undefined,
        linkedinFollowers: liFollowers,
        youtubeHandle: ytHandle || undefined,
        youtubeFollowers: ytFollowers,
        quoraHandle: quoraHandle || undefined,
        quoraFollowers: quoraFollowers,
        twitterHandle: twHandle || undefined,
        twitterFollowers: twFollowers,
      });
      const updated = res?.data || res?.profile || res;
      if (updated && updateLocalProfile) {
        updateLocalProfile(updated);
      }
      toast.success("Brand profile updated successfully!");
    } catch (err) {
      const error = err ;
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Preferences Save
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSavingPrefs(true);
    try {
      const res = await updateProfile({
        id: profile._id,
        prefNiches: niches,
        prefBudget: budget,
        prefReach: reach,
        prefRegions: regions,
      });
      const updated = res?.data || res?.profile || res;
      if (updated && updateLocalProfile) {
        updateLocalProfile(updated);
      }
      toast.success("Hiring preferences updated successfully!");
    } catch (err) {
      const error = err ;
      toast.error(error.message || "Failed to update preferences");
    } finally {
      setSavingPrefs(false);
    }
  };


  // Image uploads (Avatar, Cover, Portfolio)
  const onAvatarUpload = async (e) => {
    if (!profile || !e.target.files?.length) return;
    const file = e.target.files[0];
    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await api.post(`/profiles/${profile._id}/avatar`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedProfile = res.data?.data || res.data?.profile || res.data;
      if (updatedProfile && updateProfile) {
        updateProfile(updatedProfile);
      }
      toast.success("Brand logo updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
      if (avatarFileRef.current) avatarFileRef.current.value = "";
    }
  };

  const onCoverUpload = async (e) => {
    if (!profile || !e.target.files?.length) return;
    const file = e.target.files[0];

    // Validate image dimensions (1361x450 max)
    const isImageValid = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width > 1361 || img.height > 450) {
          resolve(false);
        } else {
          resolve(true);
        }
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });

    if (!isImageValid) {
      toast.error("Banner size must be 1361x450 pixels or smaller.");
      if (coverFileRef.current) coverFileRef.current.value = "";
      return;
    }

    setUploadingCover(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await api.post(`/profiles/${profile._id}/cover`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedProfile = res.data?.data || res.data?.profile || res.data;
      if (updatedProfile && updateProfile) {
        updateProfile(updatedProfile);
      }
      toast.success("Cover banner updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to upload cover banner");
    } finally {
      setUploadingCover(false);
      if (coverFileRef.current) coverFileRef.current.value = "";
    }
  };

  const onGalleryUpload = async (e) => {
    if (!profile || !e.target.files?.length) return;
    const file = e.target.files[0];
    setUploadingGallery(true);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("profileId", profile._id);
      form.append("sortOrder", String(portfolioImages?.length || 0));
      await api.post("/portfolio", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setGalleryRefreshKey((k) => k + 1);
      toast.success("Gallery image uploaded!");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to upload gallery image");
    } finally {
      setUploadingGallery(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const [gstFile, setGstFile] = useState(null);

  const uploadVerificationFile = (file) => {
    setGstFile(file);
    setGstFileName(file.name);
    setGstCertificateStorageId("selected");
    toast.success(`GST Certificate selected: ${file.name}`);
  };

  const handleVerificationSubmit = async () => {
    if (!profile || !gstNumber || !gstFile) {
      toast.error("Please enter GST number and select GST certificate file.");
      return;
    }

    setSubmittingVerification(true);

    try {
      const form = new FormData();
      form.append("gstCertificate", gstFile);
      form.append("gstNumber", gstNumber);

      const res = await api.post(`/profiles/${profile._id}/kyc-documents`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedProfile = res.data?.data || res.data?.profile || res.data;
      if (updatedProfile && updateProfile) {
        updateProfile(updatedProfile);
      }
      toast.success("Verification documents submitted! Under review.");
      setShowVerificationDialog(false);
      setGstFile(null);
      setGstFileName("");
      setGstCertificateStorageId("");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to submit verification request");
    } finally {
      setSubmittingVerification(false);
    }
  };

  const handleRemoveGalleryImage = async (id) => {
    try {
      await api.delete(`/portfolio/${id}`);
      setGalleryRefreshKey((k) => k + 1);
      toast.success("Gallery image removed");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to remove image");
    }
  };

  // Campaigns Handlers
  const openAddCampaignModal = () => {
    setEditingCampaign(null);
    setCampTitle("");
    setCampDescription("");
    setCampStartDate(new Date().toISOString().split("T")[0]);
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    setCampEndDate(nextMonth.toISOString().split("T")[0]);
    setCampCategory(CATEGORY_OPTIONS[0] || "General");
    setCampLocation("Pan India");
    setCampTotalBudget("");
    setCampMinBudget("");
    setCampMaxBudget("");
    setCampReels(0);
    setCampPosts(0);
    setCampStories(0);
    setCampVideos(0);
    setCampActive(true);
    setIsCampaignModalOpen(true);
  };

  const openEditCampaignModal = (camp) => {
    setEditingCampaign(camp);
    setCampTitle(camp.title || "");
    setCampDescription(camp.description || "");
    setCampStartDate(camp.startDate ? new Date(camp.startDate).toISOString().split("T")[0] : "");
    setCampEndDate(camp.endDate ? new Date(camp.endDate).toISOString().split("T")[0] : "");
    setCampCategory(camp.category || "");
    setCampLocation(camp.location || "Pan India");
    setCampTotalBudget(camp.totalBudget ? String(camp.totalBudget) : "");
    setCampMinBudget(camp.minBudgetPerCreator ? String(camp.minBudgetPerCreator) : "");
    setCampMaxBudget(camp.maxBudgetPerCreator ? String(camp.maxBudgetPerCreator) : "");
    setCampReels(camp.deliverables?.reels || 0);
    setCampPosts(camp.deliverables?.posts || 0);
    setCampStories(camp.deliverables?.stories || 0);
    setCampVideos(camp.deliverables?.videos || 0);
    setCampActive(camp.active !== undefined ? camp.active : true);
    setIsCampaignModalOpen(true);
  };

  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    if (!profile) return;

    if (!campTitle.trim()) {
      toast.error("Campaign name is required");
      return;
    }
    if (!campEndDate) {
      toast.error("End date is required");
      return;
    }
    if (!campTotalBudget || Number(campTotalBudget) <= 0) {
      toast.error("Total campaign budget is required");
      return;
    }

    setSavingCampaign(true);
    try {
      const payload = {
        title: campTitle.trim(),
        description: campDescription.trim(),
        startDate: campStartDate ? new Date(campStartDate).getTime() : Date.now(),
        endDate: new Date(campEndDate).getTime(),
        category: campCategory.trim(),
        location: campLocation.trim(),
        totalBudget: Number(campTotalBudget),
        minBudgetPerCreator: Number(campMinBudget) || 0,
        maxBudgetPerCreator: Number(campMaxBudget) || 0,
        deliverables: {
          reels: Number(campReels) || 0,
          posts: Number(campPosts) || 0,
          stories: Number(campStories) || 0,
          videos: Number(campVideos) || 0,
        },
        active: campActive,
      };

      if (editingCampaign) {
        await updateCampaign({
          id: editingCampaign._id,
          ...payload,
        });
        toast.success("Campaign updated successfully!");
      } else {
        await createCampaign({
          brandId: profile._id,
          ...payload,
        });
        toast.success("Campaign submitted for Admin verification!");
      }
      setIsCampaignModalOpen(false);
      // refetch campaigns
      api.get(`/campaigns/brand/${profile._id}`).then((res) => {
        // query automatically updates on refresh
      }).catch(console.error);
    } catch (err) {
      const e = err?.response?.data?.message || err?.message || "Failed to save campaign";
      toast.error(e);
    } finally {
      setSavingCampaign(false);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await removeCampaign({ id });
      toast.success("Campaign deleted");
    } catch (err) {
      const e = err ;
      toast.error(e.message || "Failed to delete campaign");
    }
  };

  // Reviews Toggles
  const handleToggleVisibility = async (reviewId) => {
    if (!profile) return;
    try {
      const res = await toggleVisibility({
        reviewId,
        creatorId: profile._id,
      });
      if (res.visible) {
        toast.success("Review is now visible on your brand profile");
      } else {
        toast.info("Review is now hidden from your brand profile");
      }
    } catch (err) {
      const e = err ;
      toast.error(e.message || "Failed to update visibility");
    }
  };

  const saved = useMemo(() => {
    if (!favsQuery) return [];
    return favsQuery
      .map((fav) => {
        if (fav.isLive) {
          return {
            id: fav.id,
            name: fav.name,
            avatar: fav.avatar,
            category: fav.category,
            followers: fav.followers,
          };
        } else {
          const staticInf = influencers.find((i) => i.id === fav.id);
          return staticInf
            ? {
                id: staticInf.id,
                name: staticInf.name,
                avatar: staticInf.avatar,
                category: staticInf.category,
                followers: staticInf.followers,
              }
            : null;
        }
      })
      .filter((item) => item !== null);
  }, [favsQuery]);

  const recommendedCreators = useMemo(() => {
    const liveMapped = Array.isArray(allLiveCreators) ? allLiveCreators.map(p => ({
      id: p._id,
      name: p.fullName || p.name,
      avatar: p.avatar,
      category: p.category || "Creator",
      followers: p.followers || "0",
      niches: p.niches || [],
      budget: p.budget || 0,
      region: p.region || "",
    })) : [];

    const allAvailable = [...influencers, ...liveMapped];

    if (!profile) return allAvailable.slice(0, 4);

    const { prefNiches = [], prefRegions = [] } = profile;

    let filtered = allAvailable.filter(c => {
      if (prefNiches.length === 0 && prefRegions.length === 0) return true;
      let matches = false;
      if (prefNiches.length > 0 && Array.isArray(c.niches) && c.niches.some(n => prefNiches.includes(n))) {
         matches = true;
      }
      return matches;
    });

    if (filtered.length === 0) {
      filtered = allAvailable;
    }

    return filtered.slice(0, 4);
  }, [allLiveCreators, profile]);

  const handleRemoveFavorite = async (creatorId) => {
    if (!profile) return;
    try {
      await toggleFavorite({ brandId: profile._id, creatorId });
      toast.success("Removed from favorites");
    } catch (e) {
      toast.error("Failed to remove from favorites");
    }
  };

  const stats = useMemo(() => {
    const totalCamps = campaigns?.length || 0;
    const activeCamps = campaigns?.filter((c) => c.active).length || 0;
    const hiredCount =
      conversations?.filter(
        (c) => c.status === "completed" || c.status === "active",
      ).length || 0;
    return [
      { label: "Campaigns Posted", value: totalCamps.toString() },
      { label: "Creators Hired", value: hiredCount.toString() },
      { label: "Active Campaigns", value: activeCamps.toString() },
      { label: "Success Rate", value: "98%" },
    ];
  }, [campaigns, conversations]);

  const recent = [
    "fashion creators in Mumbai",
    "fitness reels under ₹40,000",
    "tech reviewers 1M+",
    "food bloggers Delhi",
  ];

  const displayName = profile?.fullName || user?.email?.split("@")[0] || "";

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

      {/* COVER BANNER PREVIEW */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="relative aspect-[1361/450] overflow-hidden bg-muted w-full rounded-b-2xl sm:rounded-b-3xl rounded-t-none shadow-sm border border-border/50">
          {resolveImageUrl(profile?.coverUrl) ? (
            <img
              src={resolveImageUrl(profile.coverUrl)}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              Banner Preview
            </div>
          )}
        </section>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8 relative z-30">
        {/* LOGO & BRAND DETAILS HEADER */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left justify-between">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            <div className="-mt-14 sm:-mt-20 relative z-40 flex-shrink-0">
              <img src={
                  resolveImageUrl(profile?.avatarUrl) ||
                  `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.fullName || "brand"}`
                }
                alt=""
                className="h-28 w-28 sm:h-36 sm:w-36 rounded-full border-4 border-background object-cover bg-background shadow-elevated"
               onError={(e) => { e.target.onerror = null; e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback"; }} />
            </div>
            <div className="pb-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="font-display text-2xl font-bold sm:text-3xl text-foreground">
                  {fullName || "Company Name"}
                </h1>
                {profile?.verificationStatus === "verified" && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500 shadow-sm">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                )}
              </div>
              <p className="text-lg font-medium text-muted-foreground/90">
                {handle ? `@${handle.replace("@", "")}` : "@handle"}
              </p>
              {profile && (
                <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                  <Badge variant="secondary" className="rounded-full">
                    {category || "N/A"}
                  </Badge>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" /> {companySize || "N/A"}
                  </span>
                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5" />{" "}
                      {website.replace(/https?:\/\/(www\.)?/, "")}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
  <Link to={`/influencer/${profile?._id}`}>
    <Button
      variant="outline"
      className="rounded-full text-xs font-semibold px-5"
    >
      View Public Profile
    </Button>
  </Link>

  {(() => {
    const status = profile?.verificationStatus;
    if (status === "verified") {
      return (
        <Button className="rounded-full bg-emerald-600 hover:bg-emerald-600 text-white px-6 cursor-default flex items-center gap-1.5 font-semibold">
          <Check className="h-4 w-4" /> Verified
        </Button>
      );
    }
    if (status === "pending") {
      return (
        <Button disabled className="rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 px-6 font-semibold opacity-70">
          Verification Pending
        </Button>
      );
    }
    if (status === "rejected") {
      return (
        <Button
          onClick={() => setShowVerificationDialog(true)}
          className="rounded-full bg-red-600 hover:bg-red-700 text-white px-6 font-semibold shadow-sm"
        >
          Verification Failed (Try Again)
        </Button>
      );
    }
    // Default: unverified
    return (
      <Button
        onClick={() => setShowVerificationDialog(true)}
        className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 font-semibold"
      >
        Get Verified
      </Button>
    );
  })()}
</div>
        </div>

        {/* CONNECTION REQUESTS AT TOP */}
        {pendingRequests && pendingRequests.length > 0 && (
          <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">
                Pending Connection Requests ({pendingRequests.length})
              </h2>
            </div>
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border p-4 bg-secondary/10 hover:bg-secondary/20 transition-all duration-200"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <img src={
                        req.creatorProfile?.avatarUrl ||
                        `https://api.dicebear.com/9.x/avataaars/svg?seed=${req.creatorProfile?.fullName}`
                      }
                      alt=""
                      className="h-12 w-12 rounded-xl object-cover aspect-square border border-border/50 shadow-sm flex-shrink-0"
                     onError={(e) => { e.target.onerror = null; e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback"; }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/influencer/${req.creatorId}`}
                          className="font-display text-sm font-semibold hover:text-primary truncate"
                        >
                          {req.creatorProfile?.fullName}
                        </Link>
                        {req.creatorProfile?.handle && (
                          <span className="text-xs text-muted-foreground font-medium">
                            {req.creatorProfile.handle}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          · {new Date(req.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[11px] text-muted-foreground">
                        <span><strong>Followers:</strong> {req.creatorProfile?.followersCount?.toLocaleString() || "0"}</span>
                        <span>·</span>
                        <span><strong>Platform:</strong> {req.creatorProfile?.platformStr || "Instagram"}</span>
                        <span>·</span>
                        <span><strong>Category:</strong> {req.creatorProfile?.category || "N/A"}</span>
                      </div>
                      {req.campaign && (
                        <div className="mt-2 text-xs bg-background border border-border/40 rounded-xl px-3 py-2">
                          <span className="font-semibold text-foreground block truncate">Campaign: {req.campaign.title}</span>
                          <span className="text-[11px] text-muted-foreground">Budget: {req.campaign.budget} · Status: <span className="capitalize">{req.status}</span></span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground/95 bg-background border border-border/40 rounded-xl p-2.5 mt-2 italic line-clamp-3">
                        "{req.pitch}"
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 flex-shrink-0 self-stretch sm:justify-center">
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-initial rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 px-4 h-9 flex items-center justify-center gap-1.5"
                      onClick={async () => {
                        try {
                          await acceptConnection({ connectionId: req._id });
                          toast.success(
                            `Connected with ${req.creatorProfile?.fullName}!`,
                          );
                        } catch (err) {
                          toast.error("Failed to accept request");
                        }
                      }}
                    >
                      <Check className="h-4 w-4" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-initial rounded-full border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 px-4 h-9 flex items-center justify-center gap-1.5"
                      onClick={async () => {
                        try {
                          await rejectConnection({ connectionId: req._id });
                          toast.success("Request declined");
                        } catch (err) {
                          toast.error("Failed to decline request");
                        }
                      }}
                    >
                      <X className="h-4 w-4" /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPROVED COLLABORATIONS */}
        {approvedCollabs && approvedCollabs.length > 0 && (
          <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h2 className="font-display text-lg font-semibold">
                Approved Collaborations ({approvedCollabs.length})
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {approvedCollabs.map((collab) => (
                <div
                  key={collab._id}
                  className="rounded-2xl border border-border p-4 bg-secondary/10 hover:bg-secondary/20 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={
                          collab.creatorProfile?.avatarUrl ||
                          `https://api.dicebear.com/9.x/avataaars/svg?seed=${collab.creatorProfile?.fullName}`
                        }
                        alt=""
                        className="h-10 w-10 rounded-xl object-cover border border-border/50 shadow-sm shrink-0"
                       onError={(e) => { e.target.onerror = null; e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback"; }} />
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/influencer/${collab.creatorId}`}
                          className="font-display text-sm font-semibold hover:text-primary truncate block"
                        >
                          {collab.creatorProfile?.fullName}
                        </Link>
                        {collab.creatorProfile?.handle && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            {collab.creatorProfile.handle}
                          </p>
                        )}
                      </div>
                    </div>
                    {collab.campaign && (
                      <div className="text-xs bg-background border border-border/40 rounded-xl p-3 space-y-1">
                        <div className="font-semibold text-foreground truncate">
                          {collab.campaign.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Budget: {collab.campaign.budget}
                        </div>
                      </div>
                    )}

                    {/* Collaboration Payment Status & Details */}
                    <div className="rounded-xl border border-border/60 bg-background/50 p-3 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Payment Status:</span>
                        {collab.paymentStatus === "PAID" ? (
                          <span className="font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                            ✓ PAID (Payment Successful)
                          </span>
                        ) : collab.paymentStatus === "FAILED" ? (
                          <span className="font-bold text-red-600 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full text-[10px]">
                            Payment Failed
                          </span>
                        ) : collab.collaborationStatus === "AMOUNT_AGREED" ? (
                          <span className="font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px]">
                            Payment Pending
                          </span>
                        ) : (
                          <span className="font-semibold text-muted-foreground text-[11px]">
                            Negotiating ({collab.proposedAmount > 0 ? `₹${collab.proposedAmount.toLocaleString()}` : "Pending offer"})
                          </span>
                        )}
                      </div>

                      {collab.collaborationStatus === "AMOUNT_AGREED" && (
                        <div className="pt-2 border-t border-border/40 space-y-1 text-[11px]">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Creator Payment:</span>
                            <span className="font-medium text-foreground">₹{collab.creatorAmount?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Pravixo Fee (20%):</span>
                            <span className="font-medium text-foreground">₹{collab.pravixoFee?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs pt-1 border-t border-border/30">
                            <span className="font-bold text-foreground">Total Payable:</span>
                            <span className="font-bold text-primary">₹{collab.brandTotal?.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      {/* Task 5: Campaign Deliverables Tracking for Brand */}
                      {collab.deliverablesTracking && collab.deliverablesTracking.length > 0 && (
                        <div className="pt-2.5 border-t border-border/40 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[10px] text-foreground uppercase tracking-wider">
                              Deliverables Progress
                            </span>
                            {collab.paymentStatus === "PAID" ? (
                              (() => {
                                const totalReq = collab.deliverablesTracking.reduce((acc, d) => acc + (d.requiredQuantity || 0), 0);
                                const totalComp = collab.deliverablesTracking.reduce((acc, d) => acc + (d.completedQuantity || 0), 0);
                                const pct = totalReq > 0 ? Math.round((totalComp / totalReq) * 100) : 0;
                                return (
                                  <span className="text-[10px] font-bold text-primary">
                                    {totalComp}/{totalReq} ({pct}%)
                                  </span>
                                );
                              })()
                            ) : (
                              <span className="text-[9px] text-amber-600 font-medium">
                                Unlocked after payment
                              </span>
                            )}
                          </div>

                              <div className="grid grid-cols-2 gap-1.5">
                            {collab.deliverablesTracking.map((deliv, dIdx) => {
                              const typeLabels = {
                                REEL: "Reels",
                                POST: "Posts",
                                STORY: "Stories",
                                VIDEO: "Videos",
                              };
                              return (
                                <div
                                  key={dIdx}
                                  className={cn(
                                    "flex items-center justify-between rounded-lg px-2 py-1 text-[10px] border",
                                    collab.paymentStatus === "PAID"
                                      ? "bg-secondary/40 border-border/60"
                                      : "bg-muted/20 border-border/30 opacity-70"
                                  )}
                                >
                                  <span className="font-medium text-foreground">
                                    {typeLabels[deliv.type] || deliv.type}
                                  </span>
                                  <span className="font-bold text-primary">
                                    {deliv.completedQuantity || 0} / {deliv.requiredQuantity}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Task 6, 7, 9, 10: View Submissions Button & 72-Hour Status for Brand */}
                          {collab.paymentStatus === "PAID" && (
                            <div className="pt-1 space-y-1.5">
                              {(() => {
                                const allCompleted =
                                  collab.allDeliverablesCompleted ||
                                  collab.deliverablesTracking.every(
                                    (d) => (d.completedQuantity || 0) >= (d.requiredQuantity || 1)
                                  );

                                if (allCompleted) {
                                  const isReleased = collab.paymentReleaseStatus === "RELEASED";
                                  const nowTime = Date.now();
                                  const targetEligible =
                                    collab.paymentReleaseEligibleAt ||
                                    (collab.approvalCompletedAt ? collab.approvalCompletedAt + 72 * 60 * 60 * 1000 : null);
                                  const isEligible = targetEligible ? nowTime >= targetEligible : false;

                                  return (
                                    <div className="rounded-xl border border-border/60 bg-secondary/20 p-2 text-[10px] space-y-1">
                                      <div className="flex items-center justify-between font-bold">
                                        <span className="text-muted-foreground uppercase text-[9px] tracking-wider flex items-center gap-1">
                                          <Clock className="h-3 w-3 text-primary" /> Payout & Review Status
                                        </span>
                                        {isReleased ? (
                                          <span className="text-emerald-600 font-bold">✓ Creator Payout Released</span>
                                        ) : isEligible ? (
                                          <span className="text-emerald-600 font-bold">✓ Review Period Completed</span>
                                        ) : (
                                          <span className="text-amber-600 font-bold">⏳ Active Review Period</span>
                                        )}
                                      </div>
                                      <p className="text-muted-foreground text-[10px]">
                                        {isReleased ? (
                                          <span className="text-emerald-700 font-semibold block">
                                            Creator payout of ₹{collab.creatorAmount?.toLocaleString()} has been released by Admin. Collaboration completed.
                                          </span>
                                        ) : isEligible ? (
                                          <span className="text-foreground">
                                            All deliverables approved. Payment is now eligible for Admin release.
                                          </span>
                                        ) : targetEligible ? (
                                          <span>
                                            Funds secured in escrow. Review period ends: <strong>{new Date(targetEligible).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</strong>
                                          </span>
                                        ) : (
                                          <span>72-hour review period active. Funds held safely in escrow.</span>
                                        )}
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              })()}

                              {(() => {
                                const submittedCount = collab.deliverablesTracking.reduce(
                                  (sum, d) => sum + (d.completedQuantity || 0),
                                  0
                                );
                                return (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full h-8 rounded-full border-primary/30 text-primary hover:bg-primary/10 text-[10px] font-bold flex items-center justify-center gap-1.5"
                                    onClick={async () => {
                                      setSelectedCollabForSubmissions(collab);
                                      setLoadingSubmissions(true);
                                      try {
                                        const res = await api.get(`/api/submissions/${collab._id}/submissions`);
                                        const data = res.data?.data || res.data;
                                        setCollabSubmissionsList(data.submissions || []);
                                      } catch (err) {
                                        console.error("Fetch submissions error:", err);
                                        toast.error(err?.response?.data?.message || "Failed to load submissions.");
                                      } finally {
                                        setLoadingSubmissions(false);
                                      }
                                    }}
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    {submittedCount > 0
                                      ? `View Submitted Deliverables (${submittedCount})`
                                      : "View Submissions"}
                                  </Button>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs border-t border-border/40 pt-2.5">
                      <span className="text-muted-foreground">Chat Status:</span>
                      <span className="capitalize font-semibold text-emerald-600">{collab.conversationStatus}</span>
                    </div>

                    {/* Task Info */}
                    {(() => {
                      const task = brandTasks?.find(t => t.creatorId === collab.creatorId && t.campaignId === collab.campaignId);
                      if (!task) return null;
                      return (
                        <div className="text-xs bg-background border border-border/40 rounded-xl p-3 space-y-1 mt-2">
                          <div className="font-semibold text-foreground flex items-center justify-between gap-1">
                            <span className="truncate">Task: {task.title}</span>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "rounded-full text-[8px] px-1.5 uppercase font-bold shrink-0",
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
                          {(task.status === "in_progress" || task.status === "revision_requested") && (
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                              <span>Time Left:</span>
                              <CountdownTimer dueDate={task.dueDate} />
                            </div>
                          )}
                          {task.status === "assigned" && (
                            <p className="text-[10px] text-amber mt-1 italic">
                              Awaiting Creator to Start
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  {(() => {
                    const task = brandTasks?.find(t => t.creatorId === collab.creatorId && t.campaignId === collab.campaignId);
                    return (
                      <div className="mt-4 flex flex-col gap-2">
                        {/* Direct Pay Pravixo button on Brand Dashboard */}
                        {collab.collaborationStatus === "AMOUNT_AGREED" && collab.paymentStatus !== "PAID" && (
                          <Button
                            size="sm"
                            className="w-full rounded-full gradient-sunset border-0 text-white shadow-glow text-xs h-9 font-bold flex items-center justify-center gap-1.5"
                            disabled={payingId === collab._id}
                            onClick={async () => {
                              setPayingId(collab._id);
                              try {
                                const res = await api.post(`/api/payments/collaboration/${collab._id}/order`);
                                const orderData = res.data?.data || res.data;

                                const options = {
                                  key: orderData.key || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                                  amount: orderData.amount,
                                  currency: orderData.currency || "INR",
                                  name: "Pravixo Platform",
                                  description: `Payment for Collaboration (${collab.campaign?.title || "Campaign"})`,
                                  order_id: orderData.orderId,
                                  handler: async (response) => {
                                    try {
                                      setPayingId(collab._id);
                                      await api.post(`/api/payments/collaboration/${collab._id}/verify`, {
                                        gatewayOrderId: response.razorpay_order_id,
                                        gatewayPaymentId: response.razorpay_payment_id,
                                        gatewaySignature: response.razorpay_signature,
                                      });
                                      toast.success("Payment successful! Funds secured with Pravixo.");
                                      setRequestsRefreshKey((k) => k + 1);
                                    } catch (err) {
                                      toast.error(err?.response?.data?.message || err.message || "Payment verification failed.");
                                    } finally {
                                      setPayingId(null);
                                    }
                                  },
                                  prefill: {
                                    name: profile?.fullName || "",
                                    email: profile?.email || "",
                                    contact: profile?.phone || "",
                                  },
                                  theme: {
                                    color: "#EC4899",
                                  },
                                  modal: {
                                    ondismiss: () => {
                                      setPayingId(null);
                                      toast.info("Payment window closed.");
                                    },
                                  },
                                };

                                if (!window.Razorpay) {
                                  const script = document.createElement("script");
                                  script.src = "https://checkout.razorpay.com/v1/checkout.js";
                                  script.onload = () => {
                                    const rzp = new window.Razorpay(options);
                                    rzp.open();
                                  };
                                  document.body.appendChild(script);
                                } else {
                                  const rzp = new window.Razorpay(options);
                                  rzp.open();
                                }
                              } catch (e) {
                                toast.error(e?.response?.data?.message || e.message || "Failed to initiate payment.");
                                setPayingId(null);
                              }
                            }}
                          >
                            <CreditCard className="h-4 w-4" />
                            {payingId === collab._id ? "Processing..." : `Pay Pravixo ₹${collab.brandTotal?.toLocaleString()}`}
                          </Button>
                        )}

                        <div className="flex gap-2">
                          {collab.conversationId && (
                            <Link
                              to={`/messages?conversationId=${collab.conversationId}`}
                              className="flex-1"
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full rounded-full border-border hover:bg-secondary text-xs h-9 font-semibold"
                              >
                                Open Chat
                              </Button>
                            </Link>
                          )}
                          
                          {!task ? (
                            <Button
                              size="sm"
                              className="flex-1 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs h-9 font-semibold"
                              onClick={() => {
                                setSelectedCollabForTask(collab);
                                setTaskTitle("");
                                setTaskDesc("");
                                setTaskDeliverables("");
                                setTaskDueDate("");
                                setTaskDueTime("23:59");
                                setTaskPriority("medium");
                                setTaskNotes("");
                              }}
                            >
                              Assign Task
                            </Button>
                          ) : task.status === "completed" ? (
                            <Button
                              size="sm"
                              className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-xs h-9 font-semibold"
                              onClick={() => {
                                setSelectedTaskForReview(task);
                              }}
                            >
                              Review
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        )}

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

          {/* Quick Sub-Section Navigator to eliminate scrolling */}
          {activeTab === "dashboard" && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 rounded-2xl bg-secondary/30 border border-border/40 no-scrollbar">
              <span className="text-[10px] font-bold text-muted-foreground/80 px-2.5 uppercase tracking-wider hidden sm:inline">
                Jump to:
              </span>
              {[
                { id: "all", label: "✨ All" },
                { id: "profile", label: "🏢 Profile" },
                { id: "campaigns", label: "📢 Campaigns" },
                { id: "escrow", label: "💳 Escrow & Pay" },
                { id: "preferences", label: "🎯 Preferences" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setBrandSubSection(tab.id)}
                  className={cn(
                    "pill-cute px-3 py-1.5 text-xs font-semibold whitespace-nowrap",
                    brandSubSection === tab.id
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

        {/* MAIN TAB CONTENT */}
        <div className="mt-6 w-full min-w-0">
          {activeTab === "dashboard" ? (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 items-start w-full min-w-0 font-jakarta">
              {/* LEFT COLUMN: EDIT SECTIONS */}
              <div className="space-y-6 lg:col-span-2 w-full min-w-0">
            {/* STATS PREVIEW CARDS */}
            {(brandSubSection === "all" || brandSubSection === "profile") && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {stats.map((s) => {
                  const isClickable =
                    s.label === "Creators Hired" ||
                    s.label === "Campaigns Posted" ||
                    s.label === "Active Campaigns";

                  const handleClick = () => {
                    if (s.label === "Creators Hired") {
                      setHiredCreatorsModalOpen(true);
                    } else if (s.label === "Campaigns Posted") {
                      setCampaignFilterStatus("ALL");
                      setBrandSubSection("campaigns");
                      setTimeout(() => {
                        const el = document.getElementById("brand-campaigns-section");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 100);
                    } else if (s.label === "Active Campaigns") {
                      setCampaignFilterStatus("ACTIVE");
                      setBrandSubSection("campaigns");
                      setTimeout(() => {
                        const el = document.getElementById("brand-campaigns-section");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 100);
                    }
                  };

                  return (
                    <div
                      key={s.label}
                      onClick={isClickable ? handleClick : undefined}
                      className={cn(
                        "stat-card-3d flex h-28 flex-col items-center justify-center rounded-3xl border border-border/60 bg-gradient-to-b from-card to-card/70 p-4 text-center shadow-soft transition-all duration-200",
                        isClickable &&
                          "cursor-pointer hover:border-primary/50 hover:shadow-glow hover:-translate-y-1 group active:scale-95"
                      )}
                      title={
                        isClickable
                          ? `Click to view ${s.label.toLowerCase()}`
                          : undefined
                      }
                    >
                      <div className="font-outfit text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {s.value}
                      </div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1.5 font-jakarta flex items-center gap-1 group-hover:text-foreground">
                        {s.label}
                        {isClickable && (
                          <span className="text-primary text-[10px] opacity-70 group-hover:opacity-100 font-normal">
                            ↗
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* BRAND PROFILE FORM */}
            {(brandSubSection === "all" || brandSubSection === "profile") && (
            <>
            <div className="card-3d rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <h2 className="font-outfit text-xl font-bold mb-5 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Edit Brand Details
              </h2>

              <div className="mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img src={
                      resolveImageUrl(profile?.avatarUrl) ||
                      `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.fullName || user?.email || "brand"}`
                    }
                    alt=""
                    className="h-20 w-20 rounded-full border border-border object-cover bg-muted"
                   onError={(e) => { e.target.onerror = null; e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback"; }} />
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary">
                      <Camera className="h-4 w-4" />
                      {uploadingAvatar ? "Uploading..." : "Upload logo"}
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

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="fullName">Company Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Nike India"
                      className="mt-1.5 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="handle">Handle</Label>
                    <Input
                      id="handle"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="e.g., nikeindia"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>

                  {/* CATEGORY & LOCATION POPOVER SELECTORS */}
                  <div className="flex flex-col gap-1.5">
                    <Label>Industry Category</Label>
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
                                    className="rounded-full p-0.5 hover:bg-muted cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectCategory(cat);
                                    }}
                                  >
                                    <X className="h-3 w-3 text-muted-foreground" />
                                  </span>
                                </Badge>
                              ))
                            )}
                          </div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search categories..."
                            className="h-9"
                          />
                          <CommandList className="max-h-[200px] overflow-y-auto">
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup>
                              {CATEGORY_OPTIONS.map((cat) => {
                                const isSelected =
                                  selectedCategories.includes(cat);
                                return (
                                  <CommandItem
                                    key={cat}
                                    onSelect={() => handleSelectCategory(cat)}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <div
                                      className={cn(
                                        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                        isSelected
                                          ? "bg-primary text-primary-foreground"
                                          : "opacity-50",
                                      )}
                                    >
                                      {isSelected && (
                                        <Check className="h-3 w-3" />
                                      )}
                                    </div>
                                    {cat}
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
                    <Label>HQ Location</Label>
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
                                    className="rounded-full p-0.5 hover:bg-muted cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectLocation(loc);
                                    }}
                                  >
                                    <X className="h-3 w-3 text-muted-foreground" />
                                  </span>
                                </Badge>
                              ))
                            )}
                          </div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search locations..."
                            className="h-9"
                          />
                          <CommandList className="max-h-[200px] overflow-y-auto">
                            <CommandEmpty>No location found.</CommandEmpty>
                            <CommandGroup>
                              {LOCATION_OPTIONS.map((loc) => {
                                const isSelected =
                                  selectedLocations.includes(loc);
                                return (
                                  <CommandItem
                                    key={loc}
                                    onSelect={() => handleSelectLocation(loc)}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <div
                                      className={cn(
                                        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                        isSelected
                                          ? "bg-primary text-primary-foreground"
                                          : "opacity-50",
                                      )}
                                    >
                                      {isSelected && (
                                        <Check className="h-3 w-3" />
                                      )}
                                    </div>
                                    {loc}
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
                    <Label htmlFor="website">Website Link</Label>
                    <Input
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="e.g., https://www.nike.com/in"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="companySize">Company Size</Label>
                    <select
                      id="companySize"
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring mt-1.5 rounded-xl cursor-pointer"
                    >
                      <option value="">Select size...</option>
                      {COMPANY_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">About Brand</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Provide a detailed description of your brand, values, and products..."
                    className="mt-1.5 rounded-xl resize-none"
                    rows={4}
                  />
                </div>

                <div className="pt-4 border-t border-border/40">
                  <h3 className="font-display text-base font-semibold">
                    KYC Documents
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Update your GST Number and Certificate for verification.
                  </p>
                  <div className="grid gap-6 sm:grid-cols-2 bg-muted/10 p-4 rounded-2xl border border-border">
                    <div className="space-y-2">
                      <Label htmlFor="gstNumberInline" className="text-sm font-semibold">GST Number</Label>
                      <Input
                        id="gstNumberInline"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        placeholder="Enter GST Number"
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">GST Certificate (PDF, JPG, PNG)</Label>
                      <div className="flex items-center gap-3">
                        <label className="flex-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 hover:bg-secondary/40 px-4 py-3 text-sm font-medium transition-colors">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground truncate">
                            {gstFileName || (profile?.gstCertificateUrl ? "Certificate Uploaded ✓" : "Upload File")}
                          </span>
                          <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => { if (e.target.files?.length) uploadVerificationFile(e.target.files[0]); }} />
                        </label>
                        {(profile?.gstCertificateUrl || gstFile) && (
                          <Button type="button" variant="outline" size="icon" className="shrink-0 h-12 w-12 rounded-xl"
                            onClick={() => profile?.gstCertificateUrl ? window.open(resolveImageUrl(profile.gstCertificateUrl), "_blank") : toast.info("File selected but not yet uploaded")}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="sm:col-span-2 flex justify-end">
                      <Button onClick={handleVerificationSubmit} disabled={submittingVerification || (!gstNumber && !gstFile)} className="rounded-full bg-primary text-primary-foreground px-6 font-semibold">
                        {submittingVerification ? "Uploading..." : "Save Documents & Request Verification"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40">
                  <h3 className="font-display text-base font-semibold">
                    Social Presence
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Update your company's social handles and follower counts
                    manually.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <div className="space-y-3 rounded-2xl border border-border p-4 bg-secondary/10">
                      <div className="flex items-center gap-2">
                        <FaInstagram className="h-4 w-4 text-pink-600" />
                        <span className="text-sm font-semibold">Instagram</span>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Handle
                        </Label>
                        <Input
                          value={instaHandle}
                          onChange={(e) => setInstaHandle(e.target.value)}
                          placeholder="@username"
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Followers
                        </Label>
                        <Input
                          type="number"
                          value={instaFollowers}
                          onChange={(e) =>
                            setInstaFollowers(Number(e.target.value))
                          }
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-border p-4 bg-secondary/10">
                      <div className="flex items-center gap-2">
                        <FaFacebook className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold">Facebook</span>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Handle
                        </Label>
                        <Input
                          value={fbHandle}
                          onChange={(e) => setFbHandle(e.target.value)}
                          placeholder="username"
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Followers
                        </Label>
                        <Input
                          type="number"
                          value={fbFollowers}
                          onChange={(e) =>
                            setFbFollowers(Number(e.target.value))
                          }
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-border p-4 bg-secondary/10">
                      <div className="flex items-center gap-2">
                        <FaLinkedin className="h-4 w-4 text-blue-800" />
                        <span className="text-sm font-semibold">LinkedIn</span>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Handle
                        </Label>
                        <Input
                          value={liHandle}
                          onChange={(e) => setLiHandle(e.target.value)}
                          placeholder="in/username"
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Followers
                        </Label>
                        <Input
                          type="number"
                          value={liFollowers}
                          onChange={(e) =>
                            setLiFollowers(Number(e.target.value))
                          }
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-border p-4 bg-secondary/10">
                      <div className="flex items-center gap-2">
                        <FaYoutube className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-semibold">YouTube</span>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Handle
                        </Label>
                        <Input
                          value={ytHandle}
                          onChange={(e) => setYtHandle(e.target.value)}
                          placeholder="@username"
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Followers
                        </Label>
                        <Input
                          type="number"
                          value={ytFollowers}
                          onChange={(e) =>
                            setYtFollowers(Number(e.target.value))
                          }
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-border p-4 bg-secondary/10">
                      <div className="flex items-center gap-2">
                        <QuoraIcon className="h-4 w-4 text-red-700" />
                        <span className="text-sm font-semibold">Quora</span>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Handle
                        </Label>
                        <Input
                          value={quoraHandle}
                          onChange={(e) => setQuoraHandle(e.target.value)}
                          placeholder="username"
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Followers
                        </Label>
                        <Input
                          type="number"
                          value={quoraFollowers}
                          onChange={(e) =>
                            setQuoraFollowers(Number(e.target.value))
                          }
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-border p-4 bg-secondary/10">
                      <div className="flex items-center gap-2">
                        <FaTwitter className="h-4 w-4 text-sky-500" />
                        <span className="text-sm font-semibold">
                          X / Twitter
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Handle
                        </Label>
                        <Input
                          value={twHandle}
                          onChange={(e) => setTwHandle(e.target.value)}
                          placeholder="@username"
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Followers
                        </Label>
                        <Input
                          type="number"
                          value={twFollowers}
                          onChange={(e) =>
                            setTwFollowers(Number(e.target.value))
                          }
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={savingProfile}
                    className="btn-bouncy rounded-full gradient-sunset border-0 text-white shadow-glow px-7 font-bold text-xs h-10"
                  >
                    {savingProfile ? "Saving Details..." : "Save Details"}
                  </Button>
                </div>
              </form>
            </div>

            {/* BRAND GALLERY */}
            <div className="card-3d rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <h2 className="font-outfit text-xl font-bold mb-2">
                Brand Gallery
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Showcase products, campaign banners, teams, or advertisements.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(portfolioImages || []).map((img) => {
                  const imageSrc = resolveImageUrl(img.url || img.imageUrl);
                  return (
                    <div
                      key={img._id}
                      className="group relative aspect-square overflow-hidden rounded-2xl border border-border/70 hover:shadow-md transition-all"
                    >
                      {imageSrc && (
                        <img
                          src={imageSrc}
                          alt="Gallery"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(img._id)}
                        className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 opacity-0 shadow-soft transition-opacity group-hover:opacity-100 hover:scale-110"
                        title="Delete image"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  );
                })}
                <label className="btn-bouncy flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border/80 text-xs font-semibold text-muted-foreground hover:bg-secondary/70 hover:border-primary/50 transition-all">
                  <Upload className="h-5 w-5 text-primary" />
                  {uploadingGallery ? "Uploading…" : "Add Image"}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onGalleryUpload}
                    disabled={uploadingGallery}
                  />
                </label>
              </div>
            </div>

            {/* RECOMMENDED CREATORS */}
            <div className="card-3d rounded-3xl border border-border/60 bg-card p-6 shadow-sm mb-6">
              <div className="mb-4">
                <h2 className="font-outfit text-xl font-bold flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" /> Recommended Creators
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Creators curated for you based on your Hiring Preferences.
                </p>
              </div>
              
              {recommendedCreators.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-2xl">
                  No creators found matching your preferences.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {recommendedCreators.map((creator) => (
                    <div
                      key={creator.id}
                      className="card-3d flex items-center justify-between rounded-2xl border border-border/60 bg-background/80 p-3.5 hover:border-primary/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full border border-border">
                          <img src={
                              creator.avatar?.startsWith("http")
                                ? creator.avatar
                                : creator.avatar
                                ? `${
                                    import.meta.env.VITE_API_URL ||
                                    "http://localhost:5000"
                                  }/uploads/${creator.avatar}`
                                : `https://api.dicebear.com/9.x/avataaars/svg?seed=${creator.id}`
                            }
                            alt={creator.name}
                            className="h-full w-full object-cover"
                           onError={(e) => { e.target.onerror = null; e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback"; }} />
                        </div>
                        <div>
                          <p className="font-outfit text-sm font-bold text-foreground">
                            {creator.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {creator.category} • {creator.followers}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="btn-bouncy h-7 rounded-full text-[10px] px-3 font-bold"
                        onClick={() => navigate(`/influencer/${creator.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

            {/* OPEN CAMPAIGNS */}
            {(brandSubSection === "all" || brandSubSection === "campaigns") && (
            <div id="brand-campaigns-section" className="card-3d rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div>
                  <h2 className="font-outfit text-xl font-bold">
                    Open Campaigns
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Create and manage active campaign listings visible to creators.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="btn-bouncy rounded-full gradient-sunset border-0 text-white shadow-glow text-xs h-9 px-4 font-bold flex items-center gap-1.5 self-start sm:self-auto"
                  onClick={openAddCampaignModal}
                >
                  <Plus className="h-4 w-4" /> Create Campaign
                </Button>
              </div>

              {/* Status Filter Tabs (All / Active / Inactive) */}
              <div className="flex items-center gap-1.5 mt-3 mb-4 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: "ALL", label: "All Campaigns", count: brandCampaigns?.length || 0 },
                  { id: "ACTIVE", label: "Active", count: brandCampaigns?.filter((c) => c.active).length || 0 },
                  { id: "INACTIVE", label: "Inactive", count: brandCampaigns?.filter((c) => !c.active).length || 0 },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCampaignFilterStatus(f.id)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
                      campaignFilterStatus === f.id
                        ? "bg-primary text-primary-foreground shadow-xs ring-1 ring-primary/30"
                        : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/40"
                    )}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-muted-foreground/80 mb-5">
                Note: Created campaigns undergo a short Admin Verification before becoming visible to creators.
              </p>

              {!brandCampaigns ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Loading campaigns...
                </div>
              ) : (() => {
                const displayedCampaigns = brandCampaigns.filter((c) => {
                  if (campaignFilterStatus === "ACTIVE") return Boolean(c.active);
                  if (campaignFilterStatus === "INACTIVE") return !c.active;
                  return true;
                });

                if (displayedCampaigns.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-10 text-center">
                      <Megaphone className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="font-semibold text-sm text-foreground font-outfit">
                        {campaignFilterStatus === "ACTIVE"
                          ? "No active campaigns found"
                          : campaignFilterStatus === "INACTIVE"
                          ? "No inactive campaigns found"
                          : "No campaigns created yet"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                        {campaignFilterStatus === "ACTIVE"
                          ? "None of your campaigns are currently marked as active."
                          : "Create your first campaign listing to attract creators and receive proposals."}
                      </p>
                      <Button
                        size="sm"
                        className="btn-bouncy mt-4 rounded-full gradient-sunset border-0 text-white shadow-glow text-xs font-bold px-4"
                        onClick={openAddCampaignModal}
                      >
                        Create Campaign
                      </Button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {displayedCampaigns.map((camp) => (
                    <div
                      key={camp._id}
                      className="card-3d rounded-2xl border border-border/60 bg-background/70 p-4 transition-all hover:border-primary/40"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-outfit text-base font-bold text-foreground">
                              {camp.title}
                            </h3>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "rounded-full text-[10px] uppercase px-2 py-0.5 font-bold",
                                camp.status === "APPROVED" && "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
                                camp.status === "PENDING_VERIFICATION" && "bg-amber/10 text-amber border border-amber/20",
                                camp.status === "REJECTED" && "bg-red-500/10 text-red-500 border border-red-500/20"
                              )}
                            >
                              {camp.status === "PENDING_VERIFICATION"
                                ? "Under Review"
                                : camp.status}
                            </Badge>
                            {camp.active ? (
                              <Badge variant="outline" className="rounded-full text-[10px] text-emerald-600 border-emerald-600/30">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="rounded-full text-[10px] text-muted-foreground">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {camp.description}
                          </p>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-xs font-bold text-primary font-outfit">
                            ₹{camp.totalBudget?.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            Total Budget
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                        <div>
                          <span className="block font-semibold text-foreground font-outfit">
                            {camp.category || "General"}
                          </span>
                          Category
                        </div>
                        <div>
                          <span className="block font-semibold text-foreground font-outfit">
                            {camp.location || "Pan India"}
                          </span>
                          Location
                        </div>
                        <div>
                          <span className="block font-semibold text-foreground font-outfit">
                            ₹{camp.minBudgetPerCreator?.toLocaleString()} - ₹{camp.maxBudgetPerCreator?.toLocaleString()}
                          </span>
                          Per Creator
                        </div>
                        <div>
                          <span className="block font-semibold text-foreground font-outfit">
                            {camp.endDate ? new Date(camp.endDate).toLocaleDateString() : "No deadline"}
                          </span>
                          End Date
                        </div>
                      </div>

                      {/* Deliverables summary */}
                      <div className="mt-2.5 pt-2 border-t border-border/30">
                        {camp.deliverables && (
                          <div className="flex flex-wrap gap-1.5 text-[10px]">
                            {camp.deliverables.reels > 0 && (
                              <span className="bg-secondary/60 px-2 py-0.5 rounded-full border border-border/40">
                                {camp.deliverables.reels} Reels
                              </span>
                            )}
                            {camp.deliverables.posts > 0 && (
                              <span className="bg-secondary/60 px-2 py-0.5 rounded-full border border-border/40">
                                {camp.deliverables.posts} Posts
                              </span>
                            )}
                            {camp.deliverables.stories > 0 && (
                              <span className="bg-secondary/60 px-2 py-0.5 rounded-full border border-border/40">
                                {camp.deliverables.stories} Stories
                              </span>
                            )}
                            {camp.deliverables.videos > 0 && (
                              <span className="bg-secondary/60 px-2 py-0.5 rounded-full border border-border/40">
                                {camp.deliverables.videos} Videos
                              </span>
                            )}
                          </div>
                        )}
                        {camp.status === "REJECTED" && camp.verificationFeedback && (
                          <p className="text-[11px] text-red-500 bg-red-500/10 p-2 rounded-lg mt-2">
                            Reason: {camp.verificationFeedback}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-2 border-t border-border/40 justify-between">
                        {(() => {
                          const reqsCount = (pendingRequests || []).filter(
                            (r) => String(r.campaignId?._id || r.campaignId) === String(camp._id)
                          ).length;
                          return (
                            <Button
                              size="sm"
                              variant={reqsCount > 0 ? "default" : "outline"}
                              className={cn(
                                "btn-bouncy h-8 rounded-full text-xs px-3.5 flex items-center gap-1.5 font-bold",
                                reqsCount > 0
                                  ? "gradient-sunset border-0 text-white shadow-glow"
                                  : "border-border text-muted-foreground hover:text-foreground"
                              )}
                              onClick={() => setSelectedCampaignForRequests(camp)}
                            >
                              <Users className="h-3.5 w-3.5" />
                              Requests {reqsCount > 0 && <span className="ml-0.5 px-1.5 py-0.2 bg-white text-black rounded-full text-[10px] font-bold">{reqsCount}</span>}
                            </Button>
                          );
                        })()}

                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="btn-bouncy h-8 rounded-full text-xs hover:bg-secondary px-3 flex items-center gap-1.5 font-semibold"
                            onClick={() => openEditCampaignModal(camp)}
                          >
                            <Edit2 className="h-3 w-3" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="btn-bouncy h-8 rounded-full text-xs text-destructive hover:bg-destructive/10 hover:text-destructive px-3 flex items-center gap-1.5 font-semibold"
                            onClick={() => handleDeleteCampaign(camp._id)}
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                );
              })()}
            </div>
            )}

            {/* BRAND OFFERS & INCENTIVES LAUNCH */}
            {(brandSubSection === "all" || brandSubSection === "campaigns") && (
              <MultiRoleOfferForm profileId={profile?._id} role="brand" />
            )}

            {/* ESCROW PAYMENTS */}
            {(brandSubSection === "all" || brandSubSection === "escrow") && (
            <div className="card-3d rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <div>
                <h2 className="font-outfit text-xl font-bold">
                  Escrow Payments
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 mb-4">
                  Manage campaign milestones, pay invoices, or flag dispute requests.
                </p>
              </div>

              {!brandPayments ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Loading payments...
                </div>
              ) : brandPayments.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-border rounded-2xl bg-secondary/5">
                  <CreditCard className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="font-semibold text-sm text-muted-foreground">
                    No payment invoices generated yet
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 max-w-[280px] mx-auto">
                    Invoices appear here once you approve a creator's completed campaign task.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                        <th className="pb-3 pr-2">Invoice / Ref</th>
                        <th className="pb-3 px-2">Campaign</th>
                        <th className="pb-3 px-2">Creator</th>
                        <th className="pb-3 px-2">Gross Amount</th>
                        <th className="pb-3 px-2">Commission (20%)</th>
                        <th className="pb-3 px-2">Creator Net (80%)</th>
                        <th className="pb-3 px-2">Status</th>
                        <th className="pb-3 px-2">Holding Ends</th>
                        <th className="pb-3 pl-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {brandPayments.map((pay) => (
                        <tr key={pay._id} className="hover:bg-secondary/10">
                          <td className="py-3 pr-2 font-mono text-[10px] text-muted-foreground">
                            <span className="block font-semibold text-foreground">{pay.invoiceNumber}</span>
                            {pay.payoutReference && <span className="block text-[9px]">{pay.payoutReference}</span>}
                          </td>
                          <td className="py-3 px-2 font-medium max-w-[110px] truncate">
                            {pay.campaign?.title || "General"}
                          </td>
                          <td className="py-3 px-2 max-w-[90px] truncate">
                            {pay.creator?.fullName || "Creator"}
                          </td>
                          <td className="py-3 px-2 font-bold text-foreground">
                            ₹{pay.grossAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-muted-foreground">
                            ₹{pay.platformCommissionAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-muted-foreground">
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
                          <td className="py-3 px-2 max-w-[140px]">
                            {pay.paymentStatus === "holding" && pay.holdingEndsAt ? (
                              <div className="flex flex-col gap-0.5">
                                <CountdownTimer dueDate={pay.holdingEndsAt} />
                                <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                                  Until {new Date(pay.holdingEndsAt).toLocaleString()}
                                </span>
                              </div>
                            ) : pay.paymentStatus === "disputed" ? (
                              <span className="text-red-500 font-semibold text-[10px]">
                                Payout Frozen
                              </span>
                            ) : pay.paymentStatus === "completed" ? (
                              <span className="text-emerald-600 font-semibold text-[10px]">
                                Released
                              </span>
                            ) : pay.paymentStatus === "refunded" ? (
                              <span className="text-slate-500 font-semibold text-[10px]">
                                Refunded to Brand
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-[10px]">
                                —
                              </span>
                            )}
                          </td>
                          <td className="py-3 pl-2 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 rounded-full text-[10px] px-2.5"
                                onClick={() => setSelectedAuditLogPayment(pay)}
                              >
                                View Logs
                              </Button>

                              {(pay.paymentStatus === "invoice_generated" || pay.paymentStatus === "pending") && (
                                <Button
                                  size="sm"
                                  className="rounded-full gradient-sunset border-0 text-white shadow-glow text-[10px] px-3.5 h-8 font-semibold"
                                  disabled={payingId === pay._id}
                                  onClick={async () => {
                                    setPayingId(pay._id);
                                    try {
                                      const order = await initiatePaymentOrder({ paymentId: pay._id });
                                      
                                      const options = {
                                        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                                        amount: order.amount,
                                        currency: order.currency,
                                        name: "Lemen Platform",
                                        description: `Payment for Invoice #${pay.invoiceNumber}`,
                                        order_id: order.id,
                                        handler: async (response) => {
                                          try {
                                            setPayingId(pay._id);
                                            await verifyPaymentSignature({
                                              paymentId: pay._id,
                                              gatewayOrderId: response.razorpay_order_id,
                                              gatewayPaymentId: response.razorpay_payment_id,
                                              gatewaySignature: response.razorpay_signature,
                                            });
                                            toast.success("Checkout payment secured in holding!");
                                          } catch (err) {
                                            toast.error((err ).message || "Signature verification failed");
                                          } finally {
                                            setPayingId(null);
                                          }
                                        },
                                        prefill: {
                                          name: profile.fullName || "",
                                          email: profile.email || "",
                                        },
                                        theme: {
                                          color: "#EC4899",
                                        },
                                        modal: {
                                          ondismiss: () => {
                                            setPayingId(null);
                                            toast.error("Payment dismissed by user");
                                          }
                                        }
                                      };

                                      const rzp = new (window ).Razorpay(options);
                                      rzp.open();
                                    } catch (e) {
                                      toast.error((e ).message);
                                      setPayingId(null);
                                    }
                                  }}
                                >
                                  {payingId === pay._id ? "Paying..." : "Pay Now"}
                                </Button>
                              )}
                              {pay.paymentStatus === "holding" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full border-red-500/20 text-red-500 hover:bg-red-500/10 text-[10px] px-3.5 h-8 font-semibold"
                                  onClick={async () => {
                                    try {
                                      await raiseDispute({ paymentId: pay._id });
                                      toast.success("Dispute raised! Payout frozen.");
                                    } catch (e) {
                                      toast.error((e ).message);
                                    }
                                  }}
                                >
                                  Raise Dispute
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            )}

            {/* REVIEWS VISIBILITY SETTINGS */}
            {(brandSubSection === "all" || brandSubSection === "preferences") && (
            <div className="card-3d rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <h2 className="font-outfit text-xl font-bold mb-2">
                Reviews from Creators
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Toggle display visibility of feedback and ratings left by creators.
              </p>

              {!reviews ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Loading reviews...
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-border rounded-xl">
                  <Star className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="font-semibold text-sm text-muted-foreground">
                    No creator reviews received yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reviews from completed creator collaborations will appear
                    here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border rounded-2xl p-4 hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <img src={
                              review.brandAvatar ||
                              `https://api.dicebear.com/9.x/avataaars/svg?seed=${review.brandName}`
                            }
                            alt=""
                            className="h-8 w-8 rounded-full object-cover border border-border shadow-sm aspect-square"
                           onError={(e) => { e.target.onerror = null; e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback"; }} />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-foreground">
                                {review.brandName}
                              </h4>
                              {review.campaignRef && (
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] rounded-full"
                                >
                                  {review.campaignRef}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-2.5 w-2.5 ${
                                      star <= review.rating
                                        ? "fill-amber text-amber"
                                        : "text-muted-foreground/30"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[9px] text-muted-foreground">
                                {new Date(
                                  review.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs">
                          <p className="font-semibold text-foreground">
                            {review.title}
                          </p>
                          <p className="text-muted-foreground mt-0.5">
                            {review.text}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-center pt-2 md:pt-0 w-full md:w-auto justify-between border-t md:border-t-0 border-border/40">
                        <div className="text-left md:text-right">
                          <span className="block text-xs font-semibold text-foreground">
                            Public Display
                          </span>
                          <span className="block text-[10px] text-muted-foreground">
                            {review.visible
                              ? "Shown on profile"
                              : "Hidden from profile"}
                          </span>
                        </div>
                        <Switch
                          checked={review.visible}
                          onCheckedChange={() =>
                            handleToggleVisibility(review._id)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}
          </div>

          {/* RIGHT COLUMN: SIDEBAR */}
          {(brandSubSection === "all" || brandSubSection === "preferences") && (
          <div className="space-y-6 w-full min-w-0">
            {/* LIMITED-TIME OFFERS SIDEBAR WIDGET */}
            <CreatorOffersSidebarWidget />

            {/* HIRING PREFERENCES PANEL */}
            <div className="card-3d rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <h2 className="font-outfit text-xl font-bold mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" /> Hiring Preferences
              </h2>
              <form
                onSubmit={handleSavePreferences}
                className="space-y-4 text-sm"
              >
                <div className="space-y-1.5">
                  <Label
                    htmlFor="prefNiches"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Target Niches
                  </Label>
                  <Input
                    id="prefNiches"
                    value={niches}
                    onChange={(e) => setNiches(e.target.value)}
                    placeholder="e.g. Sports, Fitness, Running"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="prefBudget"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Campaign Budget Range
                  </Label>
                  <Input
                    id="prefBudget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. ₹20K - ₹100K per post"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="prefReach"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Target Creator Reach
                  </Label>
                  <Input
                    id="prefReach"
                    value={reach}
                    onChange={(e) => setReach(e.target.value)}
                    placeholder="e.g. 50K+ followers"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="prefRegions"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Preferred Regions
                  </Label>
                  <Input
                    id="prefRegions"
                    value={regions}
                    onChange={(e) => setRegions(e.target.value)}
                    placeholder="e.g. India (Metros)"
                    className="rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={savingPrefs}
                  className="w-full rounded-full gradient-sunset border-0 text-white shadow-glow mt-4"
                >
                  <Save className="mr-1.5 h-4 w-4" />{" "}
                  {savingPrefs
                    ? "Updating Preferences..."
                    : "Update Preferences"}
                </Button>
              </form>
            </div>

            {/* SAVED CREATORS (KEPT FROM ORIGINAL) */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-base font-semibold">
                    Saved Creators
                  </h2>
                </div>
                <Link
                  to="/browse"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Browse
                </Link>
              </div>

              {saved.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-8 text-center">
                  <p className="text-xs font-medium text-muted-foreground">
                    No saved creators yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {saved.map((inf) => (
                    <div
                      key={inf.id}
                      className="flex items-center gap-3 rounded-2xl border border-border p-3"
                    >
                      <img src={
                          inf.avatar?.startsWith("http")
                            ? inf.avatar
                            : inf.avatar
                            ? `${
                                import.meta.env.VITE_API_URL ||
                                "http://localhost:5000"
                              }/uploads/${inf.avatar}`
                            : `https://api.dicebear.com/9.x/avataaars/svg?seed=${inf.id}`
                        }
                        alt=""
                        className="h-10 w-10 rounded-full object-cover aspect-square flex-shrink-0 border border-border"
                       onError={(e) => { e.target.onerror = null; e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback"; }} />
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/influencer/${inf.id}`}
                          className="block truncate font-display text-xs font-semibold hover:text-primary"
                        >
                          {inf.name}
                        </Link>
                        <p className="text-[10px] text-muted-foreground">
                          {inf.category} · {formatFollowers(inf.followers || 0)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFavorite(inf.id)}
                        className="text-muted-foreground hover:text-destructive p-1"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* HIRING HISTORY (KEPT FROM ORIGINAL) */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <h2 className="font-display text-base font-semibold">
                  Collaboration History
                </h2>
              </div>

              {!conversations || conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-8 text-center">
                  <p className="text-xs font-medium text-muted-foreground">
                    No collaborations initiated
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((c) => {
                    const creator = c.otherProfile;
                    if (!creator) return null;
                    return (
                      <div
                        key={c._id}
                        className="flex items-center gap-3 rounded-2xl border border-border p-3"
                      >
                        <img src={
                            creator.avatarUrl ||
                            `https://api.dicebear.com/9.x/avataaars/svg?seed=${creator.fullName}`
                          }
                          alt=""
                          className="h-10 w-10 rounded-full object-cover aspect-square flex-shrink-0 border border-border"
                         onError={(e) => { e.target.onerror = null; e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback"; }} />
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/influencer/${creator._id}`}
                            className="block truncate font-display text-xs font-semibold hover:text-primary"
                          >
                            {creator.fullName}
                          </Link>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {creator.category || "General"} ·{" "}
                            {creator.location || "India"}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[9px] capitalize rounded-full px-2"
                        >
                          {c.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

              {/* RECENT SEARCHES */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-base font-semibold">
                    Recent searches
                  </h2>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recent.map((q) => (
                    <Link key={q} to="/browse">
                      <Badge
                        variant="secondary"
                        className="rounded-full px-2.5 py-1 text-[10px] hover:bg-accent flex items-center gap-1"
                      >
                        <Search className="h-2.5 w-2.5" /> {q}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
          </div>
        ) : (
          <SubscriptionTab role="brand" profile={profile} />
        )}
      </div>
    </div>

      {/* CAMPAIGN DIALOG (CREATE/EDIT) */}
      <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] overflow-hidden rounded-3xl border border-border bg-card p-4 sm:p-6 flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display text-lg sm:text-xl font-bold">
              {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define the collaboration campaign specifics. Newly created campaigns will be reviewed by Admin before being shown to creators.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCampaign} className="space-y-4 mt-2 overflow-y-auto pr-1 flex-1">
            <div className="space-y-1.5">
              <Label htmlFor="campTitle">Campaign Name *</Label>
              <Input
                id="campTitle"
                value={campTitle}
                onChange={(e) => setCampTitle(e.target.value)}
                placeholder="e.g. Summer Fitness Brand Ambassador Campaign"
                className="rounded-xl border-border bg-background"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="campDescription">Campaign Description</Label>
              <Textarea
                id="campDescription"
                value={campDescription}
                onChange={(e) => setCampDescription(e.target.value)}
                placeholder="Describe your brand goals, target audience, and expectations..."
                className="rounded-xl border-border bg-background text-xs resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="campStartDate">Start Date</Label>
                <Input
                  id="campStartDate"
                  type="date"
                  value={campStartDate}
                  onChange={(e) => setCampStartDate(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="campEndDate">End Date *</Label>
                <Input
                  id="campEndDate"
                  type="date"
                  value={campEndDate}
                  onChange={(e) => setCampEndDate(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="campCategory">Category *</Label>
                <select
                  id="campCategory"
                  value={campCategory}
                  onChange={(e) => setCampCategory(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                  required
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="campLocation">Location</Label>
                <select
                  id="campLocation"
                  value={campLocation}
                  onChange={(e) => setCampLocation(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-1 border-t border-border/40">
              <Label className="text-xs font-semibold">Budget Details (INR)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block font-medium">Total Campaign Budget *</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 10000"
                    value={campTotalBudget}
                    onChange={(e) => setCampTotalBudget(e.target.value)}
                    className="rounded-xl border-border bg-background text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block font-medium">Min per Creator</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 2000"
                    value={campMinBudget}
                    onChange={(e) => setCampMinBudget(e.target.value)}
                    className="rounded-xl border-border bg-background text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block font-medium">Max per Creator</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 5000"
                    value={campMaxBudget}
                    onChange={(e) => setCampMaxBudget(e.target.value)}
                    className="rounded-xl border-border bg-background text-xs"
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                A campaign can hire multiple creators within the total budget.
              </p>
            </div>

            <div className="space-y-2 pt-1 border-t border-border/40">
              <Label className="text-xs font-semibold">Deliverables Quantity (Optional)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">🎬 Reels</span>
                  <Input
                    type="number"
                    min="0"
                    value={campReels}
                    onChange={(e) => setCampReels(Math.max(0, parseInt(e.target.value) || 0))}
                    className="rounded-xl border-border bg-background text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">📸 Posts</span>
                  <Input
                    type="number"
                    min="0"
                    value={campPosts}
                    onChange={(e) => setCampPosts(Math.max(0, parseInt(e.target.value) || 0))}
                    className="rounded-xl border-border bg-background text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">📱 Stories</span>
                  <Input
                    type="number"
                    min="0"
                    value={campStories}
                    onChange={(e) => setCampStories(Math.max(0, parseInt(e.target.value) || 0))}
                    className="rounded-xl border-border bg-background text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">🎥 Videos</span>
                  <Input
                    type="number"
                    min="0"
                    value={campVideos}
                    onChange={(e) => setCampVideos(Math.max(0, parseInt(e.target.value) || 0))}
                    className="rounded-xl border-border bg-background text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border border-border rounded-2xl p-3 bg-background/50">
              <div>
                <Label className="text-xs font-semibold">Active Status</Label>
                <span className="block text-[10px] text-muted-foreground">
                  If inactive, creators will not be able to apply.
                </span>
              </div>
              <Switch checked={campActive} onCheckedChange={setCampActive} />
            </div>

            <DialogFooter className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full flex-1"
                onClick={() => setIsCampaignModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingCampaign}
                className="rounded-full flex-1 gradient-sunset border-0 text-white shadow-glow"
              >
                {savingCampaign
                  ? "Saving..."
                  : editingCampaign
                    ? "Save Changes"
                    : "Submit for Verification"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
      >
        <DialogContent className="sm:max-w-md rounded-3xl border border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Brand Verification
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Enter GST Number and upload GST Certificate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="gstNumber">GST Number</Label>
              <Input
                id="gstNumber"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="Enter GST Number"
                className="rounded-xl border-border bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gstCertificate">GST Certificate</Label>
              <Input
                id="gstCertificate"
                type="file"
                accept="image/*,.pdf"
                className="rounded-xl border-border bg-background cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    uploadVerificationFile(file);
                  }
                }}
              />
              {gstFileName && (
                <p className="text-xs mt-2 text-muted-foreground">
                  Selected: {gstFileName}
                </p>
              )}
            </div>

            <Button
              className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold mt-4 shadow-glow"
              onClick={handleVerificationSubmit}
              disabled={
                !gstNumber ||
                !gstCertificateStorageId ||
                submittingVerification
              }
            >
              {submittingVerification
                ? "Submitting..."
                : "Submit Verification"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog
        open={!!selectedCollabForTask}
        onOpenChange={(open) => !open && setSelectedCollabForTask(null)}
      >
        <DialogContent className="sm:max-w-lg rounded-3xl border border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Assign Task
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Define the task deliverables, due date, priority, and notes for the creator.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!taskTitle.trim() || !taskDesc.trim() || !taskDeliverables.trim() || !taskDueDate) {
                toast.error("Please fill all required fields");
                return;
              }
              setSavingTask(true);
              try {
                // Combine Due Date and Due Time into a timestamp
                const combinedDueString = `${taskDueDate}T${taskDueTime || "23:59"}:00`;
                const dueTimestamp = new Date(combinedDueString).getTime();

                await createTask({
                  campaignId: selectedCollabForTask.campaignId,
                  creatorId: selectedCollabForTask.creatorId,
                  brandId: selectedCollabForTask.brandId,
                  connectionId: selectedCollabForTask._id,
                  conversationId: selectedCollabForTask.conversationId,
                  title: taskTitle.trim(),
                  description: taskDesc.trim(),
                  deliverables: taskDeliverables.trim(),
                  priority: taskPriority,
                  dueDate: dueTimestamp,
                  notes: taskNotes.trim(),
                });
                toast.success("Task assigned successfully!");
                setSelectedCollabForTask(null);
              } catch (err) {
                toast.error((err ).message);
              } finally {
                setSavingTask(false);
              }
            }}
            className="space-y-4 mt-2"
          >
            <div className="space-y-1.5">
              <Label htmlFor="taskTitle">Task Title *</Label>
              <Input
                id="taskTitle"
                placeholder="e.g. 1 Instagram Reel and 1 Story"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="rounded-xl border-border bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taskDesc">Task Description *</Label>
              <Textarea
                id="taskDesc"
                placeholder="Describe what the creator needs to do..."
                required
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="rounded-xl border-border bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taskDeliverables">Deliverables *</Label>
              <Input
                id="taskDeliverables"
                placeholder="e.g. 1 High Quality video file, 1 tag link"
                required
                value={taskDeliverables}
                onChange={(e) => setTaskDeliverables(e.target.value)}
                className="rounded-xl border-border bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="taskDueDate">Due Date *</Label>
                <Input
                  id="taskDueDate"
                  type="date"
                  required
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="rounded-xl border-border bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="taskDueTime">Due Time *</Label>
                <Input
                  id="taskDueTime"
                  type="time"
                  required
                  value={taskDueTime}
                  onChange={(e) => setTaskDueTime(e.target.value)}
                  className="rounded-xl border-border bg-background"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taskPriority">Priority *</Label>
              <select
                id="taskPriority"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value )}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taskNotes">Notes (Optional)</Label>
              <Textarea
                id="taskNotes"
                placeholder="Any special remarks or references..."
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                className="rounded-xl border-border bg-background"
              />
            </div>
            <DialogFooter className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full flex-1"
                onClick={() => setSelectedCollabForTask(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingTask}
                className="rounded-full flex-1 gradient-sunset border-0 text-white shadow-glow"
              >
                {savingTask ? "Assigning..." : "Assign Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Review Task Dialog */}
      <Dialog
        open={!!selectedTaskForReview}
        onOpenChange={(open) => !open && setSelectedTaskForReview(null)}
      >
        <DialogContent className="sm:max-w-md rounded-3xl border border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Review Submitted Deliverable
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Review the submission details sent by the creator.
            </DialogDescription>
          </DialogHeader>
          {selectedTaskForReview && (
            <div className="space-y-4 mt-2">
              <div className="space-y-1 bg-secondary/10 border border-border/40 rounded-xl p-3">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                  Task Title
                </p>
                <p className="text-sm font-semibold">{selectedTaskForReview.title}</p>
              </div>

              <div className="space-y-1 bg-secondary/10 border border-border/40 rounded-xl p-3">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                  Submission Link
                </p>
                <a
                  href={selectedTaskForReview.submissionLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline font-medium break-all flex items-center gap-1"
                >
                  {selectedTaskForReview.submissionLink} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {selectedTaskForReview.notes && (
                <div className="space-y-1 bg-secondary/10 border border-border/40 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                    Creator's Notes
                  </p>
                  <p className="text-xs text-foreground italic whitespace-pre-wrap">
                    "{selectedTaskForReview.notes}"
                  </p>
                </div>
              )}

              {selectedTaskForReview.attachmentLink && (
                <div className="space-y-1 bg-secondary/10 border border-border/40 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                    Optional Attachment Link
                  </p>
                  <a
                    href={selectedTaskForReview.attachmentLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary hover:underline font-medium break-all flex items-center gap-1"
                  >
                    {selectedTaskForReview.attachmentLink} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              <DialogFooter className="pt-4 flex gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full flex-1 border-border text-red-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-xs h-9 font-semibold"
                  disabled={reviewingTask}
                  onClick={async () => {
                    setReviewingTask(true);
                    try {
                      await reviewTask({
                        taskId: selectedTaskForReview._id,
                        action: "revision",
                      });
                      toast.success("Revision requested! Creator notified.");
                      setSelectedTaskForReview(null);
                    } catch (e) {
                      toast.error((e ).message);
                    } finally {
                      setReviewingTask(false);
                    }
                  }}
                >
                  Request Revision
                </Button>
                <Button
                  type="button"
                  className="rounded-full flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-glow border-0 text-xs h-9"
                  disabled={reviewingTask}
                  onClick={async () => {
                    setReviewingTask(true);
                    try {
                      await reviewTask({
                        taskId: selectedTaskForReview._id,
                        action: "approve",
                      });
                      toast.success("Task approved successfully! Creator notified.");
                      setSelectedTaskForReview(null);
                    } catch (e) {
                      toast.error((e ).message);
                    } finally {
                      setReviewingTask(false);
                    }
                  }}
                >
                  {reviewingTask ? "Approving..." : "Approve Task"}
                </Button>
              </DialogFooter>
            </div>
          )}
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

      {/* CAMPAIGN REQUESTS MODAL */}
      <Dialog
        open={Boolean(selectedCampaignForRequests)}
        onOpenChange={(open) => !open && setSelectedCampaignForRequests(null)}
      >
        <DialogContent className="max-w-2xl rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Creator Requests
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedCampaignForRequests ? (
                <>Managing applications for campaign <strong className="text-foreground">{selectedCampaignForRequests.title}</strong></>
              ) : "Manage campaign applications."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {(() => {
              if (!selectedCampaignForRequests) return null;
              const campRequests = (pendingRequests || []).filter(
                (r) => String(r.campaignId?._id || r.campaignId) === String(selectedCampaignForRequests._id)
              );

              if (campRequests.length === 0) {
                return (
                  <div className="py-10 text-center border border-dashed border-border rounded-2xl">
                    <Users className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="font-semibold text-sm text-foreground">No pending requests for this campaign</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      When creators request to join this campaign, their pitches will appear here.
                    </p>
                  </div>
                );
              }

              return campRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border p-4 bg-secondary/10 hover:bg-secondary/20 transition-all"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <img
                      src={
                        req.creatorProfile?.avatarUrl ||
                        `https://api.dicebear.com/9.x/avataaars/svg?seed=${req.creatorProfile?.fullName || "Creator"}`
                      }
                      alt=""
                      className="h-12 w-12 rounded-xl object-cover border border-border shrink-0 cursor-pointer"
                      onClick={() => setSelectedCreatorForDetails(req)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback";
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="font-display text-sm font-bold hover:text-primary cursor-pointer truncate"
                          onClick={() => setSelectedCreatorForDetails(req)}
                        >
                          {req.creatorProfile?.fullName || "Creator"}
                        </span>
                        {req.creatorProfile?.handle && (
                          <span className="text-xs text-muted-foreground font-medium">
                            {req.creatorProfile.handle}
                          </span>
                        )}
                        {req.creatorProfile?.rating > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-amber font-semibold">
                            <Star className="h-3 w-3 fill-amber" /> {req.creatorProfile.rating}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[11px] text-muted-foreground">
                        <span><strong>Followers:</strong> {req.creatorProfile?.followersCount?.toLocaleString() || "0"}</span>
                        <span>·</span>
                        <span><strong>Niche:</strong> {req.creatorProfile?.category || "General"}</span>
                        <span>·</span>
                        <span><strong>Location:</strong> {req.creatorProfile?.location || "India"}</span>
                      </div>

                      <p className="text-xs text-muted-foreground bg-background border border-border/40 rounded-xl p-2.5 mt-2 italic line-clamp-2">
                        "{req.pitch}"
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0 self-stretch sm:justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs h-8 px-3 flex items-center justify-center gap-1 border-border"
                      onClick={() => setSelectedCreatorForDetails(req)}
                    >
                      <Eye className="h-3.5 w-3.5" /> Details
                    </Button>
                    <Button
                      size="sm"
                      disabled={processingRequestId === req._id}
                      className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-xs h-8 px-3.5 flex items-center justify-center gap-1 font-semibold"
                      onClick={async () => {
                        setProcessingRequestId(req._id);
                        try {
                          await acceptConnection({ connectionId: req._id });
                          toast.success(`Approved request from ${req.creatorProfile?.fullName || "Creator"}!`);
                          setRequestsRefreshKey((k) => k + 1);
                        } catch (err) {
                          toast.error(err?.response?.data?.message || "Failed to approve request");
                        } finally {
                          setProcessingRequestId(null);
                        }
                      }}
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={processingRequestId === req._id}
                      className="rounded-full border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 text-xs h-8 px-3 flex items-center justify-center gap-1 font-semibold"
                      onClick={async () => {
                        setProcessingRequestId(req._id);
                        try {
                          await rejectConnection({ connectionId: req._id });
                          toast.info("Request declined");
                          setRequestsRefreshKey((k) => k + 1);
                        } catch (err) {
                          toast.error(err?.response?.data?.message || "Failed to decline request");
                        } finally {
                          setProcessingRequestId(null);
                        }
                      }}
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              ));
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* CREATOR PROFILE DETAILS REVIEW DIALOG */}
      <Dialog
        open={Boolean(selectedCreatorForDetails)}
        onOpenChange={(open) => !open && setSelectedCreatorForDetails(null)}
      >
        <DialogContent className="max-w-xl rounded-3xl p-6">
          {selectedCreatorForDetails && (
            <div className="space-y-5">
              <DialogHeader>
                <div className="flex items-center gap-3.5">
                  <img
                    src={
                      selectedCreatorForDetails.creatorProfile?.avatarUrl ||
                      `https://api.dicebear.com/9.x/avataaars/svg?seed=${selectedCreatorForDetails.creatorProfile?.fullName || "Creator"}`
                    }
                    alt=""
                    className="h-14 w-14 rounded-2xl object-cover border border-border shadow-sm shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback";
                    }}
                  />
                  <div>
                    <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                      {selectedCreatorForDetails.creatorProfile?.fullName || "Creator Profile"}
                    </DialogTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{selectedCreatorForDetails.creatorProfile?.handle || "@creator"}</span>
                      <span>·</span>
                      <span>{selectedCreatorForDetails.creatorProfile?.location || "India"}</span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {/* Creator Meta Stats */}
              <div className="grid grid-cols-3 gap-2.5 bg-secondary/15 rounded-2xl p-3 text-center border border-border/40">
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Total Reach</span>
                  <span className="font-bold text-sm text-foreground">
                    {selectedCreatorForDetails.creatorProfile?.followersCount?.toLocaleString() || "0"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Rating</span>
                  <span className="font-bold text-sm text-amber flex items-center justify-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber" />
                    {selectedCreatorForDetails.creatorProfile?.rating || "5.0"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Category</span>
                  <span className="font-bold text-xs text-foreground truncate block">
                    {selectedCreatorForDetails.creatorProfile?.category || "General"}
                  </span>
                </div>
              </div>

              {/* Bio & Details */}
              {selectedCreatorForDetails.creatorProfile?.bio && (
                <div>
                  <span className="text-xs font-semibold text-foreground block mb-1">About Creator</span>
                  <p className="text-xs text-muted-foreground leading-relaxed bg-background border border-border/40 rounded-xl p-3">
                    {selectedCreatorForDetails.creatorProfile.bio}
                  </p>
                </div>
              )}

              {/* Campaign & Pitch */}
              <div>
                <span className="text-xs font-semibold text-foreground block mb-1">
                  Pitch for Campaign {selectedCreatorForDetails.campaign?.title ? `("${selectedCreatorForDetails.campaign.title}")` : ""}
                </span>
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3.5 text-xs italic text-foreground leading-relaxed">
                  "{selectedCreatorForDetails.pitch}"
                </div>
                <span className="block text-[10px] text-muted-foreground mt-1.5">
                  Applied on {new Date(selectedCreatorForDetails.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2 border-t border-border/40">
                <Link
                  to={`/influencer/${selectedCreatorForDetails.creatorId}`}
                  target="_blank"
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full rounded-full text-xs h-9 font-semibold">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> View Full Profile
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={processingRequestId === selectedCreatorForDetails._id}
                  className="flex-1 rounded-full border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 text-xs h-9 font-semibold"
                  onClick={async () => {
                    setProcessingRequestId(selectedCreatorForDetails._id);
                    try {
                      await rejectConnection({ connectionId: selectedCreatorForDetails._id });
                      toast.info("Request declined");
                      setSelectedCreatorForDetails(null);
                      setRequestsRefreshKey((k) => k + 1);
                    } catch (err) {
                      toast.error(err?.response?.data?.message || "Failed to decline request");
                    } finally {
                      setProcessingRequestId(null);
                    }
                  }}
                >
                  <X className="h-4 w-4 mr-1" /> Decline
                </Button>
                <Button
                  size="sm"
                  disabled={processingRequestId === selectedCreatorForDetails._id}
                  className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-xs h-9 font-semibold"
                  onClick={async () => {
                    setProcessingRequestId(selectedCreatorForDetails._id);
                    try {
                      await acceptConnection({ connectionId: selectedCreatorForDetails._id });
                      toast.success(`Approved request from ${selectedCreatorForDetails.creatorProfile?.fullName || "Creator"}!`);
                      setSelectedCreatorForDetails(null);
                      setRequestsRefreshKey((k) => k + 1);
                    } catch (err) {
                      toast.error(err?.response?.data?.message || "Failed to approve request");
                    } finally {
                      setProcessingRequestId(null);
                    }
                  }}
                >
                  <Check className="h-4 w-4 mr-1" /> Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Task 6: Deliverable Submissions View Dialog for Brand */}
      <Dialog
        open={Boolean(selectedCollabForSubmissions)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCollabForSubmissions(null);
            setCollabSubmissionsList([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" /> Submitted Deliverables
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review submitted campaign deliverables from {selectedCollabForSubmissions?.creatorProfile?.fullName || "Creator"} for "{selectedCollabForSubmissions?.campaign?.title || "Campaign"}".
            </DialogDescription>
          </DialogHeader>

          {selectedCollabForSubmissions && (
            <div className="space-y-4 py-2">
              {/* Deliverables Overview Stats */}
              <div className="rounded-2xl border border-border/80 bg-secondary/20 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Creator</span>
                  <span className="font-bold text-foreground">{selectedCollabForSubmissions.creatorProfile?.fullName || "Creator"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Campaign</span>
                  <span className="font-bold text-foreground truncate max-w-[200px] block">{selectedCollabForSubmissions.campaign?.title || "Campaign"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Approved Deliverables</span>
                  {(() => {
                    const totalReq = selectedCollabForSubmissions.deliverablesTracking?.reduce((sum, d) => sum + (d.requiredQuantity || 0), 0) || 0;
                    const totalComp = selectedCollabForSubmissions.deliverablesTracking?.reduce((sum, d) => sum + (d.completedQuantity || 0), 0) || 0;
                    const isAllApproved = totalReq > 0 && totalComp >= totalReq;
                    return (
                      <span className={cn("font-bold flex items-center gap-1", isAllApproved ? "text-emerald-600" : "text-primary")}>
                        {totalComp} / {totalReq} Approved
                        {isAllApproved && <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[9px] px-1.5 py-0 font-bold">✓ 100% Completed</Badge>}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Submissions List */}
              {loadingSubmissions ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  Loading submitted deliverables...
                </div>
              ) : collabSubmissionsList.length === 0 ? (
                <div className="py-12 text-center rounded-2xl border border-dashed border-border p-6 space-y-1">
                  <p className="text-sm font-semibold text-foreground">No deliverables submitted yet</p>
                  <p className="text-xs text-muted-foreground">
                    The creator has not yet uploaded content for this campaign.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {collabSubmissionsList.map((sub, idx) => {
                    const isVideo = sub.contentUrl?.match(/\.(mp4|mov|webm|avi|mkv)$/i) || sub.deliverableType === "REEL" || sub.deliverableType === "VIDEO";
                    const formattedDate = new Date(sub.submittedAt || sub.createdAt).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });

                    return (
                      <div
                        key={sub._id || idx}
                        className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 hover:border-border transition"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary/10 text-primary border border-primary/20 font-bold text-[10px] px-2 py-0.5">
                              {sub.deliverableType}
                            </Badge>
                            <span className="text-xs font-semibold text-foreground">
                              Submission #{collabSubmissionsList.length - idx}
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
                                <X className="h-3 w-3" /> REJECTED
                              </Badge>
                            ) : sub.status === "RESUBMITTED" ? (
                              <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-bold">
                                RESUBMITTED · AWAITING REVIEW
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold">
                                SUBMITTED · AWAITING REVIEW
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Content Preview */}
                        <div className="rounded-xl overflow-hidden bg-background border border-border/60 max-h-64 flex items-center justify-center">
                          {isVideo ? (
                            <video
                              src={resolveImageUrl(sub.contentUrl)}
                              controls
                              className="max-h-64 w-full object-contain"
                            />
                          ) : (
                            <img
                              src={resolveImageUrl(sub.contentUrl)}
                              alt="Deliverable submission"
                              className="max-h-64 w-full object-contain"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://api.dicebear.com/9.x/shapes/svg?seed=Content";
                              }}
                            />
                          )}
                        </div>

                        {/* Caption / Description if present */}
                        {sub.caption && (
                          <div className="text-xs text-foreground bg-secondary/30 rounded-xl p-2.5 border border-border/40 leading-relaxed">
                            <span className="font-semibold text-muted-foreground block text-[10px] uppercase mb-0.5">
                              {sub.status === "RESUBMITTED" ? "Creator Rework Notes:" : "Creator Caption / Notes:"}
                            </span>
                            "{sub.caption}"
                          </div>
                        )}

                        {/* Footer Metadata & Review Actions (Task 7 & 8) */}
                        <div className="space-y-2 pt-2 border-t border-border/40">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>
                              {sub.status === "RESUBMITTED" ? "Resubmitted on:" : "Submitted on:"} {formattedDate}
                            </span>
                            <a
                              href={resolveImageUrl(sub.contentUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 font-semibold"
                            >
                              <ExternalLink className="h-3 w-3" /> View Original
                            </a>
                          </div>

                          {/* Rejection reason display if rejected */}
                          {sub.status === "REJECTED" && sub.rejectionReason && (
                            <div className="text-[11px] text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl p-2.5">
                              <strong>Previous Rejection Feedback:</strong> {sub.rejectionReason}
                            </div>
                          )}

                          {/* Brand Review Actions: Approve / Reject (Enabled for SUBMITTED and RESUBMITTED) */}
                          {(sub.status === "SUBMITTED" || sub.status === "RESUBMITTED") && (
                            <div className="flex gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 rounded-full border-red-500/30 text-red-600 hover:bg-red-500/10 text-xs h-8 font-semibold flex items-center justify-center gap-1"
                                disabled={reviewingSubmissionId === sub._id}
                                onClick={() => {
                                  setRejectingSubmission(sub);
                                  setSubmissionRejectionReason("");
                                }}
                              >
                                <X className="h-3.5 w-3.5" /> Reject / Request Changes
                              </Button>

                              <Button
                                size="sm"
                                className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-xs h-8 font-semibold flex items-center justify-center gap-1 shadow-sm"
                                disabled={reviewingSubmissionId === sub._id}
                                onClick={async () => {
                                  setReviewingSubmissionId(sub._id);
                                  try {
                                    const res = await api.patch(`/api/submissions/${sub._id}/approve`);
                                    toast.success(`Approved ${sub.deliverableType} (v${sub.version || 1}) submission!`);
                                    
                                    // Refresh modal submissions
                                    const refreshed = await api.get(`/api/submissions/${selectedCollabForSubmissions._id}/submissions`);
                                    setCollabSubmissionsList(refreshed.data?.data?.submissions || []);
                                    setRequestsRefreshKey((k) => k + 1);
                                  } catch (err) {
                                    console.error("Approve submission error:", err);
                                    toast.error(err?.response?.data?.message || err.message || "Failed to approve deliverable.");
                                  } finally {
                                    setReviewingSubmissionId(null);
                                  }
                                }}
                              >
                                <Check className="h-3.5 w-3.5" /> {reviewingSubmissionId === sub._id ? "Approving..." : "Approve Deliverable"}
                              </Button>
                            </div>
                          )}

                          {sub.status === "APPROVED" && (
                            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approved on {new Date(sub.approvedAt || sub.updatedAt).toLocaleDateString()}
                            </div>
                          )}
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
                setSelectedCollabForSubmissions(null);
                setCollabSubmissionsList([]);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task 7: Rejection Reason Dialog */}
      <Dialog
        open={Boolean(rejectingSubmission)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectingSubmission(null);
            setSubmissionRejectionReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[450px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <X className="h-5 w-5 text-destructive" /> Reject Deliverable & Request Changes
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide feedback for the creator explaining why this {rejectingSubmission?.deliverableType} was rejected and what changes are needed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground">
                Rejection Reason / Required Changes <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="e.g. Please ensure the campaign hashtag #BrandSummer is included in the video caption and product packaging is clearly visible."
                value={submissionRejectionReason}
                onChange={(e) => setSubmissionRejectionReason(e.target.value)}
                className="text-xs min-h-[90px] rounded-xl resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              onClick={() => {
                setRejectingSubmission(null);
                setSubmissionRejectionReason("");
              }}
              disabled={reviewingSubmissionId !== null}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="rounded-full text-xs font-bold px-5"
              disabled={!submissionRejectionReason.trim() || reviewingSubmissionId !== null}
              onClick={async () => {
                if (!rejectingSubmission || !submissionRejectionReason.trim()) {
                  toast.error("Please enter a rejection reason.");
                  return;
                }

                setReviewingSubmissionId(rejectingSubmission._id);
                try {
                  await api.patch(`/api/submissions/${rejectingSubmission._id}/reject`, {
                    reason: submissionRejectionReason.trim(),
                  });

                  toast.info("Deliverable rejected. Feedback sent to creator.");
                  setRejectingSubmission(null);
                  setSubmissionRejectionReason("");

                  // Refresh submissions
                  if (selectedCollabForSubmissions) {
                    const refreshed = await api.get(`/api/submissions/${selectedCollabForSubmissions._id}/submissions`);
                    setCollabSubmissionsList(refreshed.data?.data?.submissions || []);
                  }
                  setRequestsRefreshKey((k) => k + 1);
                } catch (err) {
                  console.error("Reject submission error:", err);
                  toast.error(err?.response?.data?.message || err.message || "Failed to reject deliverable.");
                } finally {
                  setReviewingSubmissionId(null);
                }
              }}
            >
              {reviewingSubmissionId !== null ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Hired Creators Modal */}
      <Dialog
        open={hiredCreatorsModalOpen}
        onOpenChange={(open) => setHiredCreatorsModalOpen(open)}
      >
        <DialogContent className="sm:max-w-2xl rounded-3xl p-6 bg-card border-border">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Hired Creators ({approvedCollabs?.length || 0})
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Creators you have successfully hired and collaborated with on your campaigns.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-3 pr-1">
            {!approvedCollabs || approvedCollabs.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-border p-6 bg-secondary/10">
                <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                <p className="font-semibold text-sm text-foreground">No creators hired yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  When you accept creator pitches or approve collaborations, they will appear here.
                </p>
              </div>
            ) : (
              approvedCollabs.map((collab) => {
                const creator = collab.creatorProfile;
                const creatorId = collab.creatorId?._id || collab.creatorId;
                return (
                  <div
                    key={collab._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-secondary/15 hover:bg-secondary/25 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          creator?.avatarUrl ||
                          `https://api.dicebear.com/9.x/avataaars/svg?seed=${creator?.fullName || "Creator"}`
                        }
                        alt=""
                        className="h-12 w-12 rounded-2xl object-cover border border-border shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback";
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground truncate block">
                            {creator?.fullName || "Creator"}
                          </span>
                          {creator?.category && (
                            <Badge variant="secondary" className="text-[10px] rounded-md font-medium px-2 py-0.5">
                              {creator.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {creator?.handle || creator?.email || "Creator Partner"}
                        </p>
                        {collab.campaign && (
                          <p className="text-[11px] text-primary font-medium mt-0.5 truncate">
                            Campaign: {collab.campaign.title}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {collab.conversationId && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-full text-xs px-3 font-semibold"
                          onClick={() => {
                            setHiredCreatorsModalOpen(false);
                            navigate(`/messages?conversationId=${collab.conversationId}`);
                          }}
                        >
                          <MessageCircle className="h-3.5 w-3.5 mr-1" /> Chat
                        </Button>
                      )}
                      {creatorId && (
                        <Button
                          size="sm"
                          className="h-8 rounded-full gradient-sunset border-0 text-white text-xs font-bold px-3.5 shadow-sm"
                          onClick={() => {
                            setHiredCreatorsModalOpen(false);
                            navigate(`/influencer/${creatorId}`);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Profile
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              onClick={() => setHiredCreatorsModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DashboardCustomer;
