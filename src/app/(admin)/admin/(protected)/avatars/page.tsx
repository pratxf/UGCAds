"use client";

import { useEffect, useState, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Trash2, Loader2, X, Tag, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string; _count?: { avatars: number } };
type Avatar = { id: string; name: string; imageUrl: string; categoryId: string | null; category: Category | null; active: boolean };

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const up = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22,1,0.36,1] as any } } };

function ConfirmModal({ title, description, loading, onConfirm, onClose }: { title: string; description: string; loading: boolean; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2, ease: [0.22,1,0.36,1] as any }}
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
            <button onClick={onConfirm} disabled={loading} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40 transition" style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 0 16px rgba(239,68,68,0.25)" }}>
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Delete Avatar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AdminModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2, ease: [0.22,1,0.36,1] as any }}
        onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] flex flex-col" style={{ background: "#0D1120", border: "1px solid rgba(255,255,255,0.09)" }}>
        <div className="h-[2px] w-full bg-gradient-to-r from-violet-500 to-purple-600 shrink-0" />
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-[14px] font-bold text-slate-100">{title}</h3>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </motion.div>
    </div>
  );
}

export default function AdminAvatarsPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showUpload, setShowUpload] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Avatar | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    const [a, c] = await Promise.all([
      fetch("/api/admin/avatars").then((r) => r.json()),
      fetch("/api/admin/avatar-categories").then((r) => r.json()),
    ]);
    setAvatars(a.avatars || []);
    setCategories(c.categories || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(avatar: Avatar) {
    setDeleting(true);
    await fetch(`/api/admin/avatars/${avatar.id}`, { method: "DELETE" });
    setDeleting(false); setDeleteTarget(null);
    await load();
  }

  async function toggleActive(a: Avatar) {
    await fetch(`/api/admin/avatars/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !a.active }) });
    await load();
  }

  async function handleDeleteCategory(id: string) {
    await fetch(`/api/admin/avatar-categories/${id}`, { method: "DELETE" });
    await load();
  }

  const filtered = avatars.filter((a) => filter === "all" || a.categoryId === filter);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
      <motion.div variants={up} className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-slate-100" style={{ fontFamily: "Satoshi, sans-serif" }}>UGC Studio Avatars</h1>
          <p className="text-sm text-slate-600 mt-0.5">Manage the avatar library shown to users in UGC Studio</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCategory(true)} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
            <Tag className="h-3.5 w-3.5" /> Categories
          </button>
          <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-bold text-white transition-all" style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)", boxShadow: "0 0 16px rgba(124,58,237,0.25)" }}>
            <Plus className="h-3.5 w-3.5" /> Upload Avatar
          </button>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={up} className="flex items-center gap-5">
        <div className="rounded-xl px-4 py-2.5" style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-700">Total</p>
          <p className="text-[22px] font-bold text-slate-100 tabular-nums" style={{ fontFamily: "Satoshi, sans-serif" }}>{avatars.length}</p>
        </div>
        <div className="rounded-xl px-4 py-2.5" style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-700">Active</p>
          <p className="text-[22px] font-bold text-emerald-300 tabular-nums" style={{ fontFamily: "Satoshi, sans-serif" }}>{avatars.filter((a) => a.active).length}</p>
        </div>
        <div className="rounded-xl px-4 py-2.5" style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-700">Inactive</p>
          <p className="text-[22px] font-bold text-red-400 tabular-nums" style={{ fontFamily: "Satoshi, sans-serif" }}>{avatars.filter((a) => !a.active).length}</p>
        </div>
      </motion.div>

      {/* Category filters */}
      <motion.div variants={up} className="flex flex-wrap gap-1.5">
        {[{ id: "all", name: "All", count: avatars.length }, ...categories.map((c) => ({ id: c.id, name: c.name, count: avatars.filter((a) => a.categoryId === c.id).length }))].map((cat) => (
          <button key={cat.id} onClick={() => setFilter(cat.id)} className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all", filter === cat.id ? "bg-violet-500/15 text-violet-300 border border-violet-500/30" : "text-slate-600 border border-white/[0.07] hover:text-slate-400")}>
            {cat.name} <span className={cn("ml-1", filter === cat.id ? "text-violet-400/60" : "text-slate-700")}>{cat.count}</span>
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl flex items-center justify-center py-16 text-sm text-slate-700" style={{ border: "1px dashed rgba(255,255,255,0.07)" }}>
          No avatars in this category
        </div>
      ) : (
        <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((a) => (
            <motion.div key={a.id} variants={up} className={cn("group relative aspect-[3/4] rounded-2xl overflow-hidden", !a.active && "opacity-50")} style={{ border: a.active ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(239,68,68,0.3)" }}>
              <img src={a.imageUrl} alt={a.name} className="h-full w-full object-cover object-top" />
              <div className="absolute inset-x-0 bottom-0 p-3" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }}>
                <p className="text-[11px] font-bold text-white truncate">{a.name}</p>
                {a.category && <p className="text-[10px] text-white/50 truncate">{a.category.name}</p>}
              </div>
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toggleActive(a)} className={cn("flex h-6 px-2 items-center justify-center rounded-md text-[10px] font-bold backdrop-blur-sm transition-colors", a.active ? "bg-black/70 text-white/80 hover:bg-amber-400/90 hover:text-black" : "bg-black/70 text-white/80 hover:bg-emerald-400/90 hover:text-black")}>
                  {a.active ? "Hide" : "Show"}
                </button>
                <button onClick={() => setDeleteTarget(a)} className="flex size-6 items-center justify-center rounded-md backdrop-blur-sm transition-colors" style={{ background: "rgba(0,0,0,0.7)" }}>
                  <Trash2 className="h-3 w-3 text-white/70 hover:text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {showUpload && <UploadModal categories={categories} onClose={() => setShowUpload(false)} onSaved={() => { setShowUpload(false); load(); }} />}
      {showCategory && <CategoryModal categories={categories} onClose={() => setShowCategory(false)} onChange={load} onDelete={handleDeleteCategory} />}
      {deleteTarget && <ConfirmModal title="Delete Avatar" description={`Delete "${deleteTarget.name}"? This cannot be undone.`} loading={deleting} onConfirm={() => handleDelete(deleteTarget)} onClose={() => setDeleteTarget(null)} />}
    </motion.div>
  );
}

function UploadModal({ categories, onClose, onSaved }: { categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f));
  }

  async function submit() {
    if (!name || !file) return;
    setSaving(true);
    const fd = new FormData();
    fd.append("name", name); fd.append("image", file);
    if (categoryId) fd.append("categoryId", categoryId);
    const res = await fetch("/api/admin/avatars", { method: "POST", body: fd });
    setSaving(false);
    if (res.ok) onSaved();
    else alert("Upload failed");
  }

  return (
    <AdminModal onClose={onClose} title="Upload Avatar">
      <div className="space-y-4">
        <div onClick={() => inputRef.current?.click()} className="aspect-[3/4] w-full rounded-xl overflow-hidden flex items-center justify-center cursor-pointer transition-all" style={{ border: "2px dashed rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.04)" }}>
          {preview ? <Image src={preview} alt="" width={300} height={400} className="h-full w-full object-cover object-top" /> : <p className="text-sm text-slate-700 px-4 text-center">Click to upload avatar image</p>}
          <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={pickFile} />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5 block">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah Chen" className="w-full h-10 rounded-xl px-3 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none" style={{ background: "#080C15", border: "1px solid rgba(255,255,255,0.08)" }} />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5 block">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full h-10 rounded-xl px-3 text-sm text-slate-200 focus:outline-none" style={{ background: "#080C15", border: "1px solid rgba(255,255,255,0.08)" }}>
            <option value="">Uncategorized</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button onClick={submit} disabled={!name || !file || saving} className="w-full rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40 transition-all" style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)", boxShadow: "0 0 16px rgba(124,58,237,0.2)" }}>
          {saving ? "Uploading..." : "Save Avatar"}
        </button>
      </div>
    </AdminModal>
  );
}

function CategoryModal({ categories, onClose, onChange, onDelete }: { categories: Category[]; onClose: () => void; onChange: () => void; onDelete: (id: string) => void }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function add() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/avatar-categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    setSaving(false);
    if (res.ok) { setName(""); onChange(); }
    else alert("Failed to create");
  }

  return (
    <AdminModal onClose={onClose} title="Avatar Categories">
      <div className="space-y-4">
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" className="flex-1 h-10 rounded-xl px-3 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none" style={{ background: "#080C15", border: "1px solid rgba(255,255,255,0.08)" }} onKeyDown={(e) => e.key === "Enter" && add()} />
          <button onClick={add} disabled={!name.trim() || saving} className="rounded-xl px-4 py-2 text-[12px] font-bold text-white disabled:opacity-40" style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>Add</button>
        </div>
        <div className="space-y-1.5">
          {categories.length === 0 ? (
            <p className="text-sm text-slate-700 text-center py-4">No categories yet</p>
          ) : categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <p className="text-[13px] font-semibold text-slate-200">{c.name}</p>
                <p className="text-[11px] text-slate-700">{c._count?.avatars ?? 0} avatars</p>
              </div>
              <button onClick={async () => { setDeletingId(c.id); await onDelete(c.id); setDeletingId(null); }} disabled={deletingId === c.id} className="text-slate-700 hover:text-red-400 transition-colors">
                {deletingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminModal>
  );
}
