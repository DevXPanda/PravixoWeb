import { useEffect, useState, useRef } from "react";
import { resolveImageUrl } from "@/lib/utils";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Send,
  Shield,
  Sparkles,
  MessageSquare,
  Megaphone,
  Trash2,
  RefreshCw,
  Paperclip,
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  Loader2,
  ExternalLink,
  MoreVertical,
} from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

export function MessagesPage() {
  const { id } = useParams();

  useEffect(() => {
    document.title = "Chat Room — Pravixo Admin";
  }, []);

  const [data, setData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef(null);

  // Media attachments in Admin Chat
  const [attachedMedia, setAttachedMedia] = useState(null);
  const [attachedMediaPreview, setAttachedMediaPreview] = useState(null);
  const [attachedMediaType, setAttachedMediaType] = useState(null);
  const mediaFileInputRef = useRef(null);

  // Single Message Action Modal (Three dots Unsend / Delete)
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedActionMessage, setSelectedActionMessage] = useState(null);
  const [isActionProcessing, setIsActionProcessing] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSingleMessageAction = async (deleteType) => {
    if (!selectedActionMessage) return;
    try {
      setIsActionProcessing(true);
      await api.post("/admin/messages/bulk-delete", {
        messageIds: [selectedActionMessage._id],
        deleteType,
      });

      toast.success(deleteType === "all" ? "Message deleted for everyone" : `Message hidden from ${deleteType}`);
      setActionModalOpen(false);
      setSelectedActionMessage(null);
      await fetchData();
    } catch (err) {
      console.error("Single message action error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete message");
    } finally {
      setIsActionProcessing(false);
    }
  };

  const handleMediaFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size cannot exceed 50MB.");
      return;
    }

    setAttachedMedia(file);
    const isVid = file.type.startsWith("video/");
    setAttachedMediaType(isVid ? "video" : "image");
    setAttachedMediaPreview(URL.createObjectURL(file));
  };

  const removeAttachedMedia = () => {
    if (attachedMediaPreview) {
      URL.revokeObjectURL(attachedMediaPreview);
    }
    setAttachedMedia(null);
    setAttachedMediaPreview(null);
    setAttachedMediaType(null);
    if (mediaFileInputRef.current) {
      mediaFileInputRef.current.value = "";
    }
  };

  const fetchData = async () => {
    if (!id) return;
    try {
      setRefreshing(true);
      const res = await api.get(`/admin/conversations/${id}/messages`);
      if (res.data.success) {
        setData(res.data.data);
        const msgs = res.data.data.messages || [];
        setMessages(msgs);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      toast.error("Failed to refresh messages.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Real-time polling
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(() => {
      api.get(`/admin/conversations/${id}/messages`)
        .then((res) => {
          if (res.data.success) {
            const newMsgs = res.data.data.messages || [];
            setMessages((prev) => {
              if (prev.length !== newMsgs.length) {
                setTimeout(scrollToBottom, 100);
                return newMsgs;
              }
              return prev;
            });
          }
        })
        .catch(console.error);
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = newMessageText.trim();
    if ((!text && !attachedMedia) || sending || !id) return;

    try {
      setSending(true);
      const senderId = data?.admin?._id || data?.conversation?.adminId?._id || data?.conversation?.adminId;

      if (attachedMedia) {
        const formData = new FormData();
        formData.append("conversationId", id);
        if (senderId) formData.append("senderId", senderId);
        if (text) formData.append("text", text);
        formData.append("file", attachedMedia);

        await api.post("/messages", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/messages", {
          conversationId: id,
          senderId,
          text,
        });
      }

      setNewMessageText("");
      removeAttachedMedia();
      await fetchData();
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error(err.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const toggleSelection = (msgId) => {
    setSelectedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
      } else {
        next.add(msgId);
      }
      return next;
    });
  };

  const handleBulkDelete = async (type) => {
    if (selectedMessages.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedMessages.size} messages for ${type}?`)) return;

    try {
      setIsDeleting(true);
      await api.post("/admin/messages/bulk-delete", {
        messageIds: Array.from(selectedMessages),
        deleteType: type,
      });

      await fetchData();
      setSelectedMessages(new Set());
      toast.success("Messages deleted.");
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error("Failed to delete messages.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!id) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-muted-foreground">No conversation selected.</p>
      </div>
    );
  }

  const otherParty = data?.creator || data?.brand || { fullName: "User", role: "user" };
  const isAdminConversation = !!data?.admin || data?.conversation?.conversationType === "admin_brand" || data?.conversation?.conversationType === "admin_creator";

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4 bg-card/60 backdrop-blur-md rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <Link
            to="/conversations"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {!data ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Party A (Creator or Admin) */}
              {data.creator && (
                <div className="flex items-center gap-2">
                  <img
                    src={resolveImageUrl(data.creator?.avatarUrl, data.creator?.fullName || "C")}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.creator?.fullName || "C")}&background=random`;
                    }}
                    alt=""
                    className="h-10 w-10 rounded-full border border-border object-cover"
                  />
                  <div>
                    <div className="text-sm font-semibold">{data.creator?.fullName}</div>
                    <Badge variant="secondary" className="rounded-full text-[9px] bg-violet/10 text-violet">
                      creator
                    </Badge>
                  </div>
                </div>
              )}

              {data.creator && data.brand && <span className="text-sm text-muted-foreground font-bold">↔</span>}

              {/* Party B (Brand or Admin) */}
              {data.brand && (
                <div className="flex items-center gap-2">
                  <img
                    src={resolveImageUrl(data.brand?.avatarUrl, data.brand?.fullName || "B")}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.brand?.fullName || "B")}&background=random`;
                    }}
                    alt=""
                    className="h-10 w-10 rounded-full border border-border object-cover"
                  />
                  <div>
                    <div className="text-sm font-semibold">{data.brand?.fullName}</div>
                    <Badge variant="secondary" className="rounded-full text-[9px] bg-amber/10 text-amber">
                      brand
                    </Badge>
                  </div>
                </div>
              )}

              {isAdminConversation && (
                <Badge className="ml-2 rounded-full text-[10px] bg-primary/10 text-primary border-primary/20 font-bold">
                  🛡️ Admin Chat
                </Badge>
              )}

              {data.campaign && (
                <Badge variant="outline" className="text-[10px] rounded-full text-muted-foreground ml-2 flex items-center gap-1">
                  <Megaphone className="h-3 w-3 text-primary" /> {data.campaign.title}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={refreshing}
            onClick={fetchData}
            className="rounded-full text-xs h-8 px-3 flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              if (confirm("Are you sure you want to permanently delete this chat?")) {
                try {
                  await api.delete(`/admin/conversations/${id}`);
                  window.location.href = "/conversations";
                } catch (err) {
                  console.error("Failed to delete chat", err);
                  toast.error("Failed to delete chat.");
                }
              }
            }}
            className="rounded-full text-xs h-8 px-3"
          >
            Delete Chat
          </Button>
        </div>
      </div>

      {/* Moderation Controls when messages selected */}
      {selectedMessages.size > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="text-xs font-semibold">
            {selectedMessages.size} messages selected
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={isDeleting}
              onClick={() => handleBulkDelete("all")}
              className="rounded-full text-xs h-7 px-3"
            >
              Delete for Everyone
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isDeleting}
              onClick={() => handleBulkDelete("creator")}
              className="rounded-full text-xs h-7 px-3 text-violet hover:bg-violet/10 border-violet/20"
            >
              Hide from Creator
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isDeleting}
              onClick={() => handleBulkDelete("brand")}
              className="rounded-full text-xs h-7 px-3 text-amber hover:bg-amber/10 border-amber/20"
            >
              Hide from Brand
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedMessages(new Set())}
              className="rounded-full text-xs h-7 px-3"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 rounded-3xl border border-border bg-card overflow-hidden flex flex-col justify-between shadow-sm">
        <ScrollArea className="flex-1 p-4 lg:p-6 max-h-[calc(100vh-320px)]">
          <div className="space-y-3">
            {!data ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "" : "justify-end"}`}>
                  <div className="max-w-[70%] space-y-1.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-10 w-48 rounded-2xl" />
                  </div>
                </div>
              ))
            ) : messages.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-sm text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-2 opacity-40 text-primary" />
                No messages yet. Send a message to start communicating.
              </div>
            ) : (
              messages.map((msg) => {
                const isFromAdmin = msg.senderId?.role === "admin" || (data.admin && msg.senderId?._id === data.admin._id);
                const isFromCreator = data.creator && msg.senderId?._id === data.creator._id;
                const senderName = isFromAdmin ? "Pravixo Admin" : msg.senderId?.fullName || "User";
                const senderRole = msg.senderId?.role || (isFromAdmin ? "admin" : isFromCreator ? "creator" : "brand");

                return (
                  <div
                    key={msg._id}
                    className={`group flex items-start gap-2.5 ${isFromAdmin ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className="mt-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <input
                        type="checkbox"
                        checked={selectedMessages.has(msg._id)}
                        onChange={() => toggleSelection(msg._id)}
                        className="h-3.5 w-3.5 cursor-pointer rounded border-border"
                      />
                    </div>

                    <img
                      src={
                        isFromAdmin
                          ? "/log.png"
                          : resolveImageUrl(msg.senderId?.avatarUrl, senderName)
                      }
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = isFromAdmin ? "/log.png" : `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=random`;
                      }}
                      alt=""
                      className="mt-1 h-7 w-7 shrink-0 rounded-full border border-border object-contain bg-white p-0.5"
                    />

                    <div className={`max-w-[75%] ${isFromAdmin ? "text-right" : "text-left"}`}>
                      <div className={`flex items-center gap-2 mb-1 ${isFromAdmin ? "justify-end" : "justify-start"}`}>
                        <span
                          className={`text-[10px] font-bold ${
                            isFromAdmin
                              ? "text-primary"
                              : senderRole === "creator"
                              ? "text-violet"
                              : "text-amber"
                          }`}
                        >
                          {senderName} ({senderRole})
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(msg.createdAt), "MMM d, HH:mm")}
                        </span>
                      </div>

                      <div
                        className={`inline-block rounded-2xl px-4 py-2.5 text-xs font-medium ${
                          isFromAdmin
                            ? "rounded-tr-sm gradient-sunset text-white shadow-sm"
                            : "rounded-tl-sm bg-secondary text-foreground"
                        }`}
                      >
                        {msg.deletedByAdmin ? (
                          <span className="italic opacity-70">This message has been deleted by Admin</span>
                        ) : (
                          <div className="space-y-2">
                            {/* Media Attachment (Photo or Video) */}
                            {msg.metadata?.contentUrl && (
                              <div className="rounded-xl overflow-hidden bg-black/40 border border-border/40 max-w-[280px]">
                                {msg.metadata.mediaType === "video" || msg.metadata.contentUrl?.match(/\.(mp4|mov|webm|avi|mkv|m4v)$/i) ? (
                                  <video
                                    src={resolveImageUrl(msg.metadata.contentUrl)}
                                    controls
                                    className="max-h-56 w-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <a
                                    href={resolveImageUrl(msg.metadata.contentUrl)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block group/media relative"
                                  >
                                    <img
                                      src={resolveImageUrl(msg.metadata.contentUrl)}
                                      alt={msg.metadata.fileName || "Photo"}
                                      className="max-h-56 w-full object-cover rounded-lg transition-transform hover:scale-[1.02]"
                                    />
                                    <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white opacity-0 group-hover/media:opacity-100 transition-opacity">
                                      <ExternalLink className="h-3 w-3" />
                                    </div>
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Caption / Text */}
                            {msg.text && (
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            )}
                          </div>
                        )}
                        {msg.deletedForCreator && !msg.deletedByAdmin && (
                          <div className="mt-1 text-[9px] text-destructive italic opacity-70">
                            (Hidden from Creator)
                          </div>
                        )}
                        {msg.deletedForBrand && !msg.deletedByAdmin && (
                          <div className="mt-1 text-[9px] text-destructive italic opacity-70">
                            (Hidden from Brand)
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex-1">
                          {msg.read ? (
                            <CheckCheck className={`inline h-3 w-3 ${isFromAdmin ? "text-primary" : "text-muted-foreground"}`} />
                          ) : (
                            <Check className="inline h-3 w-3 text-muted-foreground" />
                          )}
                        </div>

                        {/* Three dots for single message delete / unsend */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedActionMessage(msg);
                            setActionModalOpen(true);
                          }}
                          className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition"
                          title="Message Options"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Live Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-border p-3 bg-secondary/15 space-y-2"
        >
          {/* Media Attachment Preview before sending in Admin chat */}
          {attachedMediaPreview && (
            <div className="flex items-center gap-3 p-2 rounded-2xl bg-card border border-border max-w-sm">
              <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-black/80 shrink-0 border border-border flex items-center justify-center">
                {attachedMediaType === "video" ? (
                  <video src={attachedMediaPreview} className="h-full w-full object-cover" />
                ) : (
                  <img src={attachedMediaPreview} alt="Preview" className="h-full w-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  {attachedMediaType === "video" ? (
                    <VideoIcon className="h-4 w-4 text-white drop-shadow" />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-white drop-shadow" />
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate text-foreground">{attachedMedia?.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {attachedMedia?.size ? `${(attachedMedia.size / (1024 * 1024)).toFixed(2)} MB` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={removeAttachedMedia}
                className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground shrink-0 transition"
                title="Remove attachment"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Hidden file input */}
            <input
              ref={mediaFileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaFileSelect}
              className="hidden"
            />

            {/* Paperclip attachment button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={sending}
              onClick={() => mediaFileInputRef.current?.click()}
              className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0"
              title="Attach Photo or Video"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Input
              placeholder={attachedMedia ? "Add a caption..." : `Message ${otherParty.fullName || "user"} as Pravixo Admin...`}
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              disabled={sending}
              className="flex-1 bg-background rounded-full border-border text-xs h-10 px-4 focus-visible:ring-primary"
            />

            <Button
              type="submit"
              disabled={(!newMessageText.trim() && !attachedMedia) || sending}
              className="rounded-full gradient-sunset text-white border-0 shadow-glow font-semibold h-10 px-5 flex items-center gap-1.5"
            >
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>{sending ? "Sending..." : "Send"}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Message Action Dialog (Unsend / Delete Single Message) */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-base font-bold">
              Message Options
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Choose how you want to manage or delete this message.
            </DialogDescription>
          </DialogHeader>

          {selectedActionMessage && (
            <div className="rounded-2xl bg-secondary/30 p-3.5 border border-border text-xs text-foreground/80 my-2 max-h-32 overflow-y-auto">
              {selectedActionMessage.metadata?.contentUrl && (
                <div className="text-[11px] font-semibold text-primary mb-1 flex items-center gap-1">
                  📎 Media Attachment: {selectedActionMessage.metadata.fileName || "File"}
                </div>
              )}
              {selectedActionMessage.text ? (
                <p className="italic">"{selectedActionMessage.text}"</p>
              ) : (
                <span className="text-muted-foreground italic">Media only</span>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="destructive"
              disabled={isActionProcessing}
              onClick={() => handleSingleMessageAction("all")}
              className="rounded-full text-xs font-semibold flex-1"
            >
              {isActionProcessing ? "Deleting..." : "Delete for Everyone"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isActionProcessing}
              onClick={() => handleSingleMessageAction("creator")}
              className="rounded-full text-xs font-semibold"
            >
              Hide Creator
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isActionProcessing}
              onClick={() => handleSingleMessageAction("brand")}
              className="rounded-full text-xs font-semibold"
            >
              Hide Brand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


