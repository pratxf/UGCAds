"use client";

import { useEffect, useState, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Trash2, Loader2, X, Tag, Pencil, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string; _count?: { templates: number } };
type Template = { id: string; name: string; imageUrl: string; prompt: string; categoryId: string | null; category: Category | null; active: boolean };

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

function AdminModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col" style={{ background: "#0D1120", border: "1px solid rgba(255,255,255,0.09)", maxHeight: "90vh" }}>
        <div className="h-[2px] w-full bg-gradient-to-r from-amber-500 to-orange-600 shrink-0" />
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

export default function AdminPhotoshootTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showUpload, setShowUpload] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    const [t, c] = await Promise.all([
      fetch("/api/admin/photoshoot-templates").then((r) => r.json()),
      fetch("/api/admin/photoshoot-categories").then((r) => r.json()),
    ]);
    setTemplates(t.templates || []); setCategories(c.categories || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    setDeleting(true);
    await fetch(`/api/admin/photoshoot-templates/${id}`, { method: "DELETE" });
    setDeleting(false); setDeleteTarget(null);
    await load();
  }

  async function handleDeleteCategory(id: string) {
    await fetch(`/api/admin/photoshoot-categories/${id}`, { method: "DELETE" });
    await load();
  }

  const filtered = templates.filter((t) => filter === "all" || t.categoryId === filter);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
      <motion.div variants={up} className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-slate-100" style={{ fontFamily: "Satoshi, sans-serif" }}>Photoshoot Templates</h1>
          <p className="text-sm text-slate-600 mt-0.5">{templates.length} templates · hidden prompt used at generation time</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCategory(true)} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
            <Tag className="h-3.5 w-3.5" /> Categories
          </button>
          <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-bold text-white transition-all" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 0 16px rgba(245,158,11,0.25)" }}>
            <Plus className="h-3.5 w-3.5" /> New Template
          </button>
        </div>
      </motion.div>

      {/* Category filters */}
      <motion.div variants={up} className="flex flex-wrap gap-1.5">
        {[{ id: "all", name: "All", count: templates.length }, ...categories.map((c) => ({ id: c.id, name: c.name, count: templates.filter((t) => t.categoryId === c.id).length }))].map((cat) => (
          <button key={cat.id} onClick={() => setFilter(cat.id)} className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all", filter === cat.id ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "text-slate-600 border border-white/[0.07] hover:text-slate-400")}>
            {cat.name} <span className={cn("ml-1", filter === cat.id ? "text-amber-400/60" : "text-slate-700")}>{cat.count}</span>
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl flex items-center justify-center py-16 text-sm text-slate-700" style={{ border: "1px dashed rgba(255,255,255,0.07)" }}>
          No templates. Click New Template to add one.
        </div>
      ) : (
        <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((t) => (
            <motion.div key={t.id} variants={up} className="group relative aspect-square rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <img src={t.imageUrl} alt={t.name} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 p-3" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }}>
                <p className="text-[11px] font-bold text-white truncate">{t.name}</p>
                {t.category && <p className="text-[10px] text-white/50 truncate">{t.category.name}</p>}
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(t)} className="flex size-7 items-center justify-center rounded-lg backdrop-blur-sm transition-colors" style={{ background: "rgba(0,0,0,0.7)" }}>
                  <Pencil className="h-3 w-3 text-white/70 hover:text-sky-400" />
                </button>
                <button onClick={() => setDeleteTarget(t)} className="flex size-7 items-center justify-center rounded-lg backdrop-blur-sm transition-colors" style={{ background: "rgba(0,0,0,0.7)" }}>
                  <Trash2 className="h-3 w-3 text-white/70 hover:text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {showUpload && <UploadModal categories={categories} onClose={() => setShowUpload(false)} onSaved={() => { setShowUpload(false); load(); }} />}
      {editing && <EditModal template={editing} categories={categories} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {showCategory && <CategoryModal categories={categories} onClose={() => setShowCategory(false)} onChange={load} onDelete={handleDeleteCategory} />}
      {deleteTarget && <ConfirmModal title="Delete Template" description={`Delete "${deleteTarget.name}"? This cannot be undone.`} loading={deleting} onConfirm={() => handleDelete(deleteTarget.id)} onClose={() => setDeleteTarget(null)} />}
    </motion.div>
  );
}

function InputField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

const baseInput = { background: "#080C15", border: "1px solid rgba(255,255,255,0.08)" };

function UploadModal({ categories, onClose, onSaved }: { categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f));
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
    <AdminModal onClose={onClose} title="New Photoshoot Template">
      <div className="space-y-4">
        <div onClick={() => inputRef.current?.click()} className="aspect-square w-full rounded-xl overflow-hidden flex items-center justify-center cursor-pointer" style={{ border: "2px dashed rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.04)" }}>
          {preview ? <Image src={preview} alt="" width={400} height={400} className="h-full w-full object-cover" /> : <p className="text-sm text-slate-700 text-center">Click to upload preview image</p>}
          <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={pickFile} />
        </div>
        <InputField label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Marble Surface" className="w-full h-10 rounded-xl px-3 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none" style={baseInput} />
        </InputField>
        <InputField label="Prompt (server-only)">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} placeholder="AI generation prompt..." className="w-full rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none resize-y" style={baseInput} />
        </InputField>
        <InputField label="Category">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full h-10 rounded-xl px-3 text-sm text-slate-200 focus:outline-none" style={baseInput}>
            <option value="">Uncategorized</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </InputField>
        <button onClick={submit} disabled={!name || !prompt || !file || saving} className="w-full rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 0 16px rgba(245,158,11,0.2)" }}>
          {saving ? "Saving..." : "Save Template"}
        </button>
      </div>
    </AdminModal>
  );
}

