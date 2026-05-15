"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
  type ChangeEvent,
} from "react";
import { useSetTopbarRight } from "@/app/(admin)/_components/AdminTopbarContext";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Loader2,
  X,
  ChevronDown,
  Search,
  Filter,
  LayoutGrid,
  List,
  Users,
  CheckCircle,
  EyeOff,
  CloudUpload,
  User,
  Info,
  MoreHorizontal,
  AlertTriangle,
  UploadCloud,
  ArrowUpRight,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = {
  id: string;
  name: string;
  slug: string;
  _count?: { avatars: number };
};

type Avatar = {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl?: string;
  categoryId: string | null;
  category: Category | null;
  active: boolean;
};

type GenderFilter = "all" | "women" | "men";
type SortOption = "newest" | "oldest" | "name-asc" | "name-desc";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGender(avatar: Avatar): "women" | "men" | "other" {
  const catName = (avatar.category?.name ?? "").toLowerCase();
  if (catName.includes("women") || catName.includes("female")) return "women";
  if (catName.includes("men") || catName.includes("male")) return "men";
  return "other";
}

const PAGE_SIZE = 12;

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmModal({
  title,
  description,
  loading,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "#0F1629",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="h-[2px] w-full bg-gradient-to-r from-red-500 to-rose-600" />
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "rgba(248,113,113,0.12)" }}
            >
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-slate-100">{title}</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-200 transition"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40 transition"
              style={{
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                boxShadow: "0 0 16px rgba(239,68,68,0.25)",
              }}
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Delete Avatar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Avatar Card Dropdown Menu ────────────────────────────────────────────────

