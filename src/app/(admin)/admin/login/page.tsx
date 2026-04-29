"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Invalid password");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-2xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Admin</h1>
            <p className="text-[11px] text-muted-foreground">UGCAds control panel</p>
          </div>
        </div>

        <label className="block text-xs text-muted-foreground mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/40"
        />

        {error && (
          <p className="mt-3 text-xs text-destructive">{error}</p>
        )}

        <button
          type="submit"
          disabled={!password || loading}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-black hover:brightness-105 disabled:opacity-50 transition"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign In
        </button>
      </form>
    </div>
  );
}
