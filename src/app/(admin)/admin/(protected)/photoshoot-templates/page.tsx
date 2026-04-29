"use client";

import { useEffect, useState, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { Plus, Trash2, Loader2, X, Tag, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string; _count?: { templates: number } };
type Template = {
  id: string;
  name: string;
  imageUrl: string;
  prompt: string;
  categoryId: string | null;
  category: Category | null;
  active: boolean;
};

export default function AdminPhotoshootTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showUpload, setShowUpload] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);

  async function load() {
    setLoading(true);
    const [t, c] = await Promise.all([
      fetch("/api/admin/photoshoot-templates").then((r) => r.json()),
      fetch("/api/admin/photoshoot-categories").then((r) => r.json()),
    ]);
    setTemplates(t.templates || []);
    setCategories(c.categories || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/admin/photoshoot-templates/${id}`, { method: "DELETE" });
    await load();
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Delete this category? Templates in it will be uncategorized.")) return;
    await fetch(`/api/admin/photoshoot-categories/${id}`, { method: "DELETE" });
    await load();
  }

  const filtered = templates.filter((t) => filter === "all" || t.categoryId === filter);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Photoshoot Templates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Each template has a hidden prompt used at generation time
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategory(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-white/5 transition"
          >
            <Tag className="h-4 w-4" />
            Categories
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black hover:brightness-105 transition"
          >
            <Plus className="h-4 w-4" />
            New Template
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <CategoryChip active={filter === "all"} onClick={() => setFilter("all")}>
          All <span className="opacity-50 ml-1">{templates.length}</span>
        </CategoryChip>
        {categories.map((c) => (
          <CategoryChip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
            {c.name}{" "}
            <span className="opacity-50 ml-1">
              {templates.filter((t) => t.categoryId === c.id).length}
            </span>
          </CategoryChip>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No templates yet. Click <strong>New Template</strong> to add one.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="group relative aspect-square rounded-2xl border border-border bg-card overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.imageUrl} alt={t.name} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3">
                <p className="text-xs font-semibold text-white truncate">{t.name}</p>
                {t.category && (
                  <p className="text-[10px] text-white/60 truncate">{t.category.name}</p>
                )}
              </div>
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => setEditing(t)}
                  className="flex size-7 items-center justify-center rounded-lg bg-black/60 backdrop-blur text-white/80 hover:bg-primary hover:text-black"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="flex size-7 items-center justify-center rounded-lg bg-black/60 backdrop-blur text-white/80 hover:bg-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
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
          onSaved={() => {
            setShowUpload(false);
            load();
          }}
        />
      )}

      {editing && (
        <EditModal
          template={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
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
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
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
  const [prompt, setPrompt] = useState("");
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
    if (!name || !prompt || !file) return;
    setSaving(true);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("prompt", prompt);
    fd.append("image", file);
    if (categoryId) fd.append("categoryId", categoryId);
    const res = await fetch("/api/admin/photoshoot-templates", { method: "POST", body: fd });
    setSaving(false);
    if (res.ok) onSaved();
    else alert("Upload failed");
  }

  return (
    <Modal onClose={onClose} title="New Photoshoot Template">
      <div className="space-y-4">
        <div
          onClick={() => inputRef.current?.click()}
          className="aspect-square w-full rounded-2xl border-2 border-dashed border-border bg-white/[0.02] hover:border-primary/40 cursor-pointer overflow-hidden flex items-center justify-center"
        >
          {preview ? (
            <Image src={preview} alt="" width={400} height={400} className="h-full w-full object-cover" />
          ) : (
            <div className="text-center text-muted-foreground text-sm">Click to upload preview image</div>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={pickFile} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Name (shown to user)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Marble Surface"
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Prompt (server-only, never shown to user)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            placeholder="Detailed prompt used by the AI when generating this scene..."
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40 resize-y"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={submit}
          disabled={!name || !prompt || !file || saving}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-black disabled:opacity-50 hover:brightness-105 transition"
        >
          {saving ? "Saving..." : "Save Template"}
        </button>
      </div>
    </Modal>
  );
}

function EditModal({
  template,
  categories,
  onClose,
  onSaved,
}: {
  template: Template;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(template.name);
  const [prompt, setPrompt] = useState(template.prompt);
  const [categoryId, setCategoryId] = useState<string>(template.categoryId || "");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    const res = await fetch(`/api/admin/photoshoot-templates/${template.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, prompt, categoryId: categoryId || null }),
    });
    setSaving(false);
    if (res.ok) onSaved();
    else alert("Save failed");
  }

  return (
    <Modal onClose={onClose} title="Edit Template">
      <div className="space-y-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={template.imageUrl}
          alt={template.name}
          className="aspect-square w-full rounded-2xl object-cover border border-border"
        />
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40 resize-y"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={submit}
          disabled={saving}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-black disabled:opacity-50 hover:brightness-105 transition"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </Modal>
  );
}

function CategoryModal({
  categories,
  onClose,
  onChange,
  onDelete,
}: {
  categories: Category[];
  onClose: () => void;
  onChange: () => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/photoshoot-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaving(false);
    if (res.ok) {
      setName("");
      onChange();
    } else alert("Failed to create");
  }

  return (
    <Modal onClose={onClose} title="Template Categories">
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New category name"
            className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
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
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {c._count?.templates ?? 0} templates
                  </p>
                </div>
                <button
                  onClick={() => onDelete(c.id)}
                  className="text-muted-foreground hover:text-destructive transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-border bg-[#0c0c10] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-[#0c0c10]">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
