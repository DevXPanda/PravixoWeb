import { useState, useEffect } from "react";
import {
  HelpCircle,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  MessageSquareText,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/axios";

export function InquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await api.get("/contact/admin/all");
      const list = res.data?.data || res.data || [];
      setInquiries(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Fetch inquiries error:", err);
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/contact/admin/${id}`, { status: newStatus });
      setInquiries((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedInquiry?._id === id) {
        setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
      }
      toast.success(`Inquiry marked as ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      await api.delete(`/contact/admin/${id}`);
      setInquiries((prev) => prev.filter((item) => item._id !== id));
      if (selectedInquiry?._id === id) {
        setSelectedInquiry(null);
      }
      toast.success("Inquiry deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete inquiry");
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setSavingNotes(true);
    try {
      await api.patch(`/contact/admin/${selectedInquiry._id}`, {
        adminNotes: adminNotes,
      });
      setInquiries((prev) =>
        prev.map((item) =>
          item._id === selectedInquiry._id ? { ...item, adminNotes } : item
        )
      );
      setSelectedInquiry((prev) => ({ ...prev, adminNotes }));
      toast.success("Admin notes saved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const filteredInquiries = inquiries.filter((item) => {
    const matchesStatus =
      statusFilter === "all" ? true : item.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      item.name?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.subject?.toLowerCase().includes(q) ||
      item.message?.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "resolved":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Resolved
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20">
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Unread
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            Support Inquiries & Contact Queries
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review user inquiries, questions, and feedback submitted through the contact page.
          </p>
        </div>
        <Button
          onClick={fetchInquiries}
          variant="outline"
          size="sm"
          disabled={loading}
          className="rounded-full h-8 text-xs font-semibold gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">Total Inquiries</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{inquiries.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-blue-400 font-medium">Unread Queries</p>
          <p className="text-2xl font-bold mt-1 text-blue-400">
            {inquiries.filter((i) => i.status === "unread").length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-amber-400 font-medium">In Progress</p>
          <p className="text-2xl font-bold mt-1 text-amber-400">
            {inquiries.filter((i) => i.status === "in_progress").length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-emerald-400 font-medium">Resolved</p>
          <p className="text-2xl font-bold mt-1 text-emerald-400">
            {inquiries.filter((i) => i.status === "resolved").length}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 text-xs px-3 py-1 bg-background border border-input rounded-xl focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-40 text-foreground cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="unread">Unread</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table / List */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
            Loading inquiries...
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            <MessageSquareText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No inquiries match your filter.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredInquiries.map((inquiry) => (
              <div
                key={inquiry._id}
                className="p-4 sm:p-5 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-sm text-foreground">
                      {inquiry.subject}
                    </span>
                    {getStatusBadge(inquiry.status)}
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(inquiry.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {inquiry.message}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 font-medium text-foreground/80">
                      <User className="h-3.5 w-3.5" />
                      {inquiry.name}
                    </span>
                    <a
                      href={`mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(inquiry.subject)}`}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {inquiry.email}
                    </a>
                    {inquiry.adminNotes && (
                      <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                        Has Admin Note
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs rounded-xl"
                    onClick={() => {
                      setSelectedInquiry(inquiry);
                      setAdminNotes(inquiry.adminNotes || "");
                    }}
                  >
                    View Details
                  </Button>

                  <select
                    value={inquiry.status}
                    onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                    className="h-8 text-xs px-2.5 py-1 bg-background border border-input rounded-xl focus:outline-none focus:ring-1 focus:ring-primary w-32 text-foreground cursor-pointer"
                  >
                    <option value="unread">Unread</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-xl"
                    onClick={() => handleDeleteInquiry(inquiry._id)}
                    title="Delete inquiry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inquiry Detail Dialog */}
      {selectedInquiry && (
        <Dialog open={Boolean(selectedInquiry)} onOpenChange={() => setSelectedInquiry(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2 mr-6">
                <DialogTitle className="text-lg font-bold">
                  Inquiry Details
                </DialogTitle>
                {getStatusBadge(selectedInquiry.status)}
              </div>
              <DialogDescription className="text-xs">
                Received on {new Date(selectedInquiry.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="bg-muted/40 p-3 rounded-xl space-y-2 border border-border">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                    Sender Information
                  </span>
                  <p className="font-semibold text-foreground text-sm mt-0.5">{selectedInquiry.name}</p>
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject)}`}
                    className="text-primary hover:underline flex items-center gap-1.5 mt-0.5"
                  >
                    <Mail className="h-3 w-3" /> {selectedInquiry.email}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>

                <div className="border-t border-border/50 pt-2">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                    Subject
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">{selectedInquiry.subject}</p>
                </div>

                <div className="border-t border-border/50 pt-2">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                    Message
                  </span>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed mt-1 bg-card p-3 rounded-lg border border-border">
                    {selectedInquiry.message}
                  </p>
                </div>
              </div>

              {/* Status Update & Admin Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Status</label>
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => handleStatusChange(selectedInquiry._id, e.target.value)}
                    className="h-7 text-xs px-2 py-0.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary w-32 text-foreground cursor-pointer"
                  >
                    <option value="unread">Unread</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Internal Admin Notes
                  </label>
                  <Textarea
                    placeholder="Add internal notes about this resolution or follow up..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="text-xs min-h-[70px] rounded-xl"
                  />
                  <div className="flex justify-end mt-1.5">
                    <Button
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="h-7 text-xs rounded-lg"
                    >
                      {savingNotes ? "Saving..." : "Save Note"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-border pt-3">
              <a
                href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject)}`}
                className="inline-flex"
              >
                <Button size="sm" className="h-8 text-xs rounded-full gap-1.5 gradient-sunset text-white border-0">
                  <Mail className="h-3.5 w-3.5" /> Reply via Email
                </Button>
              </a>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-full"
                onClick={() => setSelectedInquiry(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default InquiriesPage;
