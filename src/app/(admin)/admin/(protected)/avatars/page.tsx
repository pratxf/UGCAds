"use client";

import { useEffect, useState, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { Plus, Trash2, Loader2, X, Tag, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string; _count?: { avatars: number } };
type Avatar = {
  id: string;
  name: string;
  imageUrl: string;
  categoryId: string | null;
  category: Category | null;
  active: boolean;
};

function ConfirmModal({
  title,
  description,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f0f14] shadow-2xl">
        <div className="flex items-start gap-4 p-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 mt-0.5">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="flex gap-2 px-6 pb-6">
          <button onClick={onClose} className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-destructive/90 transition"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
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
    setDeleting(false);
    setDeleteTarget(null);
    await load();
  }

  async function toggleActive(a: Avatar) {
    await fetch(`/api/admin/avatars/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !a.active }),
    });
    await load();
  }

  async function handleDeleteCategory(id: string) {
    await fetch(`/api/admin/avatar-categories/${id}`, { method: "DELETE" });
    await load();
  }

  const filtered = avatars.filter((a) => filter === "all" || a.categoryId === filter);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">UGC Studio Avatars</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage the avatar library shown to users in UGC Studio
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategory(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-white/5 transition"
          >
            <Tag className="h-4 w-4" /> Categories
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black hover:brightness-105 transition"
          >
            <Plus className="h-4 w-4" /> Upload Avatar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-[13px] text-muted-foreground">
        <span><span className="font-bold text-foreground">{avatars.length}</span> total</span>
        <span><span className="font-bold text-emerald-400">{avatars.filter((a) => a.active).length}</span> active</span>
        <span><span className="font-bold text-destructive">{avatars.filter((a) => !a.active).length}</span> inactive</span>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <CategoryChip active={filter === "all"} onClick={() => setFilter("all")}>
          All <span className="opacity-50 ml-1">{avatars.length}</span>
        </CategoryChip>
        {categories.map((c) => (
          <CategoryChip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
            {c.name}{" "}
            <span className="opacity-50 ml-1">{avatars.filter((a) => a.categoryId === c.id).length}</span>
          </CategoryChip>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No avatars yet. Click <strong className="text-foreground">Upload Avatar</strong> to add one.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((a) => (
            <div
              key={a.id}
              className={cn(
                "group relative aspect-[3/4] rounded-2xl border bg-card overflow-hidden",
                a.active ? "border-border" : "border-destructive/40 opacity-60",
              )}
            >
              <img src={a.imageUrl} alt={a.name} className="h-full w-full object-cover object-top" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                <p className="text-xs font-semibold text-white truncate">{a.name}</p>
                {a.category && (
                  <p className="text-[10px] text-white/60 truncate">{a.category.name}</p>
                )}
              </div>
              <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => toggleActive(a)}
                  className={cn(
                    "flex h-6 px-2 items-center justify-center rounded-md text-[10px] font-semibold backdrop-blur transition",
                    a.active
                      ? "bg-black/60 text-white/80 hover:bg-amber-400/80 hover:text-black"
                      : "bg-black/60 text-white/80 hover:bg-emerald-400/80 hover:text-black"
                  )}
                >
                  {a.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => setDeleteTarget(a)}
                  className="flex size-6 items-center justify-center rounded-md bg-black/60 backdrop-blur text-white/80 hover:bg-destructive transition"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <UploadModal
          categories={categories}
          onClose={() => setShowUpload(false)}
          onSaved={() => { setShowUpload(false); load(); }}
        />
      )}

      {showCategory && (
        <CategoryModal
          categories={categories}
          onClose={() => setShowCategory(false)}
          onChange={load}
          onDelete={handleDeleteCategory}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Avatar"
          description={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          confirmLabel="Delete Avatar"
          loading={deleting}
          onConfirm={() => handleDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function CategoryChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:text-foreground hover:bg-white/5"
      )}
    >
      {children}
    </button>
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
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit() {
    if (!name || !file) return;
    setSaving(true);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("image", file);
    if (categoryId) fd.append("categoryId", categoryId);
    const res = await fetch("/api/admin/avatars", { method: "POST", body: fd });
    setSaving(false);
    if (res.ok) onSaved();
    else alert("Upload failed");
  }

  return (
    <Modal onClose={onClose} title="Upload Avatar">
      <div className="space-y-4">
        <div
          onClick={() => inputRef.current?.click()}
          className="aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-border bg-white/[0.02] hover:border-primary/40 cursor-pointer overflow-hidden flex items-center justify-center"
        >
          {preview ? (
            <Image src={preview} alt="" width={300} height={400} className="h-full w-full object-cover object-top" />
          ) : (
            <div className="text-center text-muted-foreground text-sm px-4">Click to upload avatar image</div>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={pickFile} />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground mb-1 block">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sarah Chen"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/40"
          />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground mb-1 block">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/40"
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button
          onClick={submit}
          disabled={!name || !file || saving}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-black disabled:opacity-50 hover:brightness-105 transition"
        >
          {saving ? "Uploading..." : "Save Avatar"}
        </button>
      </div>
    </Modal>
  );
}

function CategoryModal({
  categories, onClose, onChange, onDelete,
}: {
  categories: Category[]; onClose: () => void; onChange: () => void; onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function add() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/avatar-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaving(false);
    if (res.ok) { setName(""); onChange(); }
    else alert("Failed to create");
  }

  return (
    <Modal onClose={onClose} title="Avatar Categories">
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New category name"
            className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/40"
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <button
            onClick={add}
            disabled={!name.trim() || saving}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            Add
          </button>
        </div>
        <div className="space-y-1.5">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No categories yet</p>
          ) : (
            categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">{c._count?.avatars ?? 0} avatars</p>
                </div>
                <button
                  onClick={async () => {
                    setDeletingId(c.id);
                    await onDelete(c.id);
                    setDeletingId(null);
                  }}
                  disabled={deletingId === c.id}
                  className="text-muted-foreground hover:text-destructive transition"
                >
                  {deletingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl border border-border bg-[#0c0c10] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
