"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSetTopbarRight } from "@/app/(admin)/_components/AdminTopbarContext";
import {
  Plus, Search, SlidersHorizontal, ChevronDown, LayoutGrid, List,
  Pencil, Eye, MoreVertical, Loader2, X, CheckCircle2, ChevronLeft, ChevronRight,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ListOrdered, List as ListIcon, Link2, Code, Image as ImageIcon, Save,
  Globe, BookOpen, Tag, Info, FileText, ArrowLeft, Strikethrough,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
  id: string; slug: string; title: string; category: string;
  published: boolean; featured: boolean; author: string;
  publishedAt: string; readTime: string; excerpt: string;
}
interface PostFull extends Post {
  content: string; coverImage: string; authorRole: string; authorImage: string;
}

const CATEGORIES = ["Product", "Guide", "Case Study", "Tips", "Announcement", "Tutorial"];
const PAGE_SIZE = 10;

const EMPTY: Omit<PostFull, "id" | "publishedAt"> = {
  slug: "", title: "", excerpt: "", content: "", category: "Guide",
  coverImage: "", author: "", authorRole: "", authorImage: "",
  published: false, featured: false, readTime: "5 min read",
};

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}
function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "U";
}

function StatusBadge({ published }: { published: boolean }) {
  return published ? (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide text-emerald-300" style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)" }}>PUBLISHED</span>
  ) : (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide text-amber-300" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)" }}>DRAFT</span>
  );
}

