import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../lib/axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../components/ui/dialog";

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

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    title: "", content: "", category: "Marketing Strategies", targetRole: "brand", coverImageUrl: "", published: true
  });

  const categories = [
    "How to Create Effective Campaigns", "Campaign Best Practices", "Creator Selection Tips", 
    "Marketing Strategies", "How to Increase Gig Performance", "Profile Optimization", 
    "Better Content Creation", "Increase Earnings", "Personal Branding"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      const title = (b.title || "").toLowerCase();
      const content = (b.content || "").toLowerCase();
      const cat = (b.category || "").toLowerCase();
      const role = (b.targetRole || "").toLowerCase();
      return title.includes(q) || content.includes(q) || cat.includes(q) || role.includes(q);
    });
  }, [blogs, search]);

  const totalBlogs = filteredBlogs.length;
  const totalPages = Math.max(1, Math.ceil(totalBlogs / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedBlogs = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredBlogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBlogs, safeCurrentPage, itemsPerPage]);

  const fetchData = async () => {
    try {
      const res = await api.get("/admin/content/blogs");
      setBlogs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/content/blogs", formData);
      setOpen(false);
      setFormData({ title: "", content: "", category: "Marketing Strategies", targetRole: "brand", coverImageUrl: "", published: true });
      fetchData();
    } catch (err) {
      alert("Error saving blog");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await api.delete(`/admin/content/blogs/${id}`);
      fetchData();
    } catch (err) {
      alert("Error deleting blog");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Blogs</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Manage blog posts for creators and brands.
          </p>
        </div>

        <div className="flex justify-start sm:justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full gradient-sunset border-0 text-white shadow-glow text-xs font-semibold">
                <Plus className="h-4 w-4 mr-2" /> Add Blog
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl p-6">
              <DialogHeader>
                <DialogTitle>Add Blog Post</DialogTitle>
                <DialogDescription className="hidden">Add a new blog post</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label>Title</Label>
                  <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="rounded-xl" />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea className="min-h-[150px] rounded-xl" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <select 
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Target Audience</Label>
                    <select 
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={formData.targetRole} onChange={e => setFormData({...formData, targetRole: e.target.value})}
                    >
                      <option value="brand">Brands</option>
                      <option value="creator">Creators</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Cover Image URL</Label>
                  <Input value={formData.coverImageUrl} onChange={e => setFormData({...formData, coverImageUrl: e.target.value})} placeholder="https://..." className="rounded-xl" />
                </div>
                <Button type="submit" className="w-full rounded-full gradient-sunset text-white font-semibold">Save Blog</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9 rounded-full bg-card/60 border-border/60"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-muted-foreground">Loading blogs...</div>
      ) : (
        <>
          {/* Mobile Card View (< md) */}
          <div className="space-y-3 md:hidden">
            {paginatedBlogs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs rounded-2xl border border-border bg-card">
                No blogs found.
              </div>
            ) : (
              paginatedBlogs.map((b) => (
                <div key={b._id} className="p-4 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    {b.coverImageUrl && (
                      <img src={b.coverImageUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-border shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-foreground leading-tight">{b.title}</h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                          {b.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase">
                          {b.targetRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-border/40">
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:bg-destructive/10" onClick={() => handleDelete(b._id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (md+) */}
          <div className="hidden md:block rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table className="min-w-[650px]">
                <TableHeader>
                  <TableRow className="bg-secondary/20 hover:bg-secondary/20">
                    <TableHead className="pl-6">Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Target Audience</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBlogs.map(b => (
                    <TableRow key={b._id}>
                      <TableCell className="pl-6 font-medium">
                        <div className="flex items-center gap-3">
                          {b.coverImageUrl && <img src={b.coverImageUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-border" onError={(e) => { e.target.style.display = 'none'; }} />}
                          <span className="text-sm font-semibold">{b.title}</span>
                        </div>
                      </TableCell>
                      <TableCell><span className="text-xs text-muted-foreground">{b.category}</span></TableCell>
                      <TableCell className="capitalize"><span className="text-xs font-semibold">{b.targetRole}</span></TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(b._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedBlogs.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground text-xs">No blogs found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalBlogs > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/40 text-xs">
              <span className="text-muted-foreground order-2 sm:order-1">
                Showing <strong className="text-foreground">{(safeCurrentPage - 1) * itemsPerPage + 1}</strong> to{" "}
                <strong className="text-foreground">{Math.min(safeCurrentPage * itemsPerPage, totalBlogs)}</strong> of{" "}
                <strong className="text-foreground">{totalBlogs}</strong> blogs
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage === 1}
                    className="h-8 px-2.5 rounded-full border-border/60 hover:bg-accent disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                  </Button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers(safeCurrentPage, totalPages).map((page, idx) =>
                      page === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={page}
                          variant={safeCurrentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`h-8 w-8 p-0 rounded-full text-xs font-semibold ${
                            safeCurrentPage === page
                              ? "gradient-sunset text-white border-0 shadow-xs"
                              : "border-border/60 hover:bg-accent"
                          }`}
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage === totalPages}
                    className="h-8 px-2.5 rounded-full border-border/60 hover:bg-accent disabled:opacity-40"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
