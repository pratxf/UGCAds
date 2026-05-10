"use client";

import { useState, useEffect, useCallback } from "react";
import { PenLine, Plus, Trash2, Eye, EyeOff, Star, StarOff, Save, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  slug: string;
  title: string;
  category: string;
  published: boolean;
  featured: boolean;
  author: string;
  publishedAt: string;
  readTime: string;
}

interface PostFull extends Post {
  excerpt: string;
  content: string;
  coverImage: string;
  authorRole: string;
  authorImage: string;
}

const CATEGORIES = ["Product", "Guide", "Case Study", "Tips"];

const EMPTY: Omit<PostFull, "id" | "publishedAt"> = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  category: "Product",
  coverImage: "",
  author: "",
  authorRole: "",
  authorImage: "",
  published: false,
  featured: false,
  readTime: "5 min read",
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selected, setSelected] = useState<PostFull | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState("");

  const loadPosts = useCallback(async () => {
    const res = await fetch("/api/admin/blog");
    if (res.ok) setPosts(await res.json());
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  async function selectPost(p: Post) {
    const res = await fetch(`/api/admin/blog/${p.id}`);
    if (res.ok) {
      const full: PostFull = await res.json();
      setSelected(full);
      setForm({
        slug: full.slug, title: full.title, excerpt: full.excerpt,
        content: full.content, category: full.category, coverImage: full.coverImage,
        author: full.author, authorRole: full.authorRole, authorImage: full.authorImage,
        published: full.published, featured: full.featured, readTime: full.readTime,
      });
      setIsNew(false);
    }
  }

  function startNew() {
    setSelected(null);
    setForm(EMPTY);
    setIsNew(true);
  }

  async function handleSave() {
    if (!form.title || !form.slug) { setMsg("Title and slug are required"); return; }
    setSaving(true);
    setMsg("");
    try {
      let res: Response;
      if (isNew) {
        res = await fetch("/api/admin/blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      } else {
        res = await fetch(`/api/admin/blog/${selected!.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      }
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const saved: PostFull = await res.json();
      setSelected(saved);
      setIsNew(false);
      setMsg("Saved");
      loadPosts();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to save");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!selected || !confirm(`Delete "${selected.title}"?`)) return;
    setDeleting(true);
    await fetch(`/api/admin/blog/${selected.id}`, { method: "DELETE" });
    setSelected(null);
    setForm(EMPTY);
    setIsNew(false);
    loadPosts();
    setDeleting(false);
  }

  const field = (key: keyof typeof EMPTY, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)] min-h-0">
      {/* Post list */}
      <div className="w-[280px] shrink-0 flex flex-col gap-3">
        <button
          onClick={startNew}
          className="flex items-center gap-2 w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition"
          style={{ background: "linear-gradient(135deg, #0EA5E9, #2563EB)" }}
        >
          <Plus className="h-4 w-4" /> New Post
        </button>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {posts.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPost(p)}
              className={cn(
                "w-full text-left rounded-xl px-3.5 py-3 border transition-all",
                selected?.id === p.id
                  ? "border-sky-500/40 bg-sky-500/10"
                  : "border-white/5 bg-white/[0.03] hover:bg-white/[0.06]"
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{p.category}</span>
                <div className="flex items-center gap-1.5">
                  {p.featured && <Star className="h-3 w-3 text-amber-400" fill="currentColor" />}
                  {p.published
                    ? <span className="size-1.5 rounded-full bg-emerald-400" />
                    : <span className="size-1.5 rounded-full bg-slate-600" />}
                </div>
              </div>
              <p className="text-[12.5px] font-medium text-slate-200 leading-snug line-clamp-2">{p.title}</p>
              <p className="text-[11px] text-slate-600 mt-1">{p.author}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      {(isNew || selected) ? (
        <div className="flex-1 min-w-0 rounded-2xl overflow-hidden flex flex-col"
          style={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.07)" }}>

          {/* Editor header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 text-slate-300">
              <PenLine className="h-4 w-4" />
              <span className="text-[13px] font-semibold">{isNew ? "New Post" : "Edit Post"}</span>
            </div>
            <div className="flex items-center gap-2">
              {msg && <span className={cn("text-[12px] font-medium", msg === "Saved" ? "text-emerald-400" : "text-red-400")}>{msg}</span>}
              {!isNew && (
                <button onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-red-400 hover:bg-red-500/10 transition">
                  <Trash2 className="h-3.5 w-3.5" /> {deleting ? "Deleting..." : "Delete"}
                </button>
              )}
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[12px] font-semibold text-white transition"
                style={{ background: "#2563EB" }}>
                <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Title</label>
                <input value={form.title} onChange={(e) => field("title", e.target.value)}
                  placeholder="Post title"
                  className="w-full rounded-xl px-3.5 py-2.5 text-[14px] font-semibold text-slate-100 bg-white/[0.05] border border-white/10 focus:border-sky-500/50 focus:outline-none placeholder-slate-600" />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Slug</label>
                <input value={form.slug} onChange={(e) => field("slug", e.target.value)}
                  placeholder="post-slug-url"
                  className="w-full rounded-xl px-3.5 py-2.5 text-[13px] text-slate-300 bg-white/[0.05] border border-white/10 focus:border-sky-500/50 focus:outline-none placeholder-slate-600" />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Category</label>
                <select value={form.category} onChange={(e) => field("category", e.target.value)}
                  className="w-full rounded-xl px-3.5 py-2.5 text-[13px] text-slate-300 bg-[#0B1120] border border-white/10 focus:border-sky-500/50 focus:outline-none">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Author</label>
                <input value={form.author} onChange={(e) => field("author", e.target.value)}
                  placeholder="Name"
                  className="w-full rounded-xl px-3.5 py-2.5 text-[13px] text-slate-300 bg-white/[0.05] border border-white/10 focus:border-sky-500/50 focus:outline-none placeholder-slate-600" />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Author Role</label>
                <input value={form.authorRole} onChange={(e) => field("authorRole", e.target.value)}
                  placeholder="CEO"
                  className="w-full rounded-xl px-3.5 py-2.5 text-[13px] text-slate-300 bg-white/[0.05] border border-white/10 focus:border-sky-500/50 focus:outline-none placeholder-slate-600" />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Cover Image URL</label>
                <input value={form.coverImage} onChange={(e) => field("coverImage", e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl px-3.5 py-2.5 text-[13px] text-slate-300 bg-white/[0.05] border border-white/10 focus:border-sky-500/50 focus:outline-none placeholder-slate-600" />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Author Image URL</label>
                <input value={form.authorImage} onChange={(e) => field("authorImage", e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl px-3.5 py-2.5 text-[13px] text-slate-300 bg-white/[0.05] border border-white/10 focus:border-sky-500/50 focus:outline-none placeholder-slate-600" />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Read Time</label>
                <input value={form.readTime} onChange={(e) => field("readTime", e.target.value)}
                  placeholder="5 min read"
                  className="w-full rounded-xl px-3.5 py-2.5 text-[13px] text-slate-300 bg-white/[0.05] border border-white/10 focus:border-sky-500/50 focus:outline-none placeholder-slate-600" />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Excerpt</label>
                <textarea value={form.excerpt} onChange={(e) => field("excerpt", e.target.value)}
                  rows={2} placeholder="Short description shown in listing..."
                  className="w-full rounded-xl px-3.5 py-2.5 text-[13px] text-slate-300 bg-white/[0.05] border border-white/10 focus:border-sky-500/50 focus:outline-none placeholder-slate-600 resize-none" />
              </div>

              <div className="col-span-2 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div onClick={() => field("published", !form.published)}
                    className={cn("w-9 h-5 rounded-full transition-colors relative", form.published ? "bg-emerald-500" : "bg-white/10")}>
                    <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all", form.published ? "left-[18px]" : "left-0.5")} />
                  </div>
                  <span className="text-[12px] font-medium text-slate-400 flex items-center gap-1">
                    {form.published ? <Eye className="h-3.5 w-3.5 text-emerald-400" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {form.published ? "Published" : "Draft"}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div onClick={() => field("featured", !form.featured)}
                    className={cn("w-9 h-5 rounded-full transition-colors relative", form.featured ? "bg-amber-500" : "bg-white/10")}>
                    <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all", form.featured ? "left-[18px]" : "left-0.5")} />
                  </div>
                  <span className="text-[12px] font-medium text-slate-400 flex items-center gap-1">
                    {form.featured ? <Star className="h-3.5 w-3.5 text-amber-400" fill="currentColor" /> : <StarOff className="h-3.5 w-3.5" />}
                    {form.featured ? "Featured" : "Not featured"}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Content (HTML)</label>
              <textarea value={form.content} onChange={(e) => field("content", e.target.value)}
                rows={18} placeholder="<h2>Section</h2><p>Body text...</p>"
                className="w-full rounded-xl px-3.5 py-2.5 text-[13px] text-slate-300 bg-white/[0.05] border border-white/10 focus:border-sky-500/50 focus:outline-none placeholder-slate-600 resize-y font-mono" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-600">
          <div className="text-center space-y-2">
            <PenLine className="h-8 w-8 mx-auto opacity-30" />
            <p className="text-[13px]">Select a post to edit or create a new one</p>
          </div>
        </div>
      )}
    </div>
  );
}