/* ─── MAIN PAGE ─────────────────────────────────────────────────────────── */
export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "editor">("list");
  const [editorPost, setEditorPost] = useState<PostFull | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const setTopbarRight = useSetTopbarRight();
  const newPostRef = useRef(newPost);
  newPostRef.current = newPost;
  useEffect(() => {
    if (view !== "list") { setTopbarRight(null); return; }
    setTopbarRight(
      <button
        onClick={() => newPostRef.current()}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold text-white"
        style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)", boxShadow: "0 0 16px rgba(37,99,235,0.25)" }}
      >
        <Plus className="h-3.5 w-3.5" /> New Post
      </button>
    );
    return () => setTopbarRight(null);
  }, [view, setTopbarRight]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/blog");
    if (res.ok) setPosts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function openEditor(p: Post) {
    const res = await fetch(`/api/admin/blog/${p.id}`);
    if (res.ok) { setEditorPost(await res.json()); setIsNew(false); setView("editor"); }
  }

  function newPost() { setEditorPost(null); setIsNew(true); setView("editor"); }

  const filtered = posts
    .filter((p) => {
      if (statusFilter === "published" && !p.published) return false;
      if (statusFilter === "draft" && p.published) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.author.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const da = new Date(a.publishedAt || 0).getTime();
      const db = new Date(b.publishedAt || 0).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.filter((p) => !p.published).length;

  if (view === "editor") {
    return <BlogEditor post={editorPost} isNew={isNew} onBack={() => { setView("list"); load(); }} />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Posts", value: posts.length, icon: <FileText className="h-5 w-5" />, color: "#60A5FA", bg: "rgba(96,165,250,0.1)" },
          { label: "Published", value: publishedCount, icon: <Globe className="h-5 w-5" />, color: "#34D399", bg: "rgba(52,211,153,0.1)" },
          { label: "Drafts", value: draftCount, icon: <BookOpen className="h-5 w-5" />, color: "#FBBF24", bg: "rgba(251,191,36,0.1)" },
          { label: "Archived", value: 0, icon: <Tag className="h-5 w-5" />, color: "#A78BFA", bg: "rgba(167,139,250,0.1)" },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl" style={{ background: bg, color }}>{icon}</div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#6B7280" }}>{label}</p>
              <p className="text-[26px] font-bold leading-tight tabular-nums" style={{ color }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "#6B7280" }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search posts by title or author..." className="h-10 pl-9 pr-4 rounded-xl text-[13px] placeholder:text-slate-600 focus:outline-none w-64" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)", color: "#E2E8F0" }} />
        </div>
        <div className="flex-1" />
        <button
          onClick={() => { setStatusFilter((f) => f === "all" ? "published" : f === "published" ? "draft" : "all"); setPage(1); }}
          className="inline-flex items-center gap-2 h-10 px-3 rounded-xl text-[13px] transition"
          style={{ background: statusFilter !== "all" ? "rgba(37,99,235,0.12)" : "#0F1629", border: `1px solid ${statusFilter !== "all" ? "rgba(37,99,235,0.3)" : "rgba(255,255,255,0.07)"}`, color: statusFilter !== "all" ? "#60A5FA" : "#9CA3AF" }}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {statusFilter === "all" ? "Filter" : statusFilter === "published" ? "Published" : "Drafts"}
        </button>
        <button
          onClick={() => setSortOrder((s) => s === "newest" ? "oldest" : "newest")}
          className="inline-flex items-center gap-2 h-10 px-3 rounded-xl text-[13px] transition"
          style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)", color: "#9CA3AF" }}
        >
          Sort: {sortOrder === "newest" ? "Newest" : "Oldest"} <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </button>
        <div className="flex items-center gap-0.5 p-1 rounded-xl" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={() => setViewMode("grid")} className={cn("flex size-8 items-center justify-center rounded-lg transition", viewMode === "grid" ? "text-white bg-white/[0.09]" : "text-slate-600 hover:text-slate-400")}>
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setViewMode("list")} className={cn("flex size-8 items-center justify-center rounded-lg transition", viewMode === "list" ? "text-white bg-white/[0.09]" : "text-slate-600 hover:text-slate-400")}>
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-blue-400" /></div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#080C18" }}>
                {[["POST", "px-4 w-[44%]"], ["STATUS", "px-3"], ["AUTHOR", "px-3"], ["PUBLISHED", "px-3"], ["ACTIONS", "px-3"]].map(([h, cls]) => (
                  <th key={h} className={`py-3 text-left text-[11px] font-bold uppercase tracking-widest ${cls}`} style={{ color: "#6B7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-600">No posts found</td></tr>
              ) : paginated.map((p, i) => {
                const hue = (p.title.charCodeAt(0) * 13 + p.category.charCodeAt(0) * 7) % 360;
                const d = p.publishedAt ? new Date(p.publishedAt) : null;
                return (
                  <tr key={p.id} className="group" style={{ borderBottom: i < paginated.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: "#0A0F1E" }}>
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className="size-[60px] rounded-xl shrink-0 flex items-center justify-center overflow-hidden" style={{ background: `hsl(${hue},35%,22%)`, border: "1px solid rgba(255,255,255,0.07)" }}>
                          <span className="text-[8px] font-black text-white/60 text-center px-1.5 uppercase leading-tight">{p.category}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-slate-100 line-clamp-1 mb-1">{p.title}</p>
                          <p className="text-[12px] line-clamp-2 leading-relaxed" style={{ color: "#6B7280" }}>{p.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 align-middle"><StatusBadge published={p.published} /></td>
                    <td className="px-3 py-4 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}>{getInitials(p.author)}</div>
                        <div>
                          <p className="text-[13px] font-semibold text-slate-200 leading-none">{p.author || "—"}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: "#6B7280" }}>test@ugcads.us</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 align-middle">
                      {d && p.published ? (
                        <div>
                          <p className="text-[13px] text-slate-300">{d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                          <p className="text-[11px]" style={{ color: "#6B7280" }}>{d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                        </div>
                      ) : <span className="text-slate-600 text-lg">—</span>}
                    </td>
                    <td className="px-3 py-4 align-middle">
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => openEditor(p)} className="flex size-8 items-center justify-center rounded-lg text-slate-600 hover:text-sky-400 hover:bg-white/[0.05] transition"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => window.open(`/blog/${p.slug}`, "_blank")} className="flex size-8 items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition" title="View post"><Eye className="h-3.5 w-3.5" /></button>
                        <button className="flex size-8 items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition"><MoreVertical className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#080C18" }}>
            <p className="text-[13px]" style={{ color: "#6B7280" }}>
              Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} posts
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex size-8 items-center justify-center rounded-lg text-slate-500 disabled:opacity-30 hover:text-slate-300 hover:bg-white/[0.05] transition">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)} className="flex size-8 items-center justify-center rounded-lg text-[13px] font-semibold transition-all" style={page === n ? { background: "#2563EB", color: "white" } : { color: "#6B7280" }}>{n}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex size-8 items-center justify-center rounded-lg text-slate-500 disabled:opacity-30 hover:text-slate-300 hover:bg-white/[0.05] transition">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── BLOG EDITOR ────────────────────────────────────────────────────────── */
function BlogEditor({ post, isNew, onBack }: { post: PostFull | null; isNew: boolean; onBack: () => void }) {
  const [form, setForm] = useState<typeof EMPTY>({ ...EMPTY, ...(post ? { slug: post.slug, title: post.title, excerpt: post.excerpt, content: post.content, category: post.category, coverImage: post.coverImage, author: post.author, authorRole: post.authorRole, authorImage: post.authorImage, published: post.published, featured: post.featured, readTime: post.readTime } : {}) });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [sidebarTab, setSidebarTab] = useState<"post" | "image">("post");
  const [slugEditing, setSlugEditing] = useState(false);
  const [tags, setTags] = useState<string[]>(["ugc", "marketing"]);
  const [tagInput, setTagInput] = useState("");
  const [seoTitle, setSeoTitle] = useState(post?.title || "");
  const [metaDesc, setMetaDesc] = useState(post?.excerpt || "");
  const [focusKw, setFocusKw] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const editorKey = useRef(post?.id ?? "new");

  const field = (key: keyof typeof EMPTY, val: string | boolean) => setForm((f) => ({ ...f, [key]: val }));

  // Set initial content
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = form.content || "";
      updateCounts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-slug
  useEffect(() => {
    if (isNew && !slugEditing) field("slug", slugify(form.title));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  function updateCounts() {
    if (!editorRef.current) return;
    const text = editorRef.current.textContent || "";
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    setCharCount(text.length);
  }

  function exec(cmd: string, val?: string) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    updateCounts();
  }

  function insertLink() {
    const url = window.prompt("Enter URL:");
    if (url) exec("createLink", url);
  }

  function insertImage() {
    const url = window.prompt("Enter image URL:");
    if (url) exec("insertHTML", `<img src="${url}" style="max-width:100%;border-radius:8px;margin:8px 0" alt="" />`);
  }

  async function save(asPublished?: boolean) {
    setSaving(true); setSaveStatus("saving");
    const content = editorRef.current?.innerHTML || form.content;
    const payload = { ...form, content, published: asPublished ?? form.published };
    if (asPublished !== undefined) field("published", asPublished);
    try {
      const res = isNew
        ? await fetch("/api/admin/blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch(`/api/admin/blog/${post!.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { setSaveStatus("saved"); setTimeout(() => setSaveStatus("idle"), 4000); }
    } catch { setSaveStatus("idle"); }
    setSaving(false);
  }

  async function handleDelete() {
    if (!post || !confirm(`Delete "${post.title}"?`)) return;
    await fetch(`/api/admin/blog/${post.id}`, { method: "DELETE" });
    onBack();
  }

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] min-h-0 -mx-6 -mt-6">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-3 shrink-0" style={{ background: "#080C18", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-300 transition mr-2">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-[13px] text-slate-500">ADMIN</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-700" />
        <button onClick={onBack} className="text-[13px] text-slate-500 hover:text-slate-300 transition">Blog</button>
        <ChevronRight className="h-3.5 w-3.5 text-slate-700" />
        <span className="text-[13px] font-semibold text-slate-200">{isNew ? "New Post" : form.title || "Edit Post"}</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-[12px] text-emerald-400 font-medium">Live</span>
        </div>
        <button onClick={() => save(false)} disabled={saving} className="flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-semibold text-slate-300 hover:text-white transition" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <Save className="h-3.5 w-3.5" /> Save Draft
        </button>
        <button
          onClick={() => form.slug && window.open(`/blog/${form.slug}`, "_blank")}
          disabled={!form.slug}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-semibold text-slate-300 hover:text-white transition disabled:opacity-40"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Eye className="h-3.5 w-3.5" /> Preview
        </button>
        <button onClick={() => save(true)} disabled={saving} className="flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-bold text-white transition-all" style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)", boxShadow: "0 0 16px rgba(37,99,235,0.3)" }}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
          Publish
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Main editor */}
        <div className="flex-1 min-w-0 overflow-y-auto px-8 py-6 space-y-5">
          {/* Title */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1" style={{ color: "#9CA3AF" }}>
              Title <span className="text-red-400">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => field("title", e.target.value)}
              placeholder="Enter post title..."
              className="w-full h-12 rounded-xl px-4 text-[16px] font-semibold placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition"
              style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)", color: "#F1F5F9" }}
            />
          </div>

          {/* Permalink */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#9CA3AF" }}>Permalink</label>
              <Info className="h-3.5 w-3.5" style={{ color: "#4B5563" }} />
            </div>
            <div className="flex items-center h-11 rounded-xl overflow-hidden" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="px-3 text-[13px] shrink-0 border-r h-full flex items-center" style={{ color: "#4B5563", borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
                https://www.ugcads.us/blog/
              </span>
              {slugEditing ? (
                <input
                  value={form.slug}
                  onChange={(e) => field("slug", e.target.value)}
                  onBlur={() => setSlugEditing(false)}
                  autoFocus
                  className="flex-1 px-3 text-[13px] bg-transparent focus:outline-none"
                  style={{ color: "#E2E8F0" }}
                />
              ) : (
                <span className="flex-1 px-3 text-[13px]" style={{ color: "#E2E8F0" }}>{form.slug || "post-slug"}</span>
              )}
              <button onClick={() => setSlugEditing(true)} className="px-3 text-[12px] font-semibold text-blue-400 hover:text-blue-300 transition shrink-0">Edit</button>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#9CA3AF" }}>Excerpt</label>
              <Info className="h-3.5 w-3.5" style={{ color: "#4B5563" }} />
            </div>
            <div className="relative">
              <textarea
                value={form.excerpt}
                onChange={(e) => field("excerpt", e.target.value.slice(0, 160))}
                rows={3}
                placeholder="Short description displayed in the post listing..."
                className="w-full rounded-xl px-4 py-3 text-[14px] placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40 resize-none transition"
                style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0" }}
              />
              <span className="absolute bottom-2.5 right-3 text-[11px]" style={{ color: "#4B5563" }}>{form.excerpt.length} / 160</span>
            </div>
          </div>

          {/* Content editor */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1" style={{ color: "#9CA3AF" }}>
              Content <span className="text-red-400">*</span>
            </label>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              {/* Toolbar */}
              <div className="flex items-center gap-0.5 flex-wrap px-3 py-2" style={{ background: "#080C18", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {/* Heading select */}
                <select
                  onChange={(e) => exec("formatBlock", e.target.value)}
                  defaultValue="p"
                  className="h-7 rounded-lg px-2 text-[12px] font-medium mr-1 focus:outline-none appearance-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#9CA3AF" }}
                >
                  <option value="p">Normal</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                </select>
                <div className="w-px h-5 mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />
                {[
                  { icon: <Bold className="h-3.5 w-3.5" />, cmd: "bold", title: "Bold" },
                  { icon: <Italic className="h-3.5 w-3.5" />, cmd: "italic", title: "Italic" },
                  { icon: <Underline className="h-3.5 w-3.5" />, cmd: "underline", title: "Underline" },
                  { icon: <Strikethrough className="h-3.5 w-3.5" />, cmd: "strikeThrough", title: "Strikethrough" },
                ].map(({ icon, cmd, title }) => (
                  <ToolbarBtn key={cmd} title={title} onClick={() => exec(cmd)}>{icon}</ToolbarBtn>
                ))}
                <div className="w-px h-5 mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />
                {[
                  { icon: <ListOrdered className="h-3.5 w-3.5" />, cmd: "insertOrderedList", title: "Ordered list" },
                  { icon: <ListIcon className="h-3.5 w-3.5" />, cmd: "insertUnorderedList", title: "Unordered list" },
                ].map(({ icon, cmd, title }) => (
                  <ToolbarBtn key={cmd} title={title} onClick={() => exec(cmd)}>{icon}</ToolbarBtn>
                ))}
                <div className="w-px h-5 mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />
                {[
                  { icon: <AlignLeft className="h-3.5 w-3.5" />, cmd: "justifyLeft", title: "Align left" },
                  { icon: <AlignCenter className="h-3.5 w-3.5" />, cmd: "justifyCenter", title: "Center" },
                  { icon: <AlignRight className="h-3.5 w-3.5" />, cmd: "justifyRight", title: "Align right" },
                  { icon: <AlignJustify className="h-3.5 w-3.5" />, cmd: "justifyFull", title: "Justify" },
                ].map(({ icon, cmd, title }) => (
                  <ToolbarBtn key={cmd} title={title} onClick={() => exec(cmd)}>{icon}</ToolbarBtn>
                ))}
                <div className="w-px h-5 mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />
                <ToolbarBtn title="Insert link" onClick={insertLink}><Link2 className="h-3.5 w-3.5" /></ToolbarBtn>
                <ToolbarBtn title="Insert image" onClick={insertImage}><ImageIcon className="h-3.5 w-3.5" /></ToolbarBtn>
                <ToolbarBtn title="Code" onClick={() => exec("formatBlock", "pre")}><Code className="h-3.5 w-3.5" /></ToolbarBtn>
              </div>

              {/* Editable area */}
              <div
                key={editorKey.current}
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={updateCounts}
                className="min-h-[400px] p-5 focus:outline-none text-[14px] leading-7"
                style={{
                  background: "#0A0F1E",
                  color: "#CBD5E1",
                  // Prose-like styles injected via className below
                }}
              />
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-[320px] shrink-0 overflow-y-auto border-l" style={{ borderColor: "rgba(255,255,255,0.07)", background: "#080C18" }}>
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            {(["post", "image"] as const).map((t) => (
              <button key={t} onClick={() => setSidebarTab(t)} className={cn("flex-1 py-3 text-[13px] font-semibold capitalize transition-colors", sidebarTab === t ? "text-blue-400 border-b-2 border-blue-500" : "text-slate-500 hover:text-slate-300")}>
                {t === "post" ? "Post" : "Featured Image"}
              </button>
            ))}
          </div>

          {sidebarTab === "post" ? (
            <div className="p-4 space-y-5">
              {/* Status */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#6B7280" }}>Status</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <span className={cn("h-2 w-2 rounded-full", form.published ? "bg-emerald-400" : "bg-amber-400")} />
                  </div>
                  <select
                    value={form.published ? "published" : "draft"}
                    onChange={(e) => field("published", e.target.value === "published")}
                    className="w-full h-10 pl-8 pr-8 rounded-xl text-[13px] focus:outline-none appearance-none transition"
                    style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0" }}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#4B5563" }} />
                </div>
              </div>

              {/* Author */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#6B7280" }}>Author</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}>
                    {getInitials(form.author || "A")}
                  </div>
                  <input
                    value={form.author}
                    onChange={(e) => field("author", e.target.value)}
                    placeholder="Author name"
                    className="w-full h-10 pl-11 pr-4 rounded-xl text-[13px] placeholder:text-slate-600 focus:outline-none transition"
                    style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0" }}
                  />
                </div>
                <input
                  value={form.authorRole}
                  onChange={(e) => field("authorRole", e.target.value)}
                  placeholder="Author role (e.g. CEO)"
                  className="w-full h-9 mt-1.5 px-3 rounded-xl text-[12px] placeholder:text-slate-600 focus:outline-none transition"
                  style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)", color: "#9CA3AF" }}
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#6B7280" }}>Category</label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) => field("category", e.target.value)}
                    className="w-full h-10 px-3 pr-8 rounded-xl text-[13px] focus:outline-none appearance-none transition"
                    style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0" }}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#4B5563" }} />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#6B7280" }}>Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-300" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {t}
                      <button onClick={() => setTags((prev) => prev.filter((x) => x !== t))} className="text-slate-500 hover:text-red-400 transition ml-0.5">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && tagInput.trim()) { setTags((p) => [...p, tagInput.trim()]); setTagInput(""); } }}
                    placeholder="Add a tag..."
                    className="flex-1 h-9 px-3 rounded-xl text-[12px] placeholder:text-slate-600 focus:outline-none transition"
                    style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0" }}
                  />
                  <button
                    onClick={() => { if (tagInput.trim()) { setTags((p) => [...p, tagInput.trim()]); setTagInput(""); } }}
                    className="flex size-9 items-center justify-center rounded-xl text-slate-500 hover:text-slate-300 transition"
                    style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Read time */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#6B7280" }}>Read Time</label>
                <input
                  value={form.readTime}
                  onChange={(e) => field("readTime", e.target.value)}
                  className="w-full h-9 px-3 rounded-xl text-[13px] focus:outline-none transition"
                  style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0" }}
                />
              </div>

              <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }} />

              {/* SEO */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "#6B7280" }}>SEO</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: "#6B7280" }}>SEO Title</label>
                    <input
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value.slice(0, 60))}
                      className="w-full h-9 px-3 rounded-xl text-[13px] focus:outline-none transition"
                      style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0" }}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex-1 h-1 rounded-full mr-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${(seoTitle.length / 60) * 100}%`, background: seoTitle.length <= 60 ? "#22C55E" : "#EF4444" }} />
                      </div>
                      <span className="text-[11px]" style={{ color: seoTitle.length > 50 ? "#22C55E" : "#6B7280" }}>{seoTitle.length} / 60 characters</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: "#6B7280" }}>Meta Description</label>
                    <textarea
                      value={metaDesc}
                      onChange={(e) => setMetaDesc(e.target.value.slice(0, 160))}
                      rows={3}
                      className="w-full rounded-xl px-3 py-2 text-[12px] focus:outline-none resize-none transition"
                      style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0" }}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex-1 h-1 rounded-full mr-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${(metaDesc.length / 160) * 100}%`, background: metaDesc.length >= 100 ? "#22C55E" : "#6B7280" }} />
                      </div>
                      <span className="text-[11px]" style={{ color: metaDesc.length >= 100 ? "#22C55E" : "#6B7280" }}>{metaDesc.length} / 160 characters</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: "#6B7280" }}>Focus Keyword</label>
                    <input
                      value={focusKw}
                      onChange={(e) => setFocusKw(e.target.value.slice(0, 100))}
                      placeholder="e.g. ugc ads"
                      className="w-full h-9 px-3 rounded-xl text-[13px] placeholder:text-slate-600 focus:outline-none transition"
                      style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0" }}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex-1 h-1 rounded-full mr-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${(focusKw.length / 100) * 100}%`, background: "#22C55E" }} />
                      </div>
                      <span className="text-[11px]" style={{ color: "#6B7280" }}>{focusKw.length} / 100 characters</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }} />

              {/* Social preview */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "#6B7280" }}>Social Preview</p>
                <div className="rounded-xl overflow-hidden" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="p-3">
                    <p className="text-[10px] mb-1" style={{ color: "#6B7280" }}>www.ugcads.us</p>
                    <p className="text-[13px] font-bold text-blue-400 line-clamp-2 mb-1">{seoTitle || form.title || "Post Title"}</p>
                    <p className="text-[11px] line-clamp-2 leading-relaxed" style={{ color: "#9CA3AF" }}>{metaDesc || form.excerpt || "Meta description will appear here."}</p>
                  </div>
                  {form.coverImage && (
                    <div className="h-24 overflow-hidden">
                      <img src={form.coverImage} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Danger zone */}
              {!isNew && (
                <div className="pt-2">
                  <button onClick={handleDelete} className="w-full h-9 rounded-xl text-[13px] font-semibold text-red-400 hover:bg-red-500/10 transition" style={{ border: "1px solid rgba(239,68,68,0.2)" }}>
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#6B7280" }}>Cover Image URL</label>
                <input
                  value={form.coverImage}
                  onChange={(e) => field("coverImage", e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 px-3 rounded-xl text-[13px] placeholder:text-slate-600 focus:outline-none transition"
                  style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0" }}
                />
              </div>
              {form.coverImage && (
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  <img src={form.coverImage} alt="" className="w-full object-cover max-h-48" />
                </div>
              )}
              {!form.coverImage && (
                <div className="rounded-xl flex flex-col items-center justify-center py-12 gap-3" style={{ border: "2px dashed rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                  <ImageIcon className="h-8 w-8 text-slate-700" />
                  <p className="text-[13px] text-slate-600">Add a cover image URL above</p>
                </div>
              )}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#6B7280" }}>Author Image URL</label>
                <input
                  value={form.authorImage}
                  onChange={(e) => field("authorImage", e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 px-3 rounded-xl text-[13px] placeholder:text-slate-600 focus:outline-none transition"
                  style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center gap-4 px-8 py-2.5 shrink-0" style={{ background: "#080C18", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <span className="text-[12px]" style={{ color: "#6B7280" }}>Words: <span className="text-slate-400">{wordCount}</span></span>
        <span className="text-[12px]" style={{ color: "#6B7280" }}>Characters: <span className="text-slate-400">{charCount.toLocaleString()}</span></span>
        <div className="flex items-center gap-1.5">
          {saveStatus === "saved" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
          {saveStatus === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />}
          <span className="text-[12px]" style={{ color: saveStatus === "saved" ? "#34D399" : saveStatus === "saving" ? "#60A5FA" : "#6B7280" }}>
            {saveStatus === "saved" ? "Saved just now" : saveStatus === "saving" ? "Saving..." : "Unsaved changes"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── TOOLBAR BUTTON ─────────────────────────────────────────────────────── */
function ToolbarBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="flex size-7 items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.07] transition-colors"
    >
      {children}
    </button>
  );
}
