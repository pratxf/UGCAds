"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faPlus,
  faDownload,
  faChevronRight,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  description: string;
  date: string;
  credits: number;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp: string;
}

interface Props {
  email: string;
  planName: string | null;
  monthlyCredits: number;
  renewal: string | null;
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function fmt(units: number) {
  return units % 10 === 0 ? String(units / 10) : (units / 10).toFixed(1);
}

function planLabel(p: string | null) {
  if (!p) return "Free Tier";
  return p.charAt(0) + p.slice(1).toLowerCase();
}

export default function BillingClient({
  email,
  planName,
  monthlyCredits,
  renewal,
  paymentMethods,
  invoices,
}: Props) {
  const isPaid = !!planName;
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  function onCancel() {
    setCancelled(true);
    setConfirmCancel(false);
    // TODO: wire to /api/billing/cancel
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fadeUp}
      className="mx-auto w-full max-w-3xl space-y-5"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Manage your plan, payment methods, and invoices.</p>
      </div>

      {/* Plan summary */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                isPaid
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"
              )}
            >
              {isPaid ? "Active subscription" : "No active plan"}
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
              {planLabel(planName)} plan
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              {isPaid && renewal
                ? `Renews on ${renewal}`
                : "Pick a plan to unlock more credits and features."}
            </p>
            {monthlyCredits > 0 && (
              <p className="mt-2 text-xs text-[#6B7280]">
                {fmt(monthlyCredits)} credits per cycle
              </p>
            )}
          </div>
          <Link
            href="/credits?upgrade=true"
            className="rounded-xl bg-primary text-white ring-1 ring-inset ring-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.12)] px-4 py-2.5 text-sm font-bold transition hover:brightness-105 active:scale-[0.99]"
          >
            {isPaid ? "Change plan" : "Upgrade"}
          </Link>
        </div>
      </div>

      {/* Payment methods */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Payment methods</h2>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-[#F3F4F6] hover:text-foreground px-3 py-1.5 text-xs font-semibold text-[#374151] transition"
          >
            <FontAwesomeIcon icon={faPlus} style={{ fontSize: 10 }} />
            Add card
          </button>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white p-6 text-center">
            <FontAwesomeIcon icon={faCreditCard} className="text-[#9CA3AF]" style={{ fontSize: 22 }} />
            <p className="mt-3 text-sm font-medium text-foreground">No payment method on file</p>
            <p className="mt-1 text-xs text-[#6B7280]">Add a card to top up credits or upgrade your plan.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {paymentMethods.map((pm) => (
              <li
                key={pm.id}
                className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3"
              >
                <span className="flex h-9 w-12 items-center justify-center rounded-md border border-[#E5E7EB] bg-[#F9FAFB] text-[10px] font-bold uppercase tracking-widest text-[#374151]">
                  {pm.brand}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">•••• {pm.last4}</p>
                  <p className="text-[11px] text-[#6B7280]">Expires {pm.exp}</p>
                </div>
                <button
                  type="button"
                  className="text-xs text-[#6B7280] hover:text-foreground transition"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Billing email */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Billing email</h2>
            <p className="mt-1 text-xs text-[#6B7280]">Receipts and invoices are sent here.</p>
          </div>
          <span className="text-sm font-medium text-[#1F2937]">{email}</span>
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Recent invoices</h2>
          <Link
            href="/credits"
            className="text-[11px] text-[#6B7280] hover:text-foreground transition flex items-center gap-1"
          >
            View all
            <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 9 }} />
          </Link>
        </div>

        {invoices.length === 0 ? (
          <p className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-5 text-center text-sm text-[#6B7280]">
            No invoices yet.
          </p>
        ) : (
          <ul className="divide-y divide-[#F3F4F6]">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex items-center gap-3 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-[#4B5563]">
                  <FontAwesomeIcon icon={faCreditCard} style={{ fontSize: 12 }} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{inv.description}</p>
                  <p className="text-[11px] text-[#6B7280]">{inv.date}</p>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    inv.credits > 0 ? "text-primary" : "text-foreground"
                  )}
                >
                  {inv.credits > 0 ? `+${fmt(inv.credits)}` : `-${fmt(Math.abs(inv.credits))}`}
                </span>
                <button
                  type="button"
                  className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] hover:text-foreground hover:bg-[#F3F4F6] transition"
                  aria-label="Download receipt"
                >
                  <FontAwesomeIcon icon={faDownload} style={{ fontSize: 11 }} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Cancel subscription */}
      {isPaid && (
        <div className="rounded-2xl border border-destructive/25 bg-destructive/[0.04] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-destructive/15 border border-destructive/30 text-destructive">
                <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 13 }} />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Cancel subscription</h2>
                <p className="mt-1 text-xs text-[#6B7280]">
                  {cancelled
                    ? `Your plan will end on ${renewal ?? "your next renewal"}. You can resubscribe anytime.`
                    : "You can keep using your remaining credits until the end of the billing period."}
                </p>
              </div>
            </div>
            {cancelled ? (
              <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#4B5563]">
                Cancelled
              </span>
            ) : confirmCancel ? (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-[#F3F4F6] px-3 py-2 text-xs font-semibold text-[#374151] transition"
                >
                  Keep plan
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-xl bg-destructive text-[#111111] px-3 py-2 text-xs font-bold transition hover:brightness-110 active:scale-[0.99]"
                >
                  Confirm cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="rounded-xl border border-destructive/40 bg-destructive/10 hover:bg-destructive/15 px-4 py-2 text-sm font-semibold text-destructive transition shrink-0"
              >
                Cancel subscription
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