function EditModal({ template, categories, onClose, onSaved }: { template: Template; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(template.name);
  const [prompt, setPrompt] = useState(template.prompt);
  const [categoryId, setCategoryId] = useState<string>(template.categoryId || "");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    const res = await fetch(`/api/admin/photoshoot-templates/${template.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, prompt, categoryId: categoryId || null }) });
    setSaving(false);
    if (res.ok) onSaved(); else alert("Save failed");
  }

  return (
    <AdminModal onClose={onClose} title="Edit Template">
      <div className="space-y-4">
        <img src={template.imageUrl} alt={template.name} className="aspect-square w-full rounded-xl object-cover" style={{ border: "1px solid rgba(255,255,255,0.07)" }} />
        <InputField label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-10 rounded-xl px-3 text-sm text-slate-200 focus:outline-none" style={baseInput} />
        </InputField>
        <InputField label="Prompt">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className="w-full rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none resize-y" style={baseInput} />
        </InputField>
        <InputField label="Category">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full h-10 rounded-xl px-3 text-sm text-slate-200 focus:outline-none" style={baseInput}>
            <option value="">Uncategorized</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </InputField>
        <button onClick={submit} disabled={saving} className="w-full rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </AdminModal>
  );
}

function CategoryModal({ categories, onClose, onChange, onDelete }: { categories: Category[]; onClose: () => void; onChange: () => void; onDelete: (id: string) => void }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/photoshoot-categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    setSaving(false);
    if (res.ok) { setName(""); onChange(); } else alert("Failed to create");
  }

  return (
    <AdminModal onClose={onClose} title="Template Categories">
      <div className="space-y-4">
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" className="flex-1 h-10 rounded-xl px-3 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none" style={baseInput} onKeyDown={(e) => e.key === "Enter" && add()} />
          <button onClick={add} disabled={!name.trim() || saving} className="rounded-xl px-4 py-2 text-[12px] font-bold text-white disabled:opacity-40" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>Add</button>
        </div>
        <div className="space-y-1.5">
          {categories.length === 0 ? (
            <p className="text-sm text-slate-700 text-center py-4">No categories yet</p>
          ) : categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <p className="text-[13px] font-semibold text-slate-200">{c.name}</p>
                <p className="text-[11px] text-slate-700">{c._count?.templates ?? 0} templates</p>
              </div>
              <button onClick={() => onDelete(c.id)} className="text-slate-700 hover:text-red-400 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminModal>
  );
}
