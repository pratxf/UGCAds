"use client";

import { useEffect, useState, useRef, useCallback, type ChangeEvent, type DragEvent } from "react";
import { Plus, Search, Tag, Pencil, Trash2, Loader2, X, CloudUpload, ImageIcon, Info, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string; _count?: { templates: number } };
type Template = { id: string; name: string; imageUrl: string; prompt: string; categoryId: string | null; category: Category | null; active: boolean };

const PAGE_SIZE = 20;

function ConfirmModal({ title, description, loading, onConfirm, onClose }: { title: string; description: string; loading: boolean; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.09)" }}>
        <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, #ef4444, #dc2626)" }} />
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(248,113,113,0.1)" }}>
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-slate-100">{title}</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-200 transition" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPhotoshootTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [deleting, setDeleting] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [t, c] = await Promise.all([
      fetch("/api/admin/photoshoot-templates").then((r) => r.json()),
      fetch("/api/admin/photoshoot-categories").then((r) => r.json()),
    ]);
    setTemplates(t.templates || []);
    setCategories(c.categories || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setShowCategories(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleDelete(id: string) {
    setDeleting(true);
    await fetch(`/api/admin/photoshoot-templates/${id}`, { method: "DELETE" });
    setDeleting(false); setDeleteTarget(null);
    load();
  }

  async function handleDeleteCategory(id: string) {
    await fetch(`/api/admin/photoshoot-categories/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = templates.filter((t) => {
    if (statusFilter === "active" && !t.active) return false;
    if (statusFilter === "draft" && t.active) return false;
    if (categoryFilter !== "all" && t.categoryId !== categoryFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount = templates.filter((t) => t.active).length;
  const draftCount = templates.filter((t) => !t.active).length;

  const selectedCategory = categories.find((c) => c.id === categoryFilter);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-slate-100">Photoshoot Templates</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Create and manage photoshoot background templates for users</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white transition-all" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 0 20px rgba(245,158,11,0.3)" }}>
          <Plus className="h-4 w-4" /> New Template
        </button>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Status tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.06)" }}>
          {([
            { key: "all", label: "All", count: templates.length },
            { key: "active", label: "Active", count: activeCount },
            { key: "draft", label: "Draft", count: draftCount },
          ] as const).map(({ key, label, count }) => (
            <button key={key} onClick={() => { setStatusFilter(key); setPage(1); }} className={cn("rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all", statusFilter === key ? "text-white" : "text-slate-500 hover:text-slate-300")} style={statusFilter === key ? { background: "linear-gradient(135deg, #F59E0B22, #D9770622)", border: "1px solid rgba(245,158,11,0.3)", color: "#FCD34D" } : {}}>
              {label} <span className={cn("ml-1 text-[11px]", statusFilter === key ? "opacity-60" : "opacity-40")}>{count}</span>
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "#6B7280" }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search templates..." className="h-9 pl-9 pr-4 rounded-xl text-[13px] text-slate-300 placeholder:text-slate-600 focus:outline-none w-52" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }} />
        </div>

        {/* Categories dropdown */}
        <div className="relative" ref={catRef}>
          <button onClick={() => setShowCategories(!showCategories)} className="inline-flex items-center gap-2 h-9 px-3 rounded-xl text-[13px] font-medium transition" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)", color: selectedCategory ? "#FCD34D" : "#9CA3AF" }}>
            <Tag className="h-3.5 w-3.5" />
            {selectedCategory ? selectedCategory.name : "Categories"}
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </button>
          {showCategories && (
            <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl overflow-hidden z-30" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
              <div className="p-1">
                {[{ id: "all", name: "All Categories" }, ...categories].map((c) => (
                  <button key={c.id} onClick={() => { setCategoryFilter(c.id); setShowCategories(false); setPage(1); }} className={cn("w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors", categoryFilter === c.id ? "text-amber-300" : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]")} style={categoryFilter === c.id ? { background: "rgba(245,158,11,0.08)" } : {}}>
                    {c.name}
                    {"_count" in c && (c as Category)._count && <span className="ml-1 text-[11px] opacity-50">{(c as Category)._count?.templates}</span>}
                  </button>
                ))}
              </div>
              <div className="border-t p-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <button onClick={() => { setShowCategories(false); setEditing(null); }} className="w-full text-center text-[11px] font-semibold text-slate-600 hover:text-slate-400 transition py-1">Manage Categories</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-2xl flex flex-col items-center justify-center py-20 gap-3" style={{ border: "1px dashed rgba(255,255,255,0.07)" }}>
          <ImageIcon className="h-8 w-8 text-slate-700" />
          <p className="text-sm text-slate-600">No templates found. Click New Template to add one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {paginated.map((t) => (
            <div key={t.id} className="group relative rounded-2xl overflow-hidden" style={{ aspectRatio: "3/4", border: "1px solid rgba(255,255,255,0.07)" }}>
              <img src={t.imageUrl} alt={t.name} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 p-3" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)" }}>
                <p className="text-[12px] font-bold text-white truncate mb-1.5">{t.name}</p>
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold", t.active ? "text-emerald-300" : "text-slate-400")} style={{ background: t.active ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.08)" }}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", t.active ? "bg-emerald-400" : "bg-slate-500")} />
                  {t.active ? "Active" : "Draft"}
                </span>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(t)} className="flex size-7 items-center justify-center rounded-lg backdrop-blur-sm transition-colors" style={{ background: "rgba(0,0,0,0.75)" }}>
                  <Pencil className="h-3 w-3 text-white/60 hover:text-sky-400" />
                </button>
                <button onClick={() => setDeleteTarget(t)} className="flex size-7 items-center justify-center rounded-lg backdrop-blur-sm transition-colors" style={{ background: "rgba(0,0,0,0.75)" }}>
                  <Trash2 className="h-3 w-3 text-white/60 hover:text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-1 pt-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex size-8 items-center justify-center rounded-lg text-slate-500 disabled:opacity-30 hover:text-slate-300 hover:bg-white/[0.05] transition">
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
            const n = start + i;
            if (n > totalPages) return null;
            return (
              <button key={n} onClick={() => setPage(n)} className="flex size-8 items-center justify-center rounded-lg text-[13px] font-semibold transition-all" style={page === n ? { background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "white" } : { color: "#6B7280" }}>
                {n}
              </button>
            );
          })}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex size-8 items-center justify-center rounded-lg text-slate-500 disabled:opacity-30 hover:text-slate-300 hover:bg-white/[0.05] transition">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {showUpload && <UploadModal categories={categories} onClose={() => setShowUpload(false)} onSaved={() => { setShowUpload(false); load(); }} />}
      {editing && <EditModal template={editing} categories={categories} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {deleteTarget && <ConfirmModal title="Delete Template" description={`Delete "${deleteTarget.name}"? This cannot be undone.`} loading={deleting} onConfirm={() => handleDelete(deleteTarget.id)} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}

const baseInput: React.CSSProperties = { background: "#080C18", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0" };

function UploadModal({ categories, onClose, onSaved }: { categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File) {
    setFile(f); setPreview(URL.createObjectURL(f));
  }

  function onDrop(e: DragEvent) {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) pickFile(f);
  }

  async function submit() {
    if (!name || !prompt || !file) return;
    setSaving(true);
    const fd = new FormData();
    fd.append("name", name); fd.append("prompt", prompt); fd.append("image", file);
    if (categoryId) fd.append("categoryId", categoryId);
    const res = await fetch("/api/admin/photoshoot-templates", { method: "POST", body: fd });
    setSaving(false);
    if (res.ok) onSaved(); else alert("Upload failed");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.09)", maxHeight: "92vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="text-[16px] font-bold text-slate-100">New Photoshoot Template</h3>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Upload area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className="rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center gap-3 py-10"
            style={{ border: `2px dashed ${isDragging ? "rgba(245,158,11,0.6)" : preview ? "rgba(245,158,11,0.4)" : "rgba(245,158,11,0.25)"}`, background: isDragging ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.02)" }}
          >
            {preview ? (
              <div className="relative h-32 w-24 rounded-xl overflow-hidden">
                <img src={preview} alt="" className="h-full w-full object-cover" />
              </div>
            ) : (
              <>
                <div className="relative">
                  <CloudUpload className="h-10 w-10 text-amber-400" />
                  <div className="absolute -bottom-1 -right-2 flex size-5 items-center justify-center rounded-full" style={{ background: "#0F1629", border: "1px solid rgba(245,158,11,0.3)" }}>
                    <ImageIcon className="h-3 w-3 text-amber-400" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-semibold text-slate-200">Upload preview image</p>
                  <p className="text-[13px] mt-1" style={{ color: "#6B7280" }}>Drag &amp; drop an image here, or <span className="text-amber-400 hover:text-amber-300 transition-colors">click to browse</span></p>
                  <p className="text-[11px] mt-2" style={{ color: "#4B5563" }}>JPG, PNG or WEBP &bull; Max 10MB &bull; Recommended size: 2000x2500px</p>
                </div>
              </>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }} />
          </div>

          {/* Name */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#9CA3AF" }}>Name</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="h-4 w-4" style={{ color: "#4B5563" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Marble Surface" className="w-full h-11 pl-10 pr-4 rounded-xl text-[14px] placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition" style={baseInput} />
            </div>
          </div>

          {/* Prompt */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#9CA3AF" }}>Prompt (Server-Only)</label>
              <Info className="h-3.5 w-3.5" style={{ color: "#4B5563" }} />
            </div>
            <div className="relative">
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value.slice(0, 1000))} rows={4} placeholder="Describe the setup, background, lighting, mood, etc." className="w-full rounded-xl px-4 py-3 text-[14px] placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40 resize-none transition" style={baseInput} />
              <span className="absolute bottom-2 right-3 text-[11px]" style={{ color: "#4B5563" }}>{prompt.length} / 1000</span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#9CA3AF" }}>Category</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Tag className="h-4 w-4" style={{ color: "#4B5563" }} />
              </div>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full h-11 pl-10 pr-10 rounded-xl text-[14px] focus:outline-none focus:ring-1 focus:ring-amber-500/40 appearance-none transition" style={baseInput}>
                <option value="">Uncategorized</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#4B5563" }} />
            </div>
          </div>

          {/* Info notice */}
          <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <div className="flex size-5 shrink-0 items-center justify-center rounded-full mt-0.5" style={{ background: "rgba(245,158,11,0.15)" }}>
              <Info className="h-3 w-3 text-amber-400" />
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: "#9CA3AF" }}>
              This template will be available to all users when active.<br />
              Make sure your prompt and preview image are accurate.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={onClose} className="flex-1 rounded-xl py-2.5 text-[14px] font-semibold text-slate-400 hover:text-slate-200 transition" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
          <button onClick={submit} disabled={!name || !prompt || !file || saving} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-[14px] font-bold text-white disabled:opacity-40 transition-all" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 0 20px rgba(245,158,11,0.25)" }}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            )}
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ template, categories, onClose, onSaved }: { template: Template; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(template.name);
  const [prompt, setPrompt] = useState(template.prompt);
  const [categoryId, setCategoryId] = useState<string>(template.categoryId || "");
  const [active, setActive] = useState(template.active);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    const res = await fetch(`/api/admin/photoshoot-templates/${template.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, prompt, categoryId: categoryId || null, active }),
    });
    setSaving(false);
    if (res.ok) onSaved(); else alert("Save failed");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.09)", maxHeight: "92vh" }}>
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="text-[16px] font-bold text-slate-100">Edit Template</h3>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="rounded-xl overflow-hidden" style={{ aspectRatio: "3/4", border: "1px solid rgba(255,255,255,0.07)" }}>
            <img src={template.imageUrl} alt={template.name} className="h-full w-full object-cover" />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#9CA3AF" }}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-11 rounded-xl px-4 text-[14px] focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition" style={baseInput} />
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#9CA3AF" }}>Prompt (Server-Only)</label>
              <Info className="h-3.5 w-3.5" style={{ color: "#4B5563" }} />
            </div>
            <div className="relative">
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value.slice(0, 1000))} rows={4} className="w-full rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-1 focus:ring-amber-500/40 resize-none transition" style={baseInput} />
              <span className="absolute bottom-2 right-3 text-[11px]" style={{ color: "#4B5563" }}>{prompt.length} / 1000</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#9CA3AF" }}>Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#4B5563" }} />
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full h-11 pl-10 pr-8 rounded-xl text-[13px] focus:outline-none appearance-none transition" style={baseInput}>
                  <option value="">Uncategorized</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#4B5563" }} />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#9CA3AF" }}>Status</label>
              <button type="button" onClick={() => setActive(!active)} className="w-full h-11 rounded-xl text-[13px] font-bold transition-all" style={{ border: `1px solid ${active ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.08)"}`, background: active ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.03)", color: active ? "#6EE7B7" : "#6B7280" }}>
                {active ? "Active" : "Draft"}
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-4 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={onClose} className="flex-1 rounded-xl py-2.5 text-[14px] font-semibold text-slate-400 hover:text-slate-200 transition" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
          <button onClick={submit} disabled={saving} className="flex-1 rounded-xl py-2.5 text-[14px] font-bold text-white disabled:opacity-40 transition-all" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 0 20px rgba(245,158,11,0.2)" }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
