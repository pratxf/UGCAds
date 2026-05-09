"use client";

import { useEffect, useState, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Trash2, Loader2, X, Pencil, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Model = { id: string; name: string; gender: "female" | "male"; bodyType: string; ethnicity: string; imageUrl: string; isActive: boolean; sortOrder: number };

const BODY_TYPES = ["slim", "athletic", "curvy", "plus", "average", "muscular"];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const up = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22,1,0.36,1] as any } } };

function ConfirmModal({ title, description, loading, onConfirm, onClose }: { title: string; description: string; loading: boolean; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: "#0D1120", border: "1px solid rgba(255,255,255,0.09)" }}>
        <div className="h-[2px] w-full bg-gradient-to-r from-red-500 to-rose-600" />
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
            <button onClick={onClose} className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-300 transition" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40 transition" style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const baseInput: React.CSSProperties = { background: "#080C15", border: "1px solid rgba(255,255,255,0.08)" };

export default function AdminTryonModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "female" | "male">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Model | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Model | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/tryon-models").then((r) => r.json());
    setModels(r.models || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleActive(m: Model) {
    await fetch(`/api/admin/tryon-models/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !m.isActive }) });
    load();
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    await fetch(`/api/admin/tryon-models/${id}`, { method: "DELETE" });
    setDeleting(false); setDeleteTarget(null);
    load();
  }

  const filtered = models.filter((m) => filter === "all" || m.gender === filter);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
      <motion.div variants={up} className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-slate-100" style={{ fontFamily: "Satoshi, sans-serif" }}>Try-On Models</h1>
          <p className="text-sm text-slate-600 mt-0.5">Manage base models for the AI Try-On feature</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-bold text-white transition-all" style={{ background: "linear-gradient(135deg, #10B981, #059669)", boxShadow: "0 0 16px rgba(16,185,129,0.25)" }}>
          <Plus className="h-3.5 w-3.5" /> Add Model
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={up} className="flex items-center gap-4">
        <div className="rounded-xl px-4 py-2.5" style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-700">Total</p>
          <p className="text-[22px] font-bold text-slate-100 tabular-nums" style={{ fontFamily: "Satoshi, sans-serif" }}>{models.length}</p>
        </div>
        <div className="rounded-xl px-4 py-2.5" style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-700">Female</p>
          <p className="text-[22px] font-bold text-pink-300 tabular-nums" style={{ fontFamily: "Satoshi, sans-serif" }}>{models.filter((m) => m.gender === "female").length}</p>
        </div>
        <div className="rounded-xl px-4 py-2.5" style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-700">Male</p>
          <p className="text-[22px] font-bold text-sky-300 tabular-nums" style={{ fontFamily: "Satoshi, sans-serif" }}>{models.filter((m) => m.gender === "male").length}</p>
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div variants={up} className="flex gap-1.5">
        {(["all", "female", "male"] as const).map((g) => (
          <button key={g} onClick={() => setFilter(g)} className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize transition-all", filter === g ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : "text-slate-600 border border-white/[0.07] hover:text-slate-400")}>
            {g === "all" ? "All" : g === "female" ? "Female" : "Male"}{" "}
            <span className={cn("ml-1", filter === g ? "text-emerald-400/60" : "text-slate-700")}>{g === "all" ? models.length : models.filter((m) => m.gender === g).length}</span>
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl flex items-center justify-center py-16 text-sm text-slate-700" style={{ border: "1px dashed rgba(255,255,255,0.07)" }}>
          No models. Click Add Model to create one.
        </div>
      ) : (
        <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((m) => (
            <motion.div key={m.id} variants={up} className={cn("group relative aspect-[3/4] rounded-2xl overflow-hidden", !m.isActive && "opacity-50")} style={{ border: m.isActive ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(239,68,68,0.3)" }}>
              {m.imageUrl ? (
                <img src={m.imageUrl} alt={m.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-4xl" style={{ background: "rgba(255,255,255,0.03)" }}>👤</div>
              )}
              <div className="absolute inset-x-0 bottom-0 p-3" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }}>
                <p className="text-[11px] font-bold text-white truncate">{m.name}</p>
                <p className="text-[10px] text-white/50 truncate">{m.gender} · {m.bodyType} · {m.ethnicity}</p>
              </div>
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(m)} className="flex size-7 items-center justify-center rounded-lg backdrop-blur-sm transition-colors" style={{ background: "rgba(0,0,0,0.7)" }}>
                  <Pencil className="h-3 w-3 text-white/70 hover:text-sky-400" />
                </button>
                <button onClick={() => toggleActive(m)} className="flex h-7 px-2 items-center justify-center rounded-lg backdrop-blur-sm text-[10px] font-bold text-white/70 transition-colors" style={{ background: "rgba(0,0,0,0.7)" }}>
                  {m.isActive ? "Hide" : "Show"}
                </button>
                <button onClick={() => setDeleteTarget(m)} className="flex size-7 items-center justify-center rounded-lg backdrop-blur-sm transition-colors" style={{ background: "rgba(0,0,0,0.7)" }}>
                  <Trash2 className="h-3 w-3 text-white/70 hover:text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {(showCreate || editing) && (
        <ModelModal model={editing} onClose={() => { setShowCreate(false); setEditing(null); }} onSaved={() => { setShowCreate(false); setEditing(null); load(); }} />
      )}
      {deleteTarget && <ConfirmModal title="Delete Model" description={`Delete "${deleteTarget.name}"? This cannot be undone.`} loading={deleting} onConfirm={() => handleDelete(deleteTarget.id)} onClose={() => setDeleteTarget(null)} />}
    </motion.div>
  );
}

function ModelModal({ model, onClose, onSaved }: { model: Model | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(model?.name ?? "");
  const [gender, setGender] = useState<"female" | "male">(model?.gender ?? "female");
  const [bodyType, setBodyType] = useState(model?.bodyType ?? "slim");
  const [ethnicity, setEthnicity] = useState(model?.ethnicity ?? "");
  const [imageUrl, setImageUrl] = useState(model?.imageUrl ?? "");
  const [sortOrder, setSortOrder] = useState(model?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(model?.isActive ?? true);
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

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    if (!model) {
      setImageUrl(URL.createObjectURL(f));
      (inputRef.current as HTMLInputElement & { _pendingFile?: File })._pendingFile = f;
      return;
    }
    setUploading(true);
    try { const url = await uploadImage(f, model.id); setImageUrl(url); }
    catch (err) { alert(err instanceof Error ? err.message : "Upload failed"); }
    finally { setUploading(false); }
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
        if (pendingFile && id) { const url = await uploadImage(pendingFile, id); setImageUrl(url); }
      }
      await fetch(`/api/admin/tryon-models/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, gender, bodyType, ethnicity, sortOrder, isActive }) });
      onSaved();
    } catch (e) { alert(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col" style={{ background: "#0D1120", border: "1px solid rgba(255,255,255,0.09)", maxHeight: "90vh" }}>
        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500 to-teal-600 shrink-0" />
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-[14px] font-bold text-slate-100">{model ? "Edit Model" : "New Model"}</h3>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          <div onClick={() => inputRef.current?.click()} className="aspect-[3/4] w-full rounded-xl overflow-hidden flex items-center justify-center cursor-pointer" style={{ border: "2px dashed rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.04)" }}>
            {imageUrl ? <Image src={imageUrl} alt="" width={300} height={400} className="h-full w-full object-cover" /> : (
              <p className="text-sm text-slate-700 text-center px-4">{uploading ? "Uploading..." : "Click to upload model image"}</p>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5 block">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-10 rounded-xl px-3 text-sm text-slate-200 focus:outline-none" style={baseInput} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5 block">Gender</label>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                {(["female", "male"] as const).map((g) => (
                  <button key={g} type="button" onClick={() => setGender(g)} className={cn("rounded-lg py-2 text-[11px] font-bold capitalize transition-colors", gender === g ? "bg-white/[0.08] text-slate-200" : "text-slate-600 hover:text-slate-400")}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5 block">Body Type</label>
              <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} className="w-full h-10 rounded-xl px-3 text-sm text-slate-200 capitalize focus:outline-none" style={baseInput}>
                {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5 block">Ethnicity</label>
            <input value={ethnicity} onChange={(e) => setEthnicity(e.target.value)} placeholder="e.g. latina, asian, white" className="w-full h-10 rounded-xl px-3 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none" style={baseInput} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5 block">Sort Order</label>
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="w-full h-10 rounded-xl px-3 text-sm text-slate-200 focus:outline-none" style={baseInput} />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5 block">Status</label>
              <button type="button" onClick={() => setIsActive(!isActive)} className={cn("w-full h-10 rounded-xl text-[12px] font-bold transition-colors", isActive ? "text-emerald-300" : "text-red-400")} style={{ border: `1px solid ${isActive ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"}`, background: isActive ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.08)" }}>
                {isActive ? "Active" : "Inactive"}
              </button>
            </div>
          </div>

          <button onClick={submit} disabled={saving || !name || !ethnicity} className="w-full rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40 transition-all" style={{ background: "linear-gradient(135deg, #10B981, #059669)", boxShadow: "0 0 16px rgba(16,185,129,0.2)" }}>
            {saving ? "Saving..." : "Save Model"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
