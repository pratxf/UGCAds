"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faBolt,
  faEnvelope,
  faLock,
  faChevronRight,
  faCheck,
  faEye,
  faEyeSlash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  email: string;
  avatar: string | null;
  credits: number;
  provider: string;
  memberSince: string | null;
}

function formatMemberSince(d: string | null) {
  if (!d) return "";
  const date = new Date(d);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `Member since ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function fmtCredits(c: number) {
  return c % 10 === 0 ? String(c / 10) : (c / 10).toFixed(1);
}

export default function ProfileClient({ name, email, avatar, credits, provider, memberSince }: Props) {
  const isGoogle = provider === "google";
  const initial = (name || email).charAt(0).toUpperCase();

  // Profile state
  const [displayName, setDisplayName] = useState(name);
  const [avatarUrl, setAvatarUrl] = useState(avatar);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Change password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwState, setPwState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pwError, setPwError] = useState("");

  // Google connect
  const [connectingGoogle, setConnectingGoogle] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/upload/avatar", { method: "POST", body: form });
      if (!res.ok) {
        const { error } = await res.json();
        alert(error || "Upload failed");
        return;
      }
      const { url } = await res.json();
      setAvatarUrl(url);
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: url }),
      });
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (saveState === "saving") return;
    setSaveState("saving");
    setSaveError("");
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        setSaveError(error || "Save failed");
        setSaveState("error");
        return;
      }
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveError("Network error");
      setSaveState("error");
    }
  }

  async function handleChangePassword() {
    if (pwState === "saving") return;
    setPwError("");
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }
    setPwState("saving");
    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        setPwError(error || "Failed to change password");
        setPwState("error");
        return;
      }
      setPwState("saved");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPwState("idle");
        setShowPasswordForm(false);
      }, 2000);
    } catch {
      setPwError("Network error");
      setPwState("error");
    }
  }

  async function handleConnectGoogle() {
    if (connectingGoogle) return;
    setConnectingGoogle(true);
    const supabase = createClient();
    const { error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/profile`,
      },
    });
    if (error) {
      alert(error.message);
      setConnectingGoogle(false);
    }
    // On success Supabase redirects to Google — no cleanup needed here
  }

  async function handleSignOutEverywhere() {
    await fetch("/auth/signout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 pb-10">

      {/* Page header */}
      <div>
        <h1 className="text-[26px] font-bold text-[#111111]">Profile</h1>
        <p className="text-[13px] text-[#6B7280] mt-0.5">Manage your account information and security.</p>
      </div>

      {/* Identity card */}
      <div className="rounded-2xl p-6"
        style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            {avatarUrl ? (
              <span className="block h-20 w-20 overflow-hidden rounded-full">
                <Image src={avatarUrl} alt={name || email} width={80} height={80}
                  className="h-full w-full object-cover" />
              </span>
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
                style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)" }}>
                {initial}
              </span>
            )}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full text-white transition hover:brightness-110 disabled:opacity-60"
              style={{ background: "#2563EB", border: "2.5px solid #fff" }}
              aria-label="Change avatar"
            >
              <FontAwesomeIcon icon={faCamera} style={{ fontSize: 11 }} />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-[20px] font-bold text-[#111111] truncate">{name || "No name set"}</p>
            <p className="text-[13px] text-[#6B7280] truncate">{email}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                style={{ background: "rgba(37,99,235,0.08)", color: "#2563EB" }}>
                <FontAwesomeIcon icon={faBolt} style={{ fontSize: 10 }} />
                {fmtCredits(credits)} credits
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                style={{ background: "rgba(16,185,129,0.08)", color: "#059669" }}>
                <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 10 }} />
                Email verified
              </span>
              {memberSince && (
                <span className="text-[12px] text-[#9CA3AF]">{formatMemberSince(memberSince)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account details */}
      <div className="rounded-2xl p-6 space-y-5"
        style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div>
          <h2 className="text-[16px] font-bold text-[#111111]">Account details</h2>
        </div>

        {/* Display name */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
            <FontAwesomeIcon icon={faCamera} className="opacity-0" style={{ fontSize: 11 }} />
            Display name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-[14px] text-[#111111] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 transition"
            placeholder="Your name"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
            <FontAwesomeIcon icon={faCamera} className="opacity-0" style={{ fontSize: 11 }} />
            Email address
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 pr-24 text-[14px] text-[#6B7280] cursor-not-allowed"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[12px] font-semibold"
              style={{ color: "#059669" }}>
              <FontAwesomeIcon icon={faCheck} style={{ fontSize: 11 }} />
              Verified
            </span>
          </div>
        </div>

        {saveError && (
          <p className="text-[12px] text-red-500">{saveError}</p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === "saving"}
          className={cn(
            "rounded-2xl px-6 py-2.5 text-[13px] font-bold text-white transition",
            saveState === "saved" ? "opacity-80" : "hover:brightness-110",
            saveState === "saving" && "opacity-70 cursor-wait"
          )}
          style={{ background: "#2563EB" }}
        >
          {saveState === "saved" ? (
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCheck} style={{ fontSize: 12 }} />
              Saved
            </span>
          ) : saveState === "saving" ? "Saving..." : "Save changes"}
        </button>
      </div>

      {/* Connected accounts */}
      <div className="rounded-2xl p-6 space-y-4"
        style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div>
          <h2 className="text-[16px] font-bold text-[#111111]">Connected accounts</h2>
          <p className="text-[12px] text-[#6B7280] mt-0.5">Manage how you sign in to your account.</p>
        </div>

        {/* Google */}
        <div className="flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border border-[#E5E7EB]">
            <FontAwesomeIcon icon={faGoogle} style={{ fontSize: 15, color: "#374151" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#111111]">Google</p>
            <p className="text-[11px] text-[#6B7280]">
              {isGoogle ? `Connected as ${email}` : "Not connected"}
            </p>
          </div>
          {isGoogle ? (
            <span className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[12px] font-semibold text-[#6B7280]">
              Active
            </span>
          ) : (
            <button
              type="button"
              onClick={handleConnectGoogle}
              disabled={connectingGoogle}
              className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[12px] font-semibold text-[#374151] transition hover:bg-[#F3F4F6] disabled:opacity-60"
            >
              {connectingGoogle ? "Connecting..." : "Connect"}
            </button>
          )}
        </div>

        {/* Email and password */}
        <div className="flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border border-[#E5E7EB]">
            <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 14, color: "#374151" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#111111]">Email and password</p>
            <p className="text-[11px] text-[#6B7280]">
              {!isGoogle ? `Active for ${email}` : "Set a password to enable email login"}
            </p>
          </div>
          <span className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[12px] font-semibold text-[#6B7280]">
            Active
          </span>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-2xl p-6 space-y-4"
        style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div>
          <h2 className="text-[16px] font-bold text-[#111111]">Security</h2>
          <p className="text-[12px] text-[#6B7280] mt-0.5">Keep your account secure.</p>
        </div>

        {/* Password row */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border border-[#E5E7EB]">
              <FontAwesomeIcon icon={faLock} style={{ fontSize: 14, color: "#374151" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#111111]">Password</p>
              <p className="text-[11px] text-[#6B7280]">Update your account password</p>
            </div>
            <button
              type="button"
              onClick={() => { setShowPasswordForm((v) => !v); setPwState("idle"); setPwError(""); setNewPassword(""); setConfirmPassword(""); }}
              className="flex items-center gap-1 text-[12px] font-semibold text-[#374151] transition hover:text-[#111111]"
            >
              {showPasswordForm ? (
                <>
                  Cancel
                  <FontAwesomeIcon icon={faXmark} style={{ fontSize: 11, marginLeft: 2 }} />
                </>
              ) : (
                <>
                  Change password
                  <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 11, marginLeft: 2 }} />
                </>
              )}
            </button>
          </div>

          {/* Inline password form */}
          {showPasswordForm && (
            <div className="border-t border-[#E5E7EB] px-4 pb-4 pt-3 space-y-3">
              {/* New password */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">New password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 pr-10 text-[13px] text-[#111111] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 transition"
                  />
                  <button type="button" onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
                    <FontAwesomeIcon icon={showNew ? faEyeSlash : faEye} style={{ fontSize: 13 }} />
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 pr-10 text-[13px] text-[#111111] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 transition"
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
                    <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} style={{ fontSize: 13 }} />
                  </button>
                </div>
              </div>

              {pwError && <p className="text-[12px] text-red-500">{pwError}</p>}

              <button
                type="button"
                onClick={handleChangePassword}
                disabled={pwState === "saving" || !newPassword || !confirmPassword}
                className={cn(
                  "rounded-xl px-5 py-2.5 text-[13px] font-bold text-white transition",
                  "hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                style={{ background: "#2563EB" }}
              >
                {pwState === "saving" ? "Updating..." : pwState === "saved" ? (
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} style={{ fontSize: 12 }} />
                    Password updated
                  </span>
                ) : "Update password"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sign out of all devices */}
      <div className="rounded-2xl p-5 flex items-center justify-between gap-4"
        style={{ background: "#FFF5F5", border: "1px solid rgba(239,68,68,0.2)" }}>
        <div>
          <p className="text-[14px] font-bold text-[#DC2626]">Sign out of all devices</p>
          <p className="text-[12px] text-[#EF4444]/70 mt-0.5">This will end your active sessions across all devices.</p>
        </div>
        <button
          type="button"
          onClick={handleSignOutEverywhere}
          className="shrink-0 rounded-full border border-[#EF4444]/40 px-4 py-2 text-[13px] font-semibold text-[#DC2626] transition hover:bg-[#EF4444]/10"
        >
          Sign out everywhere
        </button>
      </div>

    </div>
  );
}
