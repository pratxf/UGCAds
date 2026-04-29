"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/ui/logo";

interface LoginCardProps {
  mode?: "login" | "signup";
  onSubmit?: (data: { email: string; password: string; name?: string }) => void;
  onGoogle?: () => void;
  loading?: boolean;
  error?: string | null;
  message?: string | null;
}

export default function LoginCardSection({ mode = "login", onSubmit, onGoogle, loading, error, message }: LoginCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const setSize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    setSize();

    type P = { x: number; y: number; v: number; o: number };
    let ps: P[] = [];
    let raf = 0;

    const make = (): P => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, v: Math.random() * 0.25 + 0.05, o: Math.random() * 0.35 + 0.15 });
    const init = () => { ps = []; const count = Math.floor((canvas.width * canvas.height) / 12000); for (let i = 0; i < count; i++) ps.push(make()); };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ps.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) { p.x = Math.random() * canvas.width; p.y = canvas.height + Math.random() * 40; }
        ctx.fillStyle = `rgba(57,255,20,${p.o * 0.3})`;
        ctx.fillRect(p.x, p.y, 0.7, 2.2);
      });
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => { setSize(); init(); };
    window.addEventListener("resize", onResize);
    init();
    raf = requestAnimationFrame(draw);
    return () => { window.removeEventListener("resize", onResize); cancelAnimationFrame(raf); };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ email, password, ...(mode === "signup" ? { name } : {}) });
  };

  const isLogin = mode === "login";

  return (
    <section className="fixed inset-0 bg-background text-foreground overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(60%_40%_at_50%_40%,rgba(57,255,20,0.06),transparent_70%)]" />
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(40%_40%_at_70%_60%,rgba(167,139,250,0.04),transparent_70%)]" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-40 mix-blend-screen pointer-events-none" />

      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative h-full w-full flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="mb-8 animate-[fadeUp_0.6s_ease-out]">
          <Logo href="/" size="lg" />
        </div>

        {/* Card */}
        <div className="w-full max-w-[400px] rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-7 space-y-6 animate-[fadeUp_0.7s_ease-out_0.1s_both]">
          <div className="text-center">
            <h2 className="text-xl font-bold">{isLogin ? "Welcome back" : "Create your account"}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin ? "Sign in to continue" : "Start creating professional ads with AI"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="text-[11px] font-medium text-muted-foreground">Full Name</label>
                <input id="name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-xl border border-border bg-background px-3.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all" />
              </div>
            )}

            <div>
              <label htmlFor="email" className="text-[11px] font-medium text-muted-foreground">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-border bg-background pl-10 pr-3.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-[11px] font-medium text-muted-foreground">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-border bg-background pl-10 pr-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all" />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer">
                  <input type="checkbox" className="rounded border-border h-3.5 w-3.5 accent-primary" />
                  Remember me
                </label>
                <a href="#" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">Forgot password?</a>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>
            )}
            {message && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">{message}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? "Loading..." : isLogin ? "Continue" : "Create Account"}
            </button>

            <div className="relative py-1">
              <div className="h-px w-full bg-border" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-[2px] bg-card/80 px-3 text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
            </div>

            <button type="button" onClick={onGoogle} disabled={loading}
              className="w-full h-10 rounded-xl border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <p className="text-center text-[11px] text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <Link href={isLogin ? "/signup" : "/login"} className="ml-1 text-primary hover:underline font-medium">
              {isLogin ? "Create one" : "Sign in"}
            </Link>
          </p>

          {!isLogin && (
            <p className="text-center text-[10px] text-muted-foreground/60">
              3 day refund policy · Cancel anytime
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </section>
  );
}
