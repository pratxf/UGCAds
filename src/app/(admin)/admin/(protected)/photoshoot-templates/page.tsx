"use client";

import { useEffect, useState, useRef, useCallback, type ChangeEvent, type DragEvent } from "react";
import {
  Plus, Search, Tag, Pencil, Trash2, Loader2, X, CloudUpload, ImageIcon,
  Info, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle,
  SlidersHorizontal, LayoutGrid, List, CheckSquare, FileX, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string; _count?: { templates: number } };
type Template = { id: string; name: string; imageUrl: string; prompt: string; categoryId: string | null; category: Category | null; active: boolean };

const PAGE_SIZE = 12;

// ─── Custom Dropdown ──────────────────────────────────────────────────────────
function CustomSelect({ value, onChange, options, placeholder, accent = "amber" }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string; accent?: "amber" | "indigo";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);
  const accentColor = accent === "amber" ? "rgba(245,158,11,0.4)" : "rgba(99,102,241,0.4)";
  const accentBg = accent === "amber" ? "rgba(245,158,11,0.08)" : "rgba(99,102,241,0.08)";
  const accentText = accent === "amber" ? "#FCD34D" : "#A5B4FC";

  useEffect(() => {
    if (!open) return;
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between h-11 rounded-xl px-4 text-[14px] transition"
        style={{ background: "#080C18", border: `1px solid ${open ? accentColor : "rgba(255,255,255,0.08)"}`, color: selected ? "#E2E8F0" : "#4B5563" }}
      >
        <span className="truncate">{selected?.label || placeholder || "Select…"}</span>
        <ChevronDown className="h-4 w-4 shrink-0 ml-2" style={{ color: "#4B5563" }} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-full z-50 rounded-xl overflow-hidden" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.6)" }}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className="flex w-full items-center px-4 py-2.5 text-[13px] transition"
              style={value === o.value ? { background: accentBg, color: accentText } : { color: "#94A3B8" }}
              onMouseEnter={(e) => { if (value !== o.value) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { if (value !== o.value) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
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

// ─── Categories Modal ─────────────────────────────────────────────────────────
function CategoriesModal({ categories, onClose, onSaved }: { categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function addCategory() {
    if (!newName.trim()) return;
    setSaving(true);
    await fetch("/api/admin/photoshoot-categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim() }) });
    setSaving(false);
    setNewName("");
    onSaved();
  }

  async function deleteCategory(id: string) {
    setDeletingId(id);
    await fetch(`/api/admin/photoshoot-categories/${id}`, { method: "DELETE" });
    setDeletingId(null);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.09)", maxHeight: "80vh" }}>
        <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, #F59E0B, #D97706)" }} />
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl" style={{ background: "rgba(245,158,11,0.12)" }}>
              <Tag className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-100">Manage Categories</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Add or remove photoshoot template categories</p>
            </div>
          </div>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Add new */}
        <div className="px-6 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#9CA3AF" }}>New Category</label>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addCategory(); }}
              placeholder="Category name..."
              className="flex-1 h-10 rounded-xl px-4 text-[14px] placeholder:text-slate-600 focus:outline-none transition"
              style={{ background: "#080C18", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            />
            <button
              onClick={addCategory}
              disabled={!newName.trim() || saving}
              className="flex items-center gap-1.5 px-4 h-10 rounded-xl text-[13px] font-bold text-white disabled:opacity-40 transition"
              style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add
            </button>
          </div>
        </div>

        {/* Category list */}
        <div className="overflow-y-auto flex-1">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Tag className="h-6 w-6 text-slate-700" />
              <p className="text-[13px] text-slate-600">No categories yet</p>
            </div>
          ) : (
            <div className="p-4 space-y-1.5">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3 rounded-xl group transition" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-3">
                    <div className="flex size-7 items-center justify-center rounded-lg" style={{ background: "rgba(245,158,11,0.1)" }}>
                      <Tag className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-200">{c.name}</p>
                      {c._count !== undefined && <p className="text-[11px] text-slate-600">{c._count.templates} templates</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCategory(c.id)}
                    disabled={deletingId === c.id}
                    className="flex size-7 items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    {deletingId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={onClose} className="w-full rounded-xl py-2.5 text-[14px] font-semibold text-slate-400 hover:text-slate-200 transition" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPhotoshootTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMoreCats, setShowMoreCats] = useState(false);
  const [page, setPage] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [deleting, setDeleting] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

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
    if (!sortOpen) return;
    function h(e: MouseEvent) { if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [sortOpen]);

  async function handleDelete(id: string) {
    setDeleting(true);
    await fetch(`/api/admin/photoshoot-templates/${id}`, { method: "DELETE" });
    setDeleting(false); setDeleteTarget(null);
    load();
  }

  const filtered = templates.filter((t) => {
    if (statusFilter === "active" && !t.active) return false;
    if (statusFilter === "draft" && t.active) return false;
    if (categoryFilter !== "all" && t.categoryId !== categoryFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => sortOrder === "newest" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount = templates.filter((t) => t.active).length;
  const draftCount = templates.filter((t) => !t.active).length;

  // Category pill data: count templates per category
  const catCounts: Record<string, number> = {};
  templates.forEach((t) => { if (t.categoryId) catCounts[t.categoryId] = (catCounts[t.categoryId] || 0) + 1; });

  const VISIBLE_CATS = 8;
  const visibleCats = categories.slice(0, VISIBLE_CATS);
  const hiddenCats = categories.slice(VISIBLE_CATS);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategories(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-[13px] font-semibold transition"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#94A3B8" }}
          >
            <Tag className="h-3.5 w-3.5" /> Categories <ChevronDown className="h-3 w-3 opacity-50" />
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-[13px] font-bold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 0 20px rgba(245,158,11,0.3)" }}
          >
            <Plus className="h-4 w-4" /> New Template
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Templates", value: templates.length, icon: <Layers className="h-5 w-5 text-amber-400" />, bg: "rgba(245,158,11,0.1)", color: "#FCD34D", gradient: "from-amber-500 to-orange-500" },
          { label: "Active Templates", value: activeCount, icon: <CheckSquare className="h-5 w-5 text-emerald-400" />, bg: "rgba(16,185,129,0.1)", color: "#6EE7B7", gradient: "from-emerald-500 to-teal-500" },
          { label: "Draft Templates", value: draftCount, icon: <FileX className="h-5 w-5 text-rose-400" />, bg: "rgba(244,63,94,0.1)", color: "#FDA4AF", gradient: "from-rose-500 to-pink-500" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl overflow-hidden" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className={cn("h-[2px] w-full bg-gradient-to-r", c.gradient)} />
            <div className="p-5 flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl" style={{ background: c.bg }}>{c.icon}</div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600">{c.label}</p>
                <p className="text-[28px] font-bold tabular-nums leading-tight" style={{ color: c.color }}>{c.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Pills Row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => { setCategoryFilter("all"); setPage(1); }}
          className={cn("rounded-lg px-3.5 py-1.5 text-[12px] font-semibold transition-all", categoryFilter === "all" ? "text-amber-300" : "text-slate-500 hover:text-slate-300")}
          style={categoryFilter === "all" ? { background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)" } : { border: "1px solid transparent" }}
        >
          All <span className="opacity-60 ml-1">({templates.length})</span>
        </button>
        {visibleCats.map((c) => (
          <button
            key={c.id}
            onClick={() => { setCategoryFilter(c.id); setPage(1); }}
            className={cn("rounded-lg px-3.5 py-1.5 text-[12px] font-semibold transition-all", categoryFilter === c.id ? "text-amber-300" : "text-slate-500 hover:text-slate-300")}
            style={categoryFilter === c.id ? { background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)" } : { border: "1px solid transparent" }}
          >
            {c.name} <span className="opacity-60 ml-1">{catCounts[c.id] || 0}</span>
          </button>
        ))}
        {hiddenCats.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowMoreCats((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-300 transition"
              style={{ border: "1px solid transparent" }}
            >
              More <ChevronDown className="h-3 w-3" />
            </button>
            {showMoreCats && (
              <div className="absolute left-0 top-full mt-1 z-20 rounded-xl overflow-hidden min-w-[160px]" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                {hiddenCats.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setCategoryFilter(c.id); setShowMoreCats(false); setPage(1); }}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-[13px] transition text-slate-400 hover:bg-white/[0.04]"
                    style={categoryFilter === c.id ? { color: "#FCD34D", background: "rgba(245,158,11,0.08)" } : {}}
                  >
                    <span>{c.name}</span>
                    <span className="text-[11px] opacity-50 ml-3">{catCounts[c.id] || 0}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search templates..."
            className="w-full h-9 pl-9 pr-4 rounded-xl text-[13px] text-slate-300 placeholder:text-slate-600 focus:outline-none transition"
            style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}
          />
        </div>
        <button
          onClick={() => { setStatusFilter((s) => s === "all" ? "active" : s === "active" ? "draft" : "all"); setPage(1); }}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-xl text-[13px] font-medium transition"
          style={statusFilter !== "all"
            ? { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#FCD34D" }
            : { background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)", color: "#9CA3AF" }}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {statusFilter === "all" ? "Filter" : statusFilter === "active" ? "Active" : "Draft"}
        </button>
        <div ref={sortRef} className="relative">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-xl text-[13px] font-medium transition"
            style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)", color: "#9CA3AF" }}
          >
            Sort: {sortOrder === "newest" ? "Newest" : "Oldest"} <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-10 z-20 rounded-xl overflow-hidden" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", minWidth: 120 }}>
              {(["newest", "oldest"] as const).map((s) => (
                <button key={s} onClick={() => { setSortOrder(s); setSortOpen(false); }} className="flex w-full items-center px-4 py-2.5 text-[13px] capitalize transition" style={sortOrder === s ? { color: "#FCD34D", background: "rgba(245,158,11,0.08)" } : { color: "#94A3B8" }} onMouseEnter={(e) => { if (sortOrder !== s) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }} onMouseLeave={(e) => { if (sortOrder !== s) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>{s === "newest" ? "Newest" : "Oldest"}</button>
              ))}
            </div>
          )}
        </div>
        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={() => setViewMode("grid")} className={cn("flex size-9 items-center justify-center transition", viewMode === "grid" ? "bg-amber-500/20 text-amber-400" : "bg-[#0F1629] text-slate-600 hover:text-slate-400")}><LayoutGrid className="h-3.5 w-3.5" /></button>
          <button onClick={() => setViewMode("list")} className={cn("flex size-9 items-center justify-center transition", viewMode === "list" ? "bg-amber-500/20 text-amber-400" : "bg-[#0F1629] text-slate-600 hover:text-slate-400")}><List className="h-3.5 w-3.5" /></button>
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
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {paginated.map((t) => (
            <div key={t.id} className="group relative rounded-2xl overflow-hidden cursor-default" style={{ aspectRatio: "3/4", border: "1px solid rgba(255,255,255,0.07)" }}>
              <img src={t.imageUrl} alt={t.name} className="h-full w-full object-cover transition duration-200 group-hover:brightness-90" />
              {/* Status badge */}
              <div className="absolute top-2 left-2">
                <div className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", border: `1px solid ${t.active ? "rgba(52,211,153,0.3)" : "rgba(245,158,11,0.3)"}` }}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", t.active ? "bg-emerald-400" : "bg-amber-400")} />
                  <span className={cn("text-[10px] font-bold", t.active ? "text-emerald-300" : "text-amber-300")}>{t.active ? "Active" : "Draft"}</span>
                </div>
              </div>
              {/* Hover actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(t)} className="flex size-7 items-center justify-center rounded-lg transition" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Pencil className="h-3 w-3 text-slate-300 hover:text-sky-400" />
                </button>
                <button onClick={() => setDeleteTarget(t)} className="flex size-7 items-center justify-center rounded-lg transition" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Trash2 className="h-3 w-3 text-slate-300 hover:text-red-400" />
                </button>
              </div>
              {/* Bottom overlay */}
              <div className="absolute inset-x-0 bottom-0 p-3" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)" }}>
                <p className="text-[12px] font-bold text-white truncate">{t.name}</p>
                <p className="text-[10px] text-white/50 mt-0.5 truncate">{t.category?.name || "Uncategorized"}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Template", "Category", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((t, i) => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition" style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-9 rounded-xl overflow-hidden shrink-0"><img src={t.imageUrl} alt={t.name} className="h-full w-full object-cover" /></div>
                      <p className="text-[13px] font-semibold text-slate-200 truncate max-w-[200px]">{t.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-400">{t.category?.name || "Uncategorized"}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: t.active ? "rgba(52,211,153,0.12)" : "rgba(245,158,11,0.1)", color: t.active ? "#6EE7B7" : "#FCD34D" }}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", t.active ? "bg-emerald-400" : "bg-amber-400")} />{t.active ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditing(t)} className="flex size-7 items-center justify-center rounded-lg text-slate-600 hover:text-sky-400 hover:bg-white/[0.05] transition"><Pencil className="h-3 w-3" /></button>
                      <button onClick={() => setDeleteTarget(t)} className="flex size-7 items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-[13px]" style={{ color: "#6B7280" }}>
            Showing <span className="text-slate-400">{(page - 1) * PAGE_SIZE + 1}</span> to <span className="text-slate-400">{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="text-slate-400">{filtered.length}</span> templates
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex size-8 items-center justify-center rounded-lg text-slate-500 disabled:opacity-30 hover:text-slate-300 hover:bg-white/[0.05] transition">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const n = start + i;
              if (n > totalPages) return null;
              return (
                <button key={n} onClick={() => setPage(n)} className="flex size-8 items-center justify-center rounded-lg text-[13px] font-semibold transition-all" style={page === n ? { background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "white" } : { color: "#6B7280" }}>{n}</button>
              );
            })}
            {totalPages > 5 && <span className="text-slate-700 px-1 text-[12px]">...</span>}
            {totalPages > 5 && page < totalPages - 2 && (
              <button onClick={() => setPage(totalPages)} className="flex size-8 items-center justify-center rounded-lg text-[13px] font-semibold transition-all" style={{ color: "#6B7280" }}>{totalPages}</button>
            )}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex size-8 items-center justify-center rounded-lg text-slate-500 disabled:opacity-30 hover:text-slate-300 hover:bg-white/[0.05] transition">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {showUpload && <UploadModal categories={categories} onClose={() => setShowUpload(false)} onSaved={() => { setShowUpload(false); load(); }} />}
      {showCategories && <CategoriesModal categories={categories} onClose={() => setShowCategories(false)} onSaved={() => load()} />}
      {editing && <EditModal template={editing} categories={categories} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {deleteTarget && <ConfirmModal title="Delete Template" description={`Delete "${deleteTarget.name}"? This cannot be undone.`} loading={deleting} onConfirm={() => handleDelete(deleteTarget.id)} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}

const baseInput: React.CSSProperties = { background: "#080C18", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0" };

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ categories, onClose, onSaved }: { categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File) { setFile(f); setPreview(URL.createObjectURL(f)); }
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

  const catOptions = [{ value: "", label: "Uncategorized" }, ...categories.map((c) => ({ value: c.id, label: c.name }))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.09)", maxHeight: "92vh" }}>
        <div className="h-[2px] w-full" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }} />
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="text-[16px] font-bold text-slate-100">New Photoshoot Template</h3>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Upload area */}
          <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}
            className="rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center gap-3 py-10"
            style={{ border: `2px dashed ${isDragging ? "rgba(245,158,11,0.6)" : preview ? "rgba(245,158,11,0.4)" : "rgba(245,158,11,0.25)"}`, background: isDragging ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.02)" }}
          >
            {preview ? (
              <div className="relative h-32 w-24 rounded-xl overflow-hidden"><img src={preview} alt="" className="h-full w-full object-cover" /></div>
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
                  <p className="text-[13px] mt-1" style={{ color: "#6B7280" }}>Drag &amp; drop or <span className="text-amber-400">click to browse</span></p>
                  <p className="text-[11px] mt-2" style={{ color: "#4B5563" }}>JPG, PNG or WEBP &bull; Max 10MB</p>
                </div>
              </>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }} />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#9CA3AF" }}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Marble Surface" className="w-full h-11 px-4 rounded-xl text-[14px] placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition" style={baseInput} />
          </div>

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

          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#9CA3AF" }}>Category</label>
            <CustomSelect value={categoryId} onChange={setCategoryId} options={catOptions} placeholder="Uncategorized" accent="amber" />
          </div>

          <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <div className="flex size-5 shrink-0 items-center justify-center rounded-full mt-0.5" style={{ background: "rgba(245,158,11,0.15)" }}>
              <Info className="h-3 w-3 text-amber-400" />
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: "#9CA3AF" }}>
              This template will be available to all users when active. Make sure your prompt and preview image are accurate.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-4 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={onClose} className="flex-1 rounded-xl py-2.5 text-[14px] font-semibold text-slate-400 hover:text-slate-200 transition" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
          <button onClick={submit} disabled={!name || !prompt || !file || saving} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-[14px] font-bold text-white disabled:opacity-40 transition-all" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 0 20px rgba(245,158,11,0.25)" }}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ template, categories, onClose, onSaved }: { template: Template; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(template.name);
  const [prompt, setPrompt] = useState(template.prompt);
  const [categoryId, setCategoryId] = useState<string>(template.categoryId || "");
  const [active, setActive] = useState(template.active);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    const res = await fetch(`/api/admin/photoshoot-templates/${template.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, prompt, categoryId: categoryId || null, active }),
    });
    setSaving(false);
    if (res.ok) onSaved(); else alert("Save failed");
  }

  const catOptions = [{ value: "", label: "Uncategorized" }, ...categories.map((c) => ({ value: c.id, label: c.name }))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.09)", maxHeight: "92vh" }}>
        <div className="h-[2px] w-full" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }} />
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="text-[16px] font-bold text-slate-100">Edit Template</h3>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="rounded-xl overflow-hidden" style={{ aspectRatio: "3/4", maxHeight: 200, border: "1px solid rgba(255,255,255,0.07)" }}>
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
              <CustomSelect value={categoryId} onChange={setCategoryId} options={catOptions} accent="amber" />
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
          <button onClick={submit} disabled={saving} className="flex-1 rounded-xl py-2.5 text-[14px] font-bold text-white disabled:opacity-40 transition-all" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
