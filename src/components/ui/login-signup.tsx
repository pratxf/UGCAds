"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ email, password, ...(mode === "signup" ? { name } : {}) });
  };

  const isLogin = mode === "login";

  return (
    <section className="fixed inset-0 bg-[#F7F7F5] overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-blue-100/70 blur-[100px]" />
        <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-cyan-100/60 blur-[80px]" />
      </div>

      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(circle, #CBD5E1 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative h-full w-full flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="mb-8 animate-[fadeUp_0.5s_ease-out]">
          <Logo href="/" size="lg" />
        </div>

        {/* Card */}
        <div className="w-full max-w-[400px] rounded-2xl border border-[#E5E7EB] bg-white shadow-xl shadow-blue-900/5 p-7 space-y-5 animate-[fadeUp_0.6s_ease-out_0.08s_both]">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#111111]">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-[#6B7280] mt-1">
              {isLogin ? "Sign in to continue to ugcads" : "Start creating professional ads with AI"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                  <input
                    id="name" type="text" placeholder="Your name"
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] pl-10 pr-3.5 text-sm text-[#111111] placeholder:text-[#9CA3AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/20 focus-visible:border-[#2563EB]/50 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
                Email
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                <input
                  id="email" type="email" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] pl-10 pr-3.5 text-sm text-[#111111] placeholder:text-[#9CA3AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/20 focus-visible:border-[#2563EB]/50 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
                  Password
                </label>
                {isLogin && (
                  <a href="#" className="text-[11px] text-[#2563EB] hover:underline">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                <input
                  id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] pl-10 pr-10 text-sm text-[#111111] placeholder:text-[#9CA3AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/20 focus-visible:border-[#2563EB]/50 transition-all"
                />
                <button
                  type="button" aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-[#2563EB]">
                {message}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full h-10 rounded-xl bg-[#2563EB] text-white text-sm font-semibold shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
            </button>

            <div className="relative py-1 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#E5E7EB]" />
              <span className="text-[10px] uppercase tracking-widest text-[#9CA3AF]">or</span>
              <div className="flex-1 h-px bg-[#E5E7EB]" />
            </div>

            <button
              type="button" onClick={onGoogle} disabled={loading}
              className="w-full h-10 rounded-xl border border-[#E5E7EB] bg-white text-[#111111] text-sm font-medium hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <p className="text-center text-[11px] text-[#9CA3AF]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <Link
              href={isLogin ? "/signup" : "/login"}
              className="ml-1 text-[#2563EB] hover:underline font-medium"
            >
              {isLogin ? "Create one" : "Sign in"}
            </Link>
          </p>

          {!isLogin && (
            <p className="text-center text-[10px] text-[#9CA3AF]">
              3 day refund policy · Cancel anytime
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
