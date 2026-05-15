"use client";

import { useEffect, useState, useRef, useCallback, type ChangeEvent } from "react";
import { Plus, Search, SlidersHorizontal, ChevronDown, LayoutGrid, List, Pencil, Trash2, Loader2, X, AlertTriangle, Users, User, CloudUpload, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Model = { id: string; name: string; gender: "female" | "male"; bodyType: string; ethnicity: string; imageUrl: string; isActive: boolean; sortOrder: number };

const BODY_TYPES = ["slim", "athletic", "curvy", "plus", "average", "muscular"];

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

export default function AdminTryonModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "female" | "male">("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Model | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Model | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/tryon-models").then((r) => r.json());
    setModels(r.models || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    setDeleting(true);
    await fetch(`/api/admin/tryon-models/${id}`, { method: "DELETE" });
    setDeleting(false); setDeleteTarget(null);
    load();
  }

  async function toggleActive(m: Model) {
    await fetch(`/api/admin/tryon-models/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !m.isActive }) });
    load();
  }

  const filtered = models.filter((m) => {
    if (filter !== "all" && m.gender !== filter) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalCount = models.length;
  const maleCount = models.filter((m) => m.gender === "male").length;
  const femaleCount = models.filter((m) => m.gender === "female").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-slate-100">Try-On Models</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Manage base models for the AI Try-On feature.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white transition-all" style={{ background: "linear-gradient(135deg, #10B981, #059669)", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}>
          <Plus className="h-4 w-4" /> Add Model
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total */}
        <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(139,92,246,0.12)" }}>
            <Users className="h-6 w-6" style={{ color: "#A78BFA" }} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#6B7280" }}>Total Models</p>
            <p className="text-[28px] font-bold text-slate-100 leading-tight tabular-nums">{totalCount}</p>
          </div>
        </div>
        {/* Male */}
        <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(59,130,246,0.12)" }}>
            <svg className="h-6 w-6" style={{ color: "#60A5FA" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="10.5" cy="10.5" r="6.5" /><path strokeLinecap="round" d="M15.5 8.5L20 4m0 0h-4m4 0v4" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#6B7280" }}>Male Models</p>
            <p className="text-[28px] font-bold text-slate-100 leading-tight tabular-nums">{maleCount}</p>
          </div>
        </div>
        {/* Female */}
        <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(236,72,153,0.12)" }}>
            <svg className="h-6 w-6" style={{ color: "#F472B6" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="12" cy="9" r="6" /><path strokeLinecap="round" d="M12 15v6m-3-3h6" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#6B7280" }}>Female Models</p>
            <p className="text-[28px] font-bold text-slate-100 leading-tight tabular-nums">{femaleCount}</p>
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Gender tabs */}
        <div className="flex items-center gap-1.5">
          {([
            { key: "all", label: "All", count: totalCount },
            { key: "female", label: "Female", count: femaleCount },
            { key: "male", label: "Male", count: maleCount },
          ] as const).map(({ key, label, count }) => (
            <button key={key} onClick={() => setFilter(key)} className={cn("rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all flex items-center gap-1.5", filter === key ? "text-emerald-300" : "text-slate-500 hover:text-slate-300")} style={filter === key ? { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.35)" } : { border: "1px solid rgba(255,255,255,0.08)" }}>
              {label}
              <span className={cn("text-[11px] tabular-nums", filter === key ? "text-emerald-400/60" : "text-slate-700")}>{count}</span>
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "#6B7280" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search models..." className="h-9 pl-9 pr-4 rounded-xl text-[13px] text-slate-300 placeholder:text-slate-600 focus:outline-none w-48" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }} />
        </div>

        {/* Filter button */}
        <button className="inline-flex items-center gap-2 h-9 px-3 rounded-xl text-[13px] font-medium transition" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)", color: "#9CA3AF" }}>
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
        </button>

        {/* Sort dropdown */}
        <button className="inline-flex items-center gap-2 h-9 px-3 rounded-xl text-[13px] font-medium transition" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)", color: "#9CA3AF" }}>
          Sort: Newest <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </button>

        {/* View toggle */}
        <div className="flex items-center gap-0.5 p-1 rounded-xl" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={() => setViewMode("grid")} className={cn("flex size-7 items-center justify-center rounded-lg transition-all", viewMode === "grid" ? "text-white" : "text-slate-600 hover:text-slate-400")} style={viewMode === "grid" ? { background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" } : {}}>
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setViewMode("list")} className={cn("flex size-7 items-center justify-center rounded-lg transition-all", viewMode === "list" ? "text-white" : "text-slate-600 hover:text-slate-400")} style={viewMode === "list" ? { background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" } : {}}>
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl flex flex-col items-center justify-center py-24 gap-5" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.06)" }}>
          {/* T-shirt box illustration */}
          <div className="relative">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <rect x="20" y="55" width="80" height="55" rx="6" fill="#1E293B" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              <path d="M20 75h80" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
              <path d="M55 15c0 0-10 8-20 8L25 35h70l-10-12c-10 0-20-8-20-8z" fill="#1E293B" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              <path d="M48 15l-8 5m32-5l8 5" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M45 23v12h30V23" fill="#263147" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
              <circle cx="88" cy="40" r="3" fill="#10B981" opacity="0.6" />
              <circle cx="30" cy="60" r="2" fill="#10B981" opacity="0.4" />
              <circle cx="95" cy="68" r="2.5" fill="#10B981" opacity="0.5" />
              <path d="M35 90l8-6 8 6 8-6 8 6" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-[16px] font-bold text-slate-200">No models yet</p>
            <p className="text-sm mt-1" style={{ color: "#6B7280" }}>Add your first model to get started with AI Try-On.</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-bold text-white transition-all" style={{ background: "linear-gradient(135deg, #10B981, #059669)", boxShadow: "0 0 20px rgba(16,185,129,0.25)" }}>
            <Plus className="h-4 w-4" /> Add Model
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((m) => (
            <div key={m.id} className={cn("group relative rounded-2xl overflow-hidden", !m.isActive && "opacity-60")} style={{ aspectRatio: "3/4", border: m.isActive ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(239,68,68,0.25)" }}>
              {m.imageUrl ? (
                <img src={m.imageUrl} alt={m.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center" style={{ background: "#0F1629" }}>
                  <User className="h-10 w-10 text-slate-700" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 p-3" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)" }}>
                <p className="text-[12px] font-bold text-white truncate mb-1">{m.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold", m.gender === "female" ? "text-pink-300" : "text-sky-300")} style={{ background: m.gender === "female" ? "rgba(236,72,153,0.15)" : "rgba(56,189,248,0.15)" }}>
                    {m.gender}
                  </span>
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold", m.isActive ? "text-emerald-300" : "text-slate-500")} style={{ background: m.isActive ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)" }}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", m.isActive ? "bg-emerald-400" : "bg-slate-600")} />
                    {m.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(m)} className="flex size-7 items-center justify-center rounded-lg backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.75)" }}>
                  <Pencil className="h-3 w-3 text-white/60 hover:text-sky-400" />
                </button>
                <button onClick={() => toggleActive(m)} className="flex h-7 px-2 items-center justify-center rounded-lg backdrop-blur-sm text-[10px] font-bold text-white/60" style={{ background: "rgba(0,0,0,0.75)" }}>
                  {m.isActive ? "Hide" : "Show"}
                </button>
                <button onClick={() => setDeleteTarget(m)} className="flex size-7 items-center justify-center rounded-lg backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.75)" }}>
                  <Trash2 className="h-3 w-3 text-white/60 hover:text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0F1629" }}>
                {["Model", "Gender", "Body Type", "Ethnicity", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest" style={{ color: "#6B7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: "#0A0F1E" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl overflow-hidden shrink-0" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                        {m.imageUrl ? <img src={m.imageUrl} alt={m.name} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center" style={{ background: "#0F1629" }}><User className="h-4 w-4 text-slate-700" /></div>}
                      </div>
                      <p className="text-[13px] font-semibold text-slate-200">{m.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold capitalize", m.gender === "female" ? "text-pink-300" : "text-sky-300")} style={{ background: m.gender === "female" ? "rgba(236,72,153,0.1)" : "rgba(56,189,248,0.1)" }}>{m.gender}</span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-400 capitalize">{m.bodyType}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-400 capitalize">{m.ethnicity}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold", m.isActive ? "text-emerald-300" : "text-slate-500")} style={{ background: m.isActive ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)" }}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", m.isActive ? "bg-emerald-400" : "bg-slate-600")} />
                      {m.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setEditing(m)} className="flex size-7 items-center justify-center rounded-lg text-slate-600 hover:text-sky-400 hover:bg-white/[0.05] transition">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(m)} className="flex size-7 items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-white/[0.05] transition">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(showCreate || editing) && (
        <ModelModal model={editing} onClose={() => { setShowCreate(false); setEditing(null); }} onSaved={() => { setShowCreate(false); setEditing(null); load(); }} />
      )}
      {deleteTarget && (
        <ConfirmModal title="Delete Model" description={`Delete "${deleteTarget.name}"? This cannot be undone.`} loading={deleting} onConfirm={() => handleDelete(deleteTarget.id)} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}

const baseInput: React.CSSProperties = { background: "#080C18", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0" };

function ModelModal({ model, onClose, onSaved }: { model: Model | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(model?.name ?? "");
  const [gender, setGender] = useState<"female" | "male">(model?.gender ?? "female");
  const [bodyType, setBodyType] = useState(model?.bodyType ?? "slim");
  const [ethnicity, setEthnicity] = useState(model?.ethnicity ?? "");
  const [imageUrl, setImageUrl] = useState(model?.imageUrl ?? "");
  const [sortOrder, setSortOrder] = useState(model?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(model?.isActive ?? true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadImage(file: File, modelId: string) {
    const fd = new FormData(); fd.append("image", file); fd.append("modelId", modelId);
    const res = await fetch("/api/admin/upload/tryon-model", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Upload failed");
    return data.url as string;
  }

  function pickFile(f: File) {
    if (!model) {
      setImageUrl(URL.createObjectURL(f));
      (inputRef.current as HTMLInputElement & { _pendingFile?: File })._pendingFile = f;
    } else {
      setUploading(true);
      uploadImage(f, model.id)
        .then((url) => setImageUrl(url))
        .catch((err) => alert(err instanceof Error ? err.message : "Upload failed"))
        .finally(() => setUploading(false));
    }
  }

  async function submit() {
    setSaving(true);
    try {
      let id = model?.id;
      if (!id) {
        const res = await fetch("/api/admin/tryon-models", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, gender, bodyType, ethnicity }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Create failed");
        id = data.model.id as string;
        const pendingFile = (inputRef.current as HTMLInputElement & { _pendingFile?: File } | null)?._pendingFile;
        if (pendingFile && id) await uploadImage(pendingFile, id);
      }
      await fetch(`/api/admin/tryon-models/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, gender, bodyType, ethnicity, sortOrder, isActive }) });
      onSaved();
    } catch (e) { alert(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.09)", maxHeight: "92vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="text-[16px] font-bold text-slate-100">{model ? "Edit Model" : "Add New Model"}</h3>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Upload area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f?.type.startsWith("image/")) pickFile(f); }}
            onClick={() => inputRef.current?.click()}
            className="rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
            style={{ aspectRatio: imageUrl ? "3/4" : undefined, minHeight: imageUrl ? undefined : "180px", border: `2px dashed ${isDragging ? "rgba(16,185,129,0.6)" : imageUrl ? "rgba(16,185,129,0.4)" : "rgba(16,185,129,0.25)"}`, background: isDragging ? "rgba(16,185,129,0.06)" : "rgba(16,185,129,0.02)" }}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-full w-full object-cover rounded-xl" />
            ) : (
              <>
                <div className="relative">
                  <CloudUpload className="h-10 w-10 text-emerald-400" />
                  <div className="absolute -bottom-1 -right-2 flex size-5 items-center justify-center rounded-full" style={{ background: "#0F1629", border: "1px solid rgba(16,185,129,0.3)" }}>
                    <User className="h-3 w-3 text-emerald-400" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-semibold text-slate-200">{uploading ? "Uploading..." : "Upload model photo"}</p>
                  <p className="text-[13px] mt-1" style={{ color: "#6B7280" }}>Drag &amp; drop or <span className="text-emerald-400 hover:text-emerald-300 transition-colors">click to browse</span></p>
                  <p className="text-[11px] mt-2" style={{ color: "#4B5563" }}>JPG, PNG or WEBP &bull; Recommended: portrait 3:4</p>
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
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Emma" className="w-full h-11 pl-10 pr-4 rounded-xl text-[14px] placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition" style={baseInput} />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#9CA3AF" }}>Gender</label>
            <div className="grid grid-cols-2 gap-2">
              {(["female", "male"] as const).map((g) => (
                <button key={g} type="button" onClick={() => setGender(g)} className={cn("h-11 rounded-xl text-[13px] font-bold capitalize transition-all", gender === g ? "" : "text-slate-500 hover:text-slate-300")} style={gender === g ? { background: g === "female" ? "rgba(236,72,153,0.1)" : "rgba(56,189,248,0.1)", border: `1px solid ${g === "female" ? "rgba(236,72,153,0.35)" : "rgba(56,189,248,0.35)"}`, color: g === "female" ? "#F9A8D4" : "#93C5FD" } : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {g === "female" ? "Female" : "Male"}
                </button>
              ))}
            </div>
          </div>

          {/* Body type + Ethnicity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#9CA3AF" }}>Body Type</label>
              <div className="relative">
                <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} className="w-full h-11 rounded-xl px-3 pr-9 text-[13px] capitalize focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition appearance-none" style={baseInput}>
                  {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#4B5563" }} />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#9CA3AF" }}>Ethnicity</label>
              <input value={ethnicity} onChange={(e) => setEthnicity(e.target.value)} placeholder="e.g. latina, asian" className="w-full h-11 rounded-xl px-3 text-[13px] placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition" style={baseInput} />
            </div>
          </div>

          {/* Sort order + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#9CA3AF" }}>Sort Order</label>
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="w-full h-11 rounded-xl px-3 text-[14px] focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition" style={baseInput} />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#9CA3AF" }}>Visibility</label>
              <button type="button" onClick={() => setIsActive(!isActive)} className="w-full h-11 rounded-xl text-[13px] font-bold transition-all" style={{ border: `1px solid ${isActive ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.25)"}`, background: isActive ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.06)", color: isActive ? "#6EE7B7" : "#F87171" }}>
                {isActive ? "Active" : "Hidden"}
              </button>
            </div>
          </div>

          {/* Info notice */}
          <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <div className="flex size-5 shrink-0 items-center justify-center rounded-full mt-0.5" style={{ background: "rgba(16,185,129,0.15)" }}>
              <Info className="h-3 w-3 text-emerald-400" />
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: "#9CA3AF" }}>
              Active models will appear in the Try-On picker for all users.<br />
              Use a clean portrait photo with a plain background.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={onClose} className="flex-1 rounded-xl py-2.5 text-[14px] font-semibold text-slate-400 hover:text-slate-200 transition" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
          <button onClick={submit} disabled={saving || !name || !ethnicity} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-[14px] font-bold text-white disabled:opacity-40 transition-all" style={{ background: "linear-gradient(135deg, #10B981, #059669)", boxShadow: "0 0 20px rgba(16,185,129,0.25)" }}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            )}
            {saving ? "Saving..." : model ? "Save Changes" : "Add Model"}
          </button>
        </div>
      </div>
    </div>
  );
}