function AvatarCardMenu({
  avatar,
  onToggle,
  onDelete,
}: {
  avatar: Avatar;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex size-7 items-center justify-center rounded-lg transition-colors"
        style={{
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <MoreHorizontal className="h-3.5 w-3.5 text-white" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-8 z-10 min-w-[140px] rounded-xl overflow-hidden"
          style={{
            background: "#0F1629",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onToggle();
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-[12px] font-medium text-slate-300 hover:bg-white/[0.05] transition-colors"
          >
            {avatar.active ? (
              <>
                <EyeOff className="h-3.5 w-3.5 text-amber-400" />
                Set Inactive
              </>
            ) : (
              <>
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                Set Active
              </>
            )}
          </button>
          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-[12px] font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Category Dropdown ────────────────────────────────────────────────────────

function CategoryDropdown({
  value,
  categories,
  onChange,
}: {
  value: string;
  categories: Category[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = categories.find((c) => c.id === value);
  const label = selected ? selected.name : "Uncategorized";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between h-10 rounded-xl px-3 text-sm transition"
        style={{
          background: "#080C18",
          border: open ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.08)",
          color: value ? "#E2E8F0" : "#64748B",
        }}
      >
        <span>{label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-600 shrink-0" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      {open && (
        <div
          className="absolute left-0 top-11 z-40 w-full rounded-xl overflow-hidden"
          style={{
            background: "#0F1629",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          <button
            onClick={() => { onChange(""); setOpen(false); }}
            className="flex w-full items-center px-3 py-2.5 text-[13px] font-medium transition-colors"
            style={{ color: !value ? "#A5B4FC" : "#94A3B8", background: !value ? "rgba(99,102,241,0.1)" : "transparent" }}
            onMouseEnter={(e) => { if (value) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={(e) => { if (value) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            Uncategorized
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { onChange(c.id); setOpen(false); }}
              className="flex w-full items-center px-3 py-2.5 text-[13px] font-medium transition-colors"
              style={{ color: value === c.id ? "#A5B4FC" : "#94A3B8", background: value === c.id ? "rgba(99,102,241,0.1)" : "transparent" }}
              onMouseEnter={(e) => { if (value !== c.id) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { if (value !== c.id) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Categories Modal ─────────────────────────────────────────────────────────

function CategoriesModal({
  categories,
  onClose,
  onChanged,
}: {
  categories: Category[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function addCategory() {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    await fetch("/api/admin/avatar-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaving(false);
    setNewName("");
    onChanged();
  }

  async function deleteCategory(id: string) {
    setDeletingId(id);
    await fetch(`/api/admin/avatar-categories/${id}`, { method: "DELETE" });
    setDeletingId(null);
    onChanged();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: "#0F1629",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
          maxHeight: "80vh",
        }}
      >
        {/* Accent line */}
        <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, #6366F1, #8B5CF6)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            {/* ugcads logo */}
            <div className="flex items-center gap-[3px]">
              <span className="text-[15px] font-bold text-white">ugc</span>
              <div
                className="flex items-center justify-center rounded-[5px]"
                style={{ width: 20, height: 20, background: "#2563EB" }}
              >
                <ArrowUpRight className="h-3 w-3 text-white" />
              </div>
              <span className="text-[15px] font-bold text-white">ads</span>
            </div>
            <div
              className="h-4 w-px"
              style={{ background: "rgba(255,255,255,0.1)" }}
            />
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-indigo-400" />
              <h3 className="text-[14px] font-bold text-slate-100">Avatar Categories</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {categories.length === 0 ? (
            <p className="text-[13px] text-slate-600 py-4 text-center">No categories yet</p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div>
                  <p className="text-[13px] font-semibold text-slate-200">{cat.name}</p>
                  {cat._count && (
                    <p className="text-[11px] text-slate-600 mt-0.5">{cat._count.avatars} avatar{cat._count.avatars !== 1 ? "s" : ""}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  disabled={deletingId === cat.id}
                  className="flex size-7 items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                >
                  {deletingId === cat.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add new */}
        <div className="px-6 pb-6 pt-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Add Category</p>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addCategory(); }}
              placeholder="e.g. Women 20s"
              className="flex-1 h-10 rounded-xl px-3 text-[13px] text-slate-200 placeholder:text-slate-600 focus:outline-none transition"
              style={{
                background: "#080C18",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)")}
              onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)")}
            />
            <button
              onClick={addCategory}
              disabled={!newName.trim() || saving}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 text-[13px] font-bold text-white disabled:opacity-40 transition-all"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Upload Avatar Modal ──────────────────────────────────────────────────────

function UploadModal({
  categories,
  onClose,
  onSaved,
}: {
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFileFromEvent(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) pickFileFromEvent(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) pickFileFromEvent(f);
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
    else alert("Upload failed. Please try again.");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          background: "#0F1629",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 pt-6 pb-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div>
            <h3 className="text-[16px] font-bold text-slate-100">
              Upload Avatar
            </h3>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Add a new avatar to the UGC Studio library
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition ml-3 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className="relative flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all overflow-hidden"
            style={{
              minHeight: 180,
              border: isDragging
                ? "2px dashed #6366F1"
                : preview
                ? "2px dashed rgba(99,102,241,0.4)"
                : "2px dashed rgba(99,102,241,0.3)",
              background: isDragging
                ? "rgba(99,102,241,0.08)"
                : preview
                ? "transparent"
                : "rgba(99,102,241,0.03)",
            }}
          >
            {preview ? (
              <div className="relative w-full" style={{ minHeight: 180 }}>
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover object-top"
                />
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                >
                  <p className="text-[12px] font-semibold text-white">
                    Click to change
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8 px-6 text-center">
                <div
                  className="flex size-12 items-center justify-center rounded-2xl"
                  style={{ background: "rgba(99,102,241,0.12)" }}
                >
                  <CloudUpload className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-300">
                    Drag & drop your image here
                  </p>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    or{" "}
                    <span className="text-indigo-400 font-semibold">
                      click to browse files
                    </span>
                  </p>
                </div>
                <p className="text-[11px] text-slate-600">
                  PNG, JPG or WEBP &bull; Max 10MB &bull; 1:1 aspect ratio
                </p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleInputChange}
            />
          </div>

          {/* Name field */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Chen"
                className="w-full h-10 rounded-xl pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none transition"
                style={{
                  background: "#080C18",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.border =
                    "1px solid rgba(99,102,241,0.5)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.border =
                    "1px solid rgba(255,255,255,0.08)")
                }
              />
            </div>
          </div>

          {/* Category field */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Category
            </label>
            <CategoryDropdown
              value={categoryId}
              categories={categories}
              onChange={setCategoryId}
            />
          </div>

          {/* Info note */}
          <div
            className="flex items-start gap-2.5 rounded-xl px-3 py-3"
            style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)" }}
          >
            <Info className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Avatars will be reviewed before they become available to users in
              UGC Studio.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-200 transition"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!name.trim() || !file || saving}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40 transition-all"
              style={{
                background:
                  "linear-gradient(135deg, #6366F1, #8B5CF6)",
                boxShadow: "0 0 20px rgba(99,102,241,0.3)",
              }}
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UploadCloud className="h-3.5 w-3.5" />
              )}
              {saving ? "Uploading..." : "Save Avatar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  count,
  subtitle,
  icon,
  countColor,
  iconBg,
}: {
  label: string;
  count: number;
  subtitle: string;
  icon: React.ReactNode;
  countColor: string;
  iconBg: string;
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl px-5 py-4 flex-1 min-w-[180px]"
      style={{
        background: "#0F1629",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
          {label}
        </p>
        <p
          className="text-[26px] font-bold tabular-nums leading-tight"
          style={{ color: countColor }}
        >
          {count}
        </p>
        <p className="text-[11px] text-slate-600 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminAvatarsPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter / search / sort / pagination
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  // Modals
  const [showUpload, setShowUpload] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Avatar | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);
  const setTopbarRight = useSetTopbarRight();

  useEffect(() => {
    setTopbarRight(
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowCategories(true)}
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
        >
          <Tag className="h-3 w-3" /> Categories
        </button>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-bold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", boxShadow: "0 0 16px rgba(99,102,241,0.25)" }}
        >
          <Plus className="h-3.5 w-3.5" /> Upload Avatar
        </button>
      </div>
    );
    return () => setTopbarRight(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTopbarRight]);

  const load = useCallback(async () => {
    setLoading(true);
    const [a, c] = await Promise.all([
      fetch("/api/admin/avatars").then((r) => r.json()),
      fetch("/api/admin/avatar-categories").then((r) => r.json()),
    ]);
    setAvatars(a.avatars || []);
    setCategories(c.categories || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!sortOpen) return;
    function handler(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sortOpen]);

  async function handleDelete(avatar: Avatar) {
    setDeleting(true);
    await fetch(`/api/admin/avatars/${avatar.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    await load();
  }

  async function toggleActive(avatar: Avatar) {
    await fetch(`/api/admin/avatars/${avatar.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !avatar.active }),
    });
    await load();
  }

  // Derived counts
  const totalCount = avatars.length;
  const activeCount = avatars.filter((a) => a.active).length;
  const inactiveCount = avatars.filter((a) => !a.active).length;
  const womenCount = avatars.filter((a) => getGender(a) === "women").length;
  const menCount = avatars.filter((a) => getGender(a) === "men").length;

  // Filtered + searched + sorted
  const filtered = avatars
    .filter((a) => {
      if (genderFilter === "women") return getGender(a) === "women";
      if (genderFilter === "men") return getGender(a) === "men";
      return true;
    })
    .filter((a) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        (a.category?.name ?? "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      // newest/oldest: fall back to name order since we don't have createdAt in the type
      if (sort === "oldest") return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const sortLabels: Record<SortOption, string> = {
    newest: "Newest",
    oldest: "Oldest",
    "name-asc": "Name A-Z",
    "name-desc": "Name Z-A",
  };

  return (
    <>
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* ── Stat Cards ── */}
        <div className="flex gap-4 flex-wrap">
          <StatCard
            label="Total Avatars"
            count={totalCount}
            subtitle="All genders"
            countColor="#e2e8f0"
            iconBg="rgba(99,102,241,0.12)"
            icon={<Users className="h-5 w-5 text-indigo-400" />}
          />
          <StatCard
            label="Active Avatars"
            count={activeCount}
            subtitle="Currently visible"
            countColor="#10B981"
            iconBg="rgba(16,185,129,0.12)"
            icon={<CheckCircle className="h-5 w-5 text-emerald-400" />}
          />
          <StatCard
            label="Inactive Avatars"
            count={inactiveCount}
            subtitle="Hidden from library"
            countColor="#f87171"
            iconBg="rgba(248,113,113,0.12)"
            icon={<EyeOff className="h-5 w-5 text-red-400" />}
          />
        </div>

        {/* ── Filter Row ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Gender tabs */}
          <div className="flex items-center gap-1">
            {(
              [
                { key: "all", label: `All (${totalCount})` },
                { key: "women", label: `Women (${womenCount})` },
                { key: "men", label: `Men (${menCount})` },
              ] as { key: GenderFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setGenderFilter(tab.key);
                  setPage(1);
                }}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-[12px] font-semibold transition-all",
                  genderFilter === tab.key
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-300"
                )}
                style={
                  genderFilter === tab.key
                    ? {
                        background: "rgba(99,102,241,0.18)",
                        border: "1px solid rgba(99,102,241,0.35)",
                      }
                    : {
                        border: "1px solid transparent",
                      }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search avatars..."
                className="h-9 w-[180px] rounded-xl pl-8 pr-3 text-[12px] text-slate-300 placeholder:text-slate-600 focus:outline-none transition"
                style={{
                  background: "#0F1629",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
            </div>

            {/* Filter button */}
            <button
              className="inline-flex items-center gap-1.5 rounded-xl h-9 px-3 text-[12px] font-semibold text-slate-500 hover:text-slate-300 transition"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#0F1629",
              }}
            >
              <Filter className="h-3.5 w-3.5" />
              Filter
            </button>

            {/* Sort dropdown */}
            <div ref={sortRef} className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl h-9 px-3 text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition"
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "#0F1629",
                }}
              >
                Sort: {sortLabels[sort]}
                <ChevronDown className="h-3 w-3" />
              </button>
              {sortOpen && (
                <div
                  className="absolute right-0 top-10 z-20 min-w-[140px] rounded-xl overflow-hidden"
                  style={{
                    background: "#0F1629",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                  }}
                >
                  {(
                    Object.entries(sortLabels) as [SortOption, string][]
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSort(key);
                        setSortOpen(false);
                        setPage(1);
                      }}
                      className={cn(
                        "flex w-full items-center px-3 py-2.5 text-[12px] font-medium transition-colors",
                        sort === key
                          ? "text-indigo-400 bg-indigo-500/10"
                          : "text-slate-400 hover:bg-white/[0.04]"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View toggle */}
            <div
              className="flex rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex size-9 items-center justify-center transition-colors",
                  viewMode === "grid"
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "bg-[#0F1629] text-slate-600 hover:text-slate-400"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex size-9 items-center justify-center transition-colors",
                  viewMode === "list"
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "bg-[#0F1629] text-slate-600 hover:text-slate-400"
                )}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Grid / List ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 rounded-2xl gap-3"
            style={{ border: "1px dashed rgba(255,255,255,0.07)" }}
          >
            <Users className="h-8 w-8 text-slate-700" />
            <p className="text-sm text-slate-600">No avatars found</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {paginated.map((avatar) => (
              <AvatarCard
                key={avatar.id}
                avatar={avatar}
                onToggle={() => toggleActive(avatar)}
                onDelete={() => setDeleteTarget(avatar)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {paginated.map((avatar) => (
              <AvatarListRow
                key={avatar.id}
                avatar={avatar}
                onToggle={() => toggleActive(avatar)}
                onDelete={() => setDeleteTarget(avatar)}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
            <p className="text-[12px] text-slate-600">
              Showing{" "}
              <span className="text-slate-400 font-medium">
                {(currentPage - 1) * PAGE_SIZE + 1}
              </span>{" "}
              to{" "}
              <span className="text-slate-400 font-medium">
                {Math.min(currentPage * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="text-slate-400 font-medium">
                {filtered.length}
              </span>{" "}
              avatars
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg h-8 px-3 text-[12px] font-semibold text-slate-500 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1
                )
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                    acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="text-slate-700 px-1 text-[12px]">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={cn(
                        "rounded-lg size-8 text-[12px] font-semibold transition-all",
                        currentPage === p
                          ? "text-white"
                          : "text-slate-500 hover:text-slate-200"
                      )}
                      style={
                        currentPage === p
                          ? {
                              background: "rgba(99,102,241,0.18)",
                              border: "1px solid rgba(99,102,241,0.35)",
                            }
                          : { border: "1px solid rgba(255,255,255,0.08)" }
                      }
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg h-8 px-3 text-[12px] font-semibold text-slate-500 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showCategories && (
        <CategoriesModal
          categories={categories}
          onClose={() => setShowCategories(false)}
          onChanged={() => load()}
        />
      )}
      {showUpload && (
        <UploadModal
          categories={categories}
          onClose={() => setShowUpload(false)}
          onSaved={() => {
            setShowUpload(false);
            load();
          }}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Avatar"
          description={`Delete "${deleteTarget.name}"? This action cannot be undone.`}
          loading={deleting}
          onConfirm={() => handleDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

// ─── Avatar Card (Grid) ───────────────────────────────────────────────────────

function AvatarCard({
  avatar,
  onToggle,
  onDelete,
}: {
  avatar: Avatar;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const imgSrc = avatar.thumbnailUrl || avatar.imageUrl;

  return (
    <div
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-default transition-transform hover:scale-[1.02]"
      style={{
        border: "1px solid rgba(255,255,255,0.07)",
        background: "#0F1629",
      }}
    >
      {/* Image */}
      <Image
        src={imgSrc}
        alt={avatar.name}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
        className="object-cover object-top transition-[filter] duration-200 group-hover:brightness-90"
      />

      {/* Active/Inactive badge */}
      <div className="absolute top-2 left-2 z-10">
        {avatar.active ? (
          <div
            className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(16,185,129,0.3)",
            }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-semibold text-emerald-400">
              Active
            </span>
          </div>
        ) : (
          <div
            className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(248,113,113,0.3)",
            }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
            <span className="text-[10px] font-semibold text-red-400">
              Inactive
            </span>
          </div>
        )}
      </div>

      {/* Menu button */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <AvatarCardMenu avatar={avatar} onToggle={onToggle} onDelete={onDelete} />
      </div>

      {/* Bottom overlay */}
      <div
        className="absolute inset-x-0 bottom-0 px-3 py-3 z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
        }}
      >
        <p className="text-[12px] font-bold text-white truncate leading-tight">
          {avatar.name}
        </p>
        {avatar.category && (
          <p className="text-[10px] text-white/50 truncate mt-0.5">
            {avatar.category.name}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Avatar List Row ──────────────────────────────────────────────────────────

function AvatarListRow({
  avatar,
  onToggle,
  onDelete,
}: {
  avatar: Avatar;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const imgSrc = avatar.thumbnailUrl || avatar.imageUrl;

  return (
    <div
      className="flex items-center gap-4 rounded-2xl px-4 py-3 transition-colors hover:bg-white/[0.02]"
      style={{
        background: "#0F1629",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="relative h-12 w-9 shrink-0 rounded-xl overflow-hidden">
        <Image
          src={imgSrc}
          alt={avatar.name}
          fill
          sizes="40px"
          className="object-cover object-top"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-200 truncate">
          {avatar.name}
        </p>
        <p className="text-[11px] text-slate-600 truncate">
          {avatar.category?.name ?? "Uncategorized"}
        </p>
      </div>
      <div>
        {avatar.active ? (
          <span
            className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
            <span className="text-[11px] font-semibold text-emerald-400">Active</span>
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5"
            style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 inline-block" />
            <span className="text-[11px] font-semibold text-red-400">Inactive</span>
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onToggle}
          className="rounded-lg h-8 px-3 text-[11px] font-semibold text-slate-500 hover:text-slate-200 transition"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {avatar.active ? "Deactivate" : "Activate"}
        </button>
        <button
          onClick={onDelete}
          className="flex size-8 items-center justify-center rounded-lg text-slate-600 hover:text-red-400 transition-colors"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
