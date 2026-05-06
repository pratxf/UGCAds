"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faCamera,
  faCheck,
  faBolt,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  email: string;
  avatar: string | null;
  credits: number;
  provider: string;
  memberSince: string | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function formatDate(d: string | null) {
  if (!d) return "";
  const date = new Date(d);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function ProfileClient({ name, email, avatar, credits, provider, memberSince }: Props) {
  const isGoogle = provider === "google";
  const [displayName, setDisplayName] = useState(name);
  const [saved, setSaved] = useState(false);

  const initial = (name || email).charAt(0).toUpperCase();
  const displayCredits = credits % 10 === 0 ? String(credits / 10) : (credits / 10).toFixed(1);

  function onSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fadeUp}
      className="mx-auto w-full max-w-3xl space-y-5"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Manage your account information.</p>
      </div>

      {/* Identity card */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="relative">
            {avatar ? (
              <span className="block h-20 w-20 overflow-hidden rounded-2xl border border-[#E5E7EB]">
                <Image src={avatar} alt={name || email} width={80} height={80} className="h-full w-full object-cover" />
              </span>
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-2xl font-bold text-white">
                {initial}
              </span>
            )}
            {!isGoogle && (
              <button
                type="button"
                className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white ring-2 ring-background transition hover:brightness-105"
                aria-label="Change avatar"
              >
                <FontAwesomeIcon icon={faCamera} style={{ fontSize: 11 }} />
              </button>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold text-foreground">{name || "No name set"}</p>
            <p className="truncate text-sm text-[#6B7280]">{email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                <FontAwesomeIcon icon={faBolt} style={{ fontSize: 10 }} />
                {displayCredits} credits
              </span>
              {isGoogle ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F3F4F6] px-2.5 py-0.5 text-[11px] font-semibold text-[#374151]">
                  <FontAwesomeIcon icon={faGoogle} style={{ fontSize: 10 }} />
                  Google
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F3F4F6] px-2.5 py-0.5 text-[11px] font-semibold text-[#374151]">
                  <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 10 }} />
                  Email
                </span>
              )}
              {memberSince && (
                <span className="text-[11px] text-[#9CA3AF]">Member since {formatDate(memberSince)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account details */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-semibold text-foreground">Account details</h2>

        <Field
          label="Display name"
          icon={faUser}
          locked={isGoogle}
          hint={isGoogle ? "Managed by Google" : undefined}
        >
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isGoogle}
            className={cn(
              "w-full rounded-xl border px-3 py-2.5 text-sm transition",
              isGoogle
                ? "bg-[#F3F4F6] border-[#E5E7EB] text-[#6B7280] cursor-not-allowed"
                : "bg-white border-[#E5E7EB] text-foreground placeholder:text-[#9CA3AF] focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            )}
            placeholder="Your name"
          />
        </Field>

        <Field
          label="Email"
          icon={faEnvelope}
          locked
          hint={isGoogle ? "Linked Google account" : "Verified email"}
        >
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] px-3 py-2.5 text-sm text-[#6B7280] cursor-not-allowed"
          />
        </Field>

        {!isGoogle && (
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onSave}
              className={cn(
                "rounded-xl px-5 py-2.5 text-sm font-bold transition flex items-center gap-2",
                saved
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-primary text-white ring-1 ring-inset ring-black/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_2px_rgba(0,0,0,0.12)] hover:brightness-105 active:scale-[0.99]"
              )}
            >
              {saved ? (
                <>
                  <FontAwesomeIcon icon={faCheck} style={{ fontSize: 12 }} />
                  Saved
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Connected accounts */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Connected accounts</h2>
        <p className="mt-1 text-xs text-[#6B7280]">Manage how you sign in to your account.</p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#F3F4F6] border border-[#E5E7EB]">
              <FontAwesomeIcon icon={faGoogle} className="text-[#374151]" style={{ fontSize: 14 }} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Google</p>
              <p className="text-[11px] text-[#6B7280]">
                {isGoogle ? `Connected as ${email}` : "Not connected"}
              </p>
            </div>
            {isGoogle ? (
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                Active
              </span>
            ) : (
              <button
                type="button"
                className="rounded-lg border border-[#D1D5DB] bg-[#F3F4F6] hover:bg-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#374151] hover:text-[#111111] transition"
              >
                Connect
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#F3F4F6] border border-[#E5E7EB]">
              <FontAwesomeIcon icon={faEnvelope} className="text-[#374151]" style={{ fontSize: 14 }} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Email and password</p>
              <p className="text-[11px] text-[#6B7280]">
                {!isGoogle ? `Active for ${email}` : "Set a password to enable email login"}
              </p>
            </div>
            {!isGoogle ? (
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                Active
              </span>
            ) : (
              <button
                type="button"
                className="rounded-lg border border-[#D1D5DB] bg-[#F3F4F6] hover:bg-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#374151] hover:text-[#111111] transition"
              >
                Set password
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Sign out of all devices</h2>
        <p className="mt-1 text-xs text-[#6B7280]">This will end your active sessions across devices.</p>
        <button
          type="button"
          className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/15"
        >
          Sign out everywhere
        </button>
      </div>
    </motion.div>
  );
}

function Field({
  label,
  icon,
  children,
  locked,
  hint,
}: {
  label: string;
  icon: typeof faUser;
  children: React.ReactNode;
  locked?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#9CA3AF]">
          <FontAwesomeIcon icon={icon} style={{ fontSize: 10 }} />
          {label}
        </label>
        {locked && hint && (
          <span className="inline-flex items-center gap-1 text-[10px] text-[#9CA3AF]">
            <FontAwesomeIcon icon={faLock} style={{ fontSize: 9 }} />
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
