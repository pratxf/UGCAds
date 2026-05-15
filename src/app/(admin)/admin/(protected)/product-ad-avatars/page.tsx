"use client";

import { useEffect, useState, useRef, type ChangeEvent } from "react";
import { useSetTopbarRight } from "@/app/(admin)/_components/AdminTopbarContext";
import Image from "next/image";
import { Plus, Trash2, Loader2, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

type Avatar = {
  id: string;
  name: string;
  gender: "female" | "male";
  nationality: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
};

export default function AdminProductAdAvatarsPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "female" | "male">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Avatar | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/product-ad-avatars").then((r) => r.json());
    setAvatars(r.avatars || []);
    setLoading(false);
  }

  const setTopbarRight = useSetTopbarRight();
  useEffect(() => {
    setTopbarRight(
      <button
        onClick={() => setShowCreate(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black hover:brightness-105 transition"
      >
        <Plus className="h-4 w-4" /> Add Avatar
      </button>
    );
    return () => setTopbarRight(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTopbarRight]);

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(a: Avatar) {
    await fetch(`/api/admin/product-ad-avatars/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !a.isActive }),
    });
    load();
  }

  async function remove(a: Avatar) {
    if (!confirm(`Delete ${a.name}?`)) return;
    await fetch(`/api/admin/product-ad-avatars/${a.id}`, { method: "DELETE" });
    load();
  }

  const filtered = avatars.filter((a) => filter === "all" || a.gender === filter);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
              {g === "all" ? avatars.length : avatars.filter((a) => a.gender === g).length}
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
          No avatars yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((a) => (
            <div
              key={a.id}
              className={cn(
                "group relative aspect-[3/4] rounded-2xl border bg-card overflow-hidden",
                a.isActive ? "border-border" : "border-destructive/40 opacity-60",
              )}
            >
              {a.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={a.imageUrl} alt={a.name} className="h-full w-full object-cover object-top" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-white/5 to-transparent text-3xl">
                  👤
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3">
                <p className="text-xs font-semibold text-white truncate">{a.name}</p>
                <p className="text-[10px] text-white/60 truncate">
                  {a.gender} · {a.nationality}
                </p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => setEditing(a)}
                  className="flex size-7 items-center justify-center rounded-lg bg-black/60 backdrop-blur text-white/80 hover:bg-primary hover:text-black"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => toggleActive(a)}
                  className="flex h-7 px-2 items-center justify-center rounded-lg bg-black/60 backdrop-blur text-white/80 text-[10px] font-semibold hover:bg-primary hover:text-black"
                >
                  {a.isActive ? "Active" : "Inactive"}
                </button>
                <button
                  onClick={() => remove(a)}
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
        <Modal
          avatar={editing}
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

function Modal({
  avatar,
  onClose,
  onSaved,
}: {
  avatar: Avatar | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(avatar?.name ?? "");
  const [gender, setGender] = useState<"female" | "male">(avatar?.gender ?? "female");
  const [nationality, setNationality] = useState(avatar?.nationality ?? "american");
  const [imageUrl, setImageUrl] = useState(avatar?.imageUrl ?? "");
  const [sortOrder, setSortOrder] = useState(avatar?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(avatar?.isActive ?? true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadImage(file: File, id: string) {
    const fd = new FormData();
    fd.append("image", file);
    fd.append("id", id);
    const res = await fetch("/api/admin/upload/product-ad-avatar", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Upload failed");
    return data.url as string;
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!avatar) {
      setImageUrl(URL.createObjectURL(f));
      (inputRef.current as HTMLInputElement & { _pendingFile?: File })._pendingFile = f;
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(f, avatar.id);
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
      let id = avatar?.id;
      if (!id) {
        const res = await fetch("/api/admin/product-ad-avatars", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, gender, nationality }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Create failed");
        id = data.avatar.id as string;
        const pending = (inputRef.current as HTMLInputElement & { _pendingFile?: File } | null)?._pendingFile;
        if (pending && id) await uploadImage(pending, id);
      }
      await fetch(`/api/admin/product-ad-avatars/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, gender, nationality, sortOrder, isActive }),
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
          <h3 className="text-base font-bold">{avatar ? "Edit Avatar" : "New Avatar"}</h3>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div onClick={() => inputRef.current?.click()} className="aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-border bg-white/[0.02] hover:border-primary/40 cursor-pointer overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              <Image src={imageUrl} alt="" width={300} height={400} className="h-full w-full object-cover object-top" />
            ) : (
              <div className="text-center text-muted-foreground text-sm px-4">
                {uploading ? "Uploading…" : "Click to upload (JPG/PNG/WEBP up to 20MB)"}
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
                  <button key={g} type="button" onClick={() => setGender(g)} className={cn("rounded-lg py-2 text-xs font-medium capitalize", gender === g ? "bg-background text-foreground" : "text-white/45")}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nationality</label>
              <select value={nationality} onChange={(e) => setNationality(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm">
                <option value="american">American</option>
                <option value="british">British</option>
              </select>
            </div>
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
          <button onClick={submit} disabled={saving || !name} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-black disabled:opacity-50 hover:brightness-105 transition">
            {saving ? "Saving…" : "Save Avatar"}
          </button>
        </div>
      </div>
    </div>
  );
}
