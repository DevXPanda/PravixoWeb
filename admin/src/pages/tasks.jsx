import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import { ClipboardCheck, Search, ChevronLeft, ChevronRight } from "lucide-react";

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = [];
  pages.push(1);
  if (currentPage > 3) {
    pages.push("...");
  }
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (currentPage < totalPages - 2) {
    pages.push("...");
  }
  pages.push(totalPages);
  return pages;
}
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export function TasksPage() {
  useEffect(() => {
    document.title = "Tasks Monitoring — Pravixo Admin";
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [tasks, setTasks] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("/admin/tasks");
        if (res.data.success) {
          setTasks(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      }
    };
    fetchTasks();
  }, []);
  const filtered = useMemo(() => {
    if (!tasks) return null;
    return tasks.filter((t) => {
      const matchesStatus = !statusFilter || t.status === statusFilter;
      const campaignTitle = (t.campaign?.title || t.campaignId?.title || "").toLowerCase();
      const brandName = (t.brand?.fullName || t.brand?.handle || t.brandId?.fullName || t.brandId?.handle || "").toLowerCase();
      const creatorName = (t.creator?.fullName || t.creator?.handle || t.creatorId?.fullName || t.creatorId?.handle || "").toLowerCase();
      const taskTitle = t.title?.toLowerCase() || "";
      const searchLower = search.toLowerCase();

      const matchesSearch =
        !search ||
        campaignTitle.includes(searchLower) ||
        brandName.includes(searchLower) ||
        creatorName.includes(searchLower) ||
        taskTitle.includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [tasks, statusFilter, search]);

  // Pagination (10 tasks per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search]);

  const totalItems = filtered ? filtered.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTasks = useMemo(() => {
    if (!filtered) return null;
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, safeCurrentPage, itemsPerPage]);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "in_progress":
        return "bg-primary/10 text-primary border-primary/20";
      case "revision_requested":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getOverdueStatus = (task) => {
    if (task.status === "completed" || task.status === "approved") {
      return null;
    }
    const isOverdue = new Date(task.dueDate) < new Date();
    if (isOverdue) {
      return (
        <Badge variant="destructive" className="rounded-full text-[10px] font-bold">
          Overdue
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl text-foreground">
            Tasks Monitoring
          </h1>
          <p className="text-sm text-muted-foreground">
            Track workflow progress, deadlines, and deliverables across all active campaigns.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {[
            { label: "All Tasks", value: "" },
            { label: "In Progress", value: "in_progress" },
            { label: "Revision Requested", value: "revision_requested" },
            { label: "Completed", value: "completed" },
            { label: "Approved", value: "approved" },
          ].map((tab) => (
            <Button
              key={tab.value}
              variant={statusFilter === tab.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-full text-xs whitespace-nowrap ${
                statusFilter === tab.value
                  ? "gradient-sunset border-0 text-white shadow-xs"
                  : ""
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, brand, creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 font-semibold text-xs">Campaign</TableHead>
              <TableHead className="font-semibold text-xs">Brand</TableHead>
              <TableHead className="font-semibold text-xs">Creator</TableHead>
              <TableHead className="font-semibold text-xs">Task Title</TableHead>
              <TableHead className="font-semibold text-xs">Status</TableHead>
              <TableHead className="font-semibold text-xs">Started</TableHead>
              <TableHead className="font-semibold text-xs">Completed</TableHead>
              <TableHead className="font-semibold text-xs">Due Date</TableHead>
              <TableHead className="text-right pr-6 font-semibold text-xs">Overdue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!paginatedTasks ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right pr-6"><Skeleton className="h-5 w-16 ml-auto rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : paginatedTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-16 text-center">
                  <ClipboardCheck className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No tasks found
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTasks.map((t) => (
                <TableRow key={t._id}>
                  <TableCell className="pl-6 font-semibold max-w-[150px] truncate">
                    {t.campaign?.title || t.campaignId?.title || "General"}
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate font-medium">
                    {t.brand?.fullName || t.brand?.handle || t.brandId?.fullName || t.brandId?.handle || "Unknown"}
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate font-medium">
                    {t.creator?.fullName || t.creator?.handle || t.creatorId?.fullName || t.creatorId?.handle || "Unknown"}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {t.title}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`rounded-full text-[10px] capitalize font-semibold border-0 ${getStatusColor(
                        t.status
                      )}`}
                    >
                      {t.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {t.startedAt ? format(new Date(t.startedAt), "MMM d, HH:mm") : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {t.completedAt ? format(new Date(t.completedAt), "MMM d, HH:mm") : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(t.dueDate), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {getOverdueStatus(t)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {filtered && filtered.length > 0 && (
          <div className="border-t border-border px-6 py-3.5 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3 bg-secondary/10">
            <div>
              Showing <strong className="text-foreground font-semibold">{(safeCurrentPage - 1) * itemsPerPage + 1}</strong> to{" "}
              <strong className="text-foreground font-semibold">{Math.min(safeCurrentPage * itemsPerPage, totalItems)}</strong> of{" "}
              <strong className="text-foreground font-semibold">{totalItems}</strong> task{totalItems !== 1 && "s"}
              {tasks && totalItems !== tasks.length && ` (filtered from ${tasks.length})`}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="h-8 rounded-full px-2.5 text-xs gap-1 border-border hover:bg-secondary disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </Button>

                <div className="flex items-center gap-1">
                  {getPageNumbers(safeCurrentPage, totalPages).map((p, idx) =>
                    p === "..." ? (
                      <span key={`dots-${idx}`} className="px-1.5 text-muted-foreground">
                        …
                      </span>
                    ) : (
                      <button
                        key={`page-${p}`}
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`h-8 min-w-[32px] px-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          safeCurrentPage === p
                            ? "bg-primary text-white shadow-xs"
                            : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="h-8 rounded-full px-2.5 text-xs gap-1 border-border hover:bg-secondary disabled:opacity-40 cursor-pointer"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
