"use client";

import { useEffect, useState, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { Plus, Trash2, Loader2, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

type Model = {
  id: string;
  name: string;
  gender: "female" | "male";
  bodyType: string;
  ethnicity: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
};

const BODY_TYPES = ["slim", "athletic", "curvy", "plus", "average", "muscular"];

export default function AdminTryonModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "female" | "male">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Model | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/tryon-models").then((r) => r.json());
    setModels(r.models || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(m: Model) {
    await fetch(`/api/admin/tryon-models/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !m.isActive }),
    });
    load();
  }

  async function remove(m: Model) {
    if (!confirm(`Deactivate ${m.name}?`)) return;
    await fetch(`/api/admin/tryon-models/${m.id}`, { method: "DELETE" });
    load();
  }

  const filtered = models.filter((m) => filter === "all" || m.gender === filter);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Try-On Models</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage base models for the AI Try-On feature
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black hover:brightness-105 transition"
        >
          <Plus className="h-4 w-4" /> Add Model
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "female", "male"] as const).map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs capitalize transition",
              filter === g
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {g === "all" ? "All" : g === "female" ? "Female" : "Male"}{" "}
            <span className="opacity-50 ml-1">
              {g === "all" ? models.length : models.filter((m) => m.gender === g).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No models. Click <strong>Add Model</strong> to create one.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((m) => (
            <div
              key={m.id}
              className={cn(
                "group relative aspect-[3/4] rounded-2xl border bg-card overflow-hidden",
                m.isActive ? "border-border" : "border-destructive/40 opacity-60",
              )}
            >
              {m.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={m.imageUrl} alt={m.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-white/5 to-transparent text-3xl">
                  👤
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3">
                <p className="text-xs font-semibold text-white truncate">{m.name}</p>
                <p className="text-[10px] text-white/60 truncate">
                  {m.gender} · {m.bodyType} · {m.ethnicity}
                </p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => setEditing(m)}
                  className="flex size-7 items-center justify-center rounded-lg bg-black/60 backdrop-blur text-white/80 hover:bg-primary hover:text-black"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => toggleActive(m)}
                  className="flex h-7 px-2 items-center justify-center rounded-lg bg-black/60 backdrop-blur text-white/80 text-[10px] font-semibold hover:bg-primary hover:text-black"
                  title={m.isActive ? "Deactivate" : "Activate"}
                >
                  {m.isActive ? "Active" : "Inactive"}
                </button>
                <button
                  onClick={() => remove(m)}
                  className="flex size-7 items-center justify-center rounded-lg bg-black/60 backdrop-blur text-white/80 hover:bg-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showCreate || editing) && (
        <ModelModal
          model={editing}
          onClose={() => {
            setShowCreate(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowCreate(false);
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ModelModal({
  model,
  onClose,
  onSaved,
}: {
  model: Model | null;
  onClose: () => void;
  onSaved: () => void;
}) {
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
    const fd = new FormData();
    fd.append("image", file);
    fd.append("modelId", modelId);
    const res = await fetch("/api/admin/upload/tryon-model", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Upload failed");
    return data.url as string;
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!model) {
      // For new models, just preview locally — actual upload happens after save
      setImageUrl(URL.createObjectURL(f));
      (inputRef.current as HTMLInputElement & { _pendingFile?: File })._pendingFile = f;
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(f, model.id);
      setImageUrl(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    setSaving(true);
    try {
      let id = model?.id;
      if (!id) {
        const res = await fetch("/api/admin/tryon-models", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, gender, bodyType, ethnicity }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Create failed");
        id = data.model.id as string;

        const pendingFile = (inputRef.current as HTMLInputElement & { _pendingFile?: File } | null)?._pendingFile;
        if (pendingFile && id) {
          const url = await uploadImage(pendingFile, id);
          setImageUrl(url);
        }
      }

      await fetch(`/api/admin/tryon-models/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, gender, bodyType, ethnicity, sortOrder, isActive }),
      });
      onSaved();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-[#0c0c10]">
        <div className="sticky top-0 bg-[#0c0c10] flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-bold">{model ? "Edit Model" : "New Model"}</h3>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div onClick={() => inputRef.current?.click()} className="aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-border bg-white/[0.02] hover:border-primary/40 cursor-pointer overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              <Image src={imageUrl} alt="" width={300} height={400} className="h-full w-full object-cover" />
            ) : (
              <div className="text-center text-muted-foreground text-sm px-4">
                {uploading ? "Uploading…" : "Click to upload model image (JPG/PNG/WEBP up to 20MB)"}
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Gender</label>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/[0.04]">
                {(["female", "male"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={cn(
                      "rounded-lg py-2 text-xs font-medium capitalize",
                      gender === g ? "bg-background text-foreground" : "text-white/45",
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Body Type</label>
              <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm capitalize">
                {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Ethnicity</label>
            <input value={ethnicity} onChange={(e) => setEthnicity(e.target.value)} placeholder="e.g. latina, asian, white" className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sort Order</label>
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <button type="button" onClick={() => setIsActive(!isActive)} className={cn("w-full rounded-xl border px-3 py-2 text-sm font-semibold", isActive ? "border-primary/40 bg-primary/10 text-primary" : "border-destructive/30 bg-destructive/10 text-destructive")}>
                {isActive ? "Active" : "Inactive"}
              </button>
            </div>
          </div>

          <button onClick={submit} disabled={saving || !name || !ethnicity} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-black disabled:opacity-50 hover:brightness-105 transition">
            {saving ? "Saving…" : "Save Model"}
          </button>
        </div>
      </div>
    </div>
  );
}
