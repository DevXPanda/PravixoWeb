import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/Dialog";
import { toast } from "sonner";
import {
  Sparkles,
  Plus,
  Trash2,
  Play,
  Star,
  UploadCloud,
  Link as LinkIcon,
  Video,
  X,
  FileVideo,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";

const resolveMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) return url;
  let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  if (apiUrl.endsWith("/api")) apiUrl = apiUrl.slice(0, -4);
  return `${apiUrl}${url}`;
};

const isDirectVideo = (url) => {
  if (!url) return false;
  if (url.startsWith("blob:")) return true;
  return (
    url.startsWith("/uploads/") ||
    /\.(mp4|mov|avi|webm|mkv)(\?.*)?$/i.test(url) ||
    (url.includes("cloudinary.com") &&
      !url.includes("youtube") &&
      !url.includes("youtu.be") &&
      !url.includes("vimeo"))
  );
};

const getEmbedUrl = (url) => {
  if (!url) return "";
  if (url.includes("youtube.com/watch")) {
    const videoId = new URLSearchParams(url.split("?")[1]).get("v");
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  if (url.includes("vimeo.com/")) {
    const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
  }
  return url;
};

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [selectedRole, setSelectedRole] = useState("brand");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [videoSourceType, setVideoSourceType] = useState("file"); // "file" | "link"
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(null);

  const [formName, setFormName] = useState("");
  const [formText, setFormText] = useState("");
  const [formVideoLink, setFormVideoLink] = useState("");
  const [formThumbLink, setFormThumbLink] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formRole, setFormRole] = useState("brand");

  const [profile, setProfile] = useState(null);
  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get("/video-reviews");
      setReviews(response.data?.data || []);
    } catch (error) {
      console.error("Fetch video reviews error:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch video reviews."
      );
    }
  };

  const isAdmin = profile?.role === "brand" && profile?.fullName === "Admin";

  const handleOpenCreate = () => {
    setFormName("");
    setFormText("");
    setFormVideoLink("");
    setFormThumbLink("");
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setThumbnailFile(null);
    setThumbnailPreviewUrl(null);
    setVideoSourceType("file");
    setFormRating(5);
    setFormRole(selectedRole);
    setShowCreateModal(true);
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/") && !/\.(mp4|mov|avi|webm|mkv)$/i.test(file.name)) {
      toast.error("Please choose a valid video file (.mp4, .mov, .webm, .avi).");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video file is too large (max 50MB).");
      return;
    }

    setVideoFile(file);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const handleThumbnailFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a valid image file.");
      return;
    }

    setThumbnailFile(file);
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    setThumbnailPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formName.trim()) {
      toast.error("Please enter the reviewer name.");
      return;
    }
    if (!formText.trim()) {
      toast.error("Please write your review comments.");
      return;
    }

    setSubmitting(true);
    try {
      if (videoSourceType === "file") {
        if (!videoFile) {
          toast.error("Please select a video file of your experience.");
          setSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append("reviewerName", formName.trim());
        formData.append("reviewText", formText.trim());
        formData.append("rating", String(formRating));
        formData.append("targetRole", formRole);
        formData.append("video", videoFile);

        if (thumbnailFile) {
          formData.append("thumbnail", thumbnailFile);
        } else if (formThumbLink.trim()) {
          formData.append("thumbnailUrl", formThumbLink.trim());
        }

        const response = await api.post("/video-reviews", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data?.success) {
          toast.success("Video review uploaded and published successfully!");
          setShowCreateModal(false);
          await fetchReviews();
        }
      } else {
        if (!formVideoLink.trim()) {
          toast.error("Please enter a video URL.");
          setSubmitting(false);
          return;
        }

        const response = await api.post("/video-reviews", {
          reviewerName: formName.trim(),
          reviewText: formText.trim(),
          videoUrl: formVideoLink.trim(),
          thumbnailUrl: formThumbLink.trim() || undefined,
          rating: formRating,
          targetRole: formRole,
        });

        if (response.data?.success) {
          toast.success("Video review added successfully!");
          setShowCreateModal(false);
          await fetchReviews();
        }
      }
    } catch (error) {
      console.error("Create video review error:", error);
      toast.error(
        error.response?.data?.message || "Failed to create video review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const response = await api.delete(`/video-reviews/${id}`);

      if (response.data?.success) {
        toast.success("Video review deleted successfully!");
        setReviews((prev) => prev.filter((review) => review._id !== id));
      }
    } catch (error) {
      console.error("Delete video review error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete video review."
      );
    }
  };

  const visibleReviews = reviews.filter(
    (review) => review.targetRole === selectedRole
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-background py-8 sm:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/3 top-10 h-80 w-80 rounded-full bg-primary/10 opacity-30 blur-3xl" />
        <div className="absolute bottom-10 right-1/3 h-72 w-72 rounded-full bg-accent/10 opacity-40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl space-y-8 sm:space-y-12 px-4 sm:px-6 lg:px-8">
        {/* HERO SECTION */}
        <div className="flex flex-col items-center justify-between gap-6 border-b border-border/40 pb-6 md:flex-row">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Video Reviews
            </div>

            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              What Our{" "}
              <span className="text-gradient-sunset">
                Partners Say
              </span>
            </h1>

            <p className="mt-2 max-w-xl text-xs sm:text-sm text-muted-foreground">
              Watch authentic experience videos, testimonials, and collaboration results from brands and creators using Pravixo.
            </p>
          </div>

          <Button
            onClick={handleOpenCreate}
            className="rounded-full gradient-sunset border-0 font-semibold text-white shadow-glow text-xs sm:text-sm h-10 px-5"
          >
            <Plus className="mr-2 h-4 w-4" />
            Upload Video Review
          </Button>
        </div>

        {/* ROLE TOGGLE */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
            <button
              onClick={() => setSelectedRole("brand")}
              className={`rounded-full px-5 sm:px-6 py-2 text-xs font-semibold transition-all ${
                selectedRole === "brand"
                  ? "gradient-sunset text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Brand Reviews
            </button>

            <button
              onClick={() => setSelectedRole("creator")}
              className={`rounded-full px-5 sm:px-6 py-2 text-xs font-semibold transition-all ${
                selectedRole === "creator"
                  ? "gradient-sunset text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Creator Reviews
            </button>
          </div>
        </div>

        {/* REVIEWS GRID */}
        {visibleReviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <Video className="mx-auto mb-2 h-10 w-10 animate-pulse text-muted-foreground/40" />
            <p className="text-sm font-semibold text-foreground">
              No video reviews posted yet for {selectedRole === "brand" ? "brands" : "creators"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Be the first to upload and share your experience with Pravixo!
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenCreate}
              className="mt-4 rounded-full text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Upload Review
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {visibleReviews.map((rev) => {
              const direct = isDirectVideo(rev.videoUrl);
              return (
                <div
                  key={rev._id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card transition-all duration-200 hover:shadow-elevated hover:border-primary/40"
                >
                  <div className="space-y-4">
                    {/* VIDEO THUMBNAIL / PREVIEW */}
                    <div
                      className="relative h-48 w-full cursor-pointer overflow-hidden bg-black flex items-center justify-center group"
                      onClick={() => setActiveVideoUrl(rev.videoUrl)}
                    >
                      {rev.thumbnailUrl ? (
                        <img
                          src={resolveMediaUrl(rev.thumbnailUrl)}
                          alt={rev.reviewerName}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : direct ? (
                        <video
                          src={resolveMediaUrl(rev.videoUrl)}
                          className="h-full w-full object-cover pointer-events-none opacity-85"
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800"
                          alt={rev.reviewerName}
                          className="h-full w-full object-cover opacity-80"
                        />
                      )}

                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/25">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/95 text-white shadow-xl transition-transform duration-200 group-hover:scale-110">
                          <Play className="ml-0.5 h-5 w-5 fill-current" />
                        </div>
                      </div>

                      <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                        {rev.targetRole} review
                      </div>
                    </div>

                    {/* REVIEW INFO */}
                    <div className="space-y-2 p-5 sm:p-6">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < (rev.rating || 5)
                                ? "fill-current text-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>

                      <h4 className="font-display text-sm font-bold text-foreground">
                        {rev.reviewerName}
                      </h4>

                      <p className="text-xs leading-relaxed text-muted-foreground italic line-clamp-4">
                        "{rev.reviewText}"
                      </p>
                    </div>
                  </div>

                  {/* DELETE / ACTIONS */}
                  {isAdmin && (
                    <div className="flex justify-end p-5 pt-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(rev._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* VIDEO PLAYER MODAL */}
      <Dialog
        open={!!activeVideoUrl}
        onOpenChange={(open) => {
          if (!open) {
            setActiveVideoUrl(null);
          }
        }}
      >
        <DialogContent className="overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-black p-0 sm:max-w-3xl max-h-[90vh]">
          {activeVideoUrl && (
            <div className="w-full flex items-center justify-center bg-black">
              {isDirectVideo(activeVideoUrl) ? (
                <video
                  src={resolveMediaUrl(activeVideoUrl)}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[80vh] w-full object-contain"
                />
              ) : (
                <div className="aspect-video w-full">
                  <iframe
                    src={getEmbedUrl(activeVideoUrl)}
                    title="Video Review Player"
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CREATE / UPLOAD VIDEO REVIEW MODAL */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 sm:max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader className="pb-2 border-b border-border/50">
            <DialogTitle className="font-display text-lg sm:text-xl font-bold">
              Share Your Experience
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Upload a recorded video testimonial or link your video review.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            {/* SOURCE SELECTOR TABS */}
            <div className="flex rounded-xl bg-secondary/50 p-1 border border-border/60">
              <button
                type="button"
                onClick={() => setVideoSourceType("file")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  videoSourceType === "file"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UploadCloud className="h-3.5 w-3.5 text-primary" />
                Upload Video File
              </button>
              <button
                type="button"
                onClick={() => setVideoSourceType("link")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  videoSourceType === "link"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LinkIcon className="h-3.5 w-3.5 text-primary" />
                Paste Video Link
              </button>
            </div>

            {/* VIDEO INPUT FIELD */}
            {videoSourceType === "file" ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Testimonial Video File *</span>
                  <span className="text-[10px] text-muted-foreground">MP4, MOV, WEBM (Max 50MB)</span>
                </label>

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/mov,video/avi,video/webm,video/mkv,video/*"
                  onChange={handleVideoFileChange}
                  className="hidden"
                />

                {videoFile ? (
                  <div className="relative rounded-2xl border border-primary/40 bg-secondary/20 p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FileVideo className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate text-foreground">
                            {videoFile.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => videoInputRef.current?.click()}
                          className="h-7 text-xs px-2"
                        >
                          Change
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setVideoFile(null);
                            setVideoPreviewUrl(null);
                          }}
                          className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {videoPreviewUrl && (
                      <div className="rounded-xl overflow-hidden bg-black max-h-40 flex items-center justify-center">
                        <video
                          src={videoPreviewUrl}
                          controls
                          className="max-h-40 w-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-primary/60 bg-secondary/10 hover:bg-secondary/20 rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Click to browse or drop your video here
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Recorded experience clips from camera or phone
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Video / YouTube / Vimeo URL *
                </label>
                <Input
                  required
                  placeholder="https://www.youtube.com/watch?v=... or direct video link"
                  value={formVideoLink}
                  onChange={(e) => setFormVideoLink(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>
            )}

            {/* REVIEWER NAME & ROLE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Reviewer Name & Title *
                </label>
                <Input
                  required
                  placeholder="e.g. Kashish (Brand Executive)"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Reviewer Role *
                </label>
                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-9"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                >
                  <option value="brand">Brand Partner</option>
                  <option value="creator">Creator Partner</option>
                </select>
              </div>
            </div>

            {/* RATING */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Rating Points *
              </label>
              <div className="flex items-center gap-1.5 pt-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormRating(star)}
                    className="p-1 text-amber-400 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= formRating
                          ? "fill-current text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold ml-2 text-muted-foreground">
                  {formRating} / 5 Stars
                </span>
              </div>
            </div>

            {/* OPTIONAL THUMBNAIL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Custom Video Thumbnail (Optional)</span>
                {videoSourceType === "file" && (
                  <span className="text-[10px] text-muted-foreground">Optional cover poster</span>
                )}
              </label>

              {videoSourceType === "file" ? (
                <div className="flex items-center gap-3">
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => thumbInputRef.current?.click()}
                    className="rounded-xl text-xs h-8"
                  >
                    <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                    {thumbnailFile ? "Change Thumbnail" : "Upload Thumbnail"}
                  </Button>
                  {thumbnailFile && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {thumbnailFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailFile(null);
                          setThumbnailPreviewUrl(null);
                        }}
                        className="text-destructive hover:opacity-80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Input
                  placeholder="https://images.unsplash.com/... (Image URL)"
                  value={formThumbLink}
                  onChange={(e) => setFormThumbLink(e.target.value)}
                  className="rounded-xl text-xs"
                />
              )}
            </div>

            {/* REVIEW COMMENTS */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Review Comments & Experience *
              </label>
              <Textarea
                required
                rows={3}
                placeholder="Share your experience working on Pravixo..."
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                className="rounded-xl text-xs resize-none"
              />
            </div>

            {/* FOOTER */}
            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-full text-xs"
                disabled={submitting}
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-full gradient-sunset border-0 font-semibold text-white text-xs px-5 shadow-glow"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish Review"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}