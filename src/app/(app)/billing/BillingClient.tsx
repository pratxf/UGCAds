"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faDownload,
  faChevronRight,
  faTriangleExclamation,
  faBolt,
  faCalendar,
  faArrowsRotate,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { ChangePlanModal } from "@/components/app/ChangePlanModal";

interface Invoice {
  id: string;
  description: string;
  date: string;
  credits: number;
}

interface Props {
  email: string;
  planName: string | null;
  currentPlanId: string | null;
  monthlyCredits: number;
  billingCycle: string;
  renewal: string | null;
  totalUsedThisMonth: number;
  dailyUsage: number[];
  dayLabels: string[];
  invoices: Invoice[];
}

function fmt(units: number) {
  return units % 10 === 0 ? String(units / 10) : (units / 10).toFixed(1);
}

function planLabel(p: string | null) {
  if (!p) return "Free Tier";
  return p.charAt(0) + p.slice(1).toLowerCase();
}

function BarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1.5">
      {data.map((v, i) => {
        const isToday = i === data.length - 1;
        const heightPct = Math.max((v / max) * 100, 6);
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full flex items-end" style={{ height: 48 }}>
              <div
                className={cn("w-full rounded-t-sm transition-all", isToday ? "bg-[#2563EB]" : v > 0 ? "bg-[#2563EB]/35" : "bg-[#E5E7EB]")}
                style={{ height: `${heightPct}%` }}
              />
            </div>
            <span className="text-[9px] text-[#9CA3AF]">{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function BillingClient({
  email,
  planName,
  currentPlanId,
  monthlyCredits,
  billingCycle,
  renewal,
  totalUsedThisMonth,
  dailyUsage,
  dayLabels,
  invoices,
}: Props) {
  const isPaid = !!planName;
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  function onCancel() {
    setCancelled(true);
    setConfirmCancel(false);
    // TODO: wire to /api/billing/cancel
  }

  return (
    <>
      <ChangePlanModal
        open={showPlansModal}
        onClose={() => setShowPlansModal(false)}
        currentPlanId={currentPlanId}
      />

      <div className="mx-auto w-full max-w-3xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Billing</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Manage your plan, payment methods, and invoices.</p>
        </div>

        {/* Plan + Usage side by side */}
        <div className="grid grid-cols-2 gap-5">
          {/* Plan card */}
          <div
            className="rounded-2xl border border-[#E5E7EB] bg-white p-6"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <span className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
              isPaid
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"
            )}>
              {isPaid ? "Active subscription" : "No active plan"}
            </span>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#111111]">
              {planLabel(planName)} plan
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              {isPaid && renewal ? `Renews on ${renewal}` : "Pick a plan to unlock more credits."}
            </p>

            {isPaid && (
              <div className="mt-4 flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faBolt} className="text-[#9CA3AF]" style={{ fontSize: 12 }} />
                  <div>
                    <p className="text-xs font-semibold text-[#111111]">{fmt(monthlyCredits)}</p>
                    <p className="text-[10px] text-[#9CA3AF]">credits / cycle</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendar} className="text-[#9CA3AF]" style={{ fontSize: 12 }} />
                  <div>
                    <p className="text-xs font-semibold text-[#111111]">{billingCycle === "YEARLY" ? "Yearly" : "Monthly"}</p>
                    <p className="text-[10px] text-[#9CA3AF]">Billing cycle</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faArrowsRotate} className="text-[#9CA3AF]" style={{ fontSize: 12 }} />
                  <div>
                    <p className="text-xs font-semibold text-[#111111]">Auto</p>
                    <p className="text-[10px] text-[#9CA3AF]">Renewal</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowPlansModal(true)}
                className="rounded-xl bg-[#2563EB] text-white px-4 py-2.5 text-sm font-bold transition hover:brightness-105 active:scale-[0.99]"
              >
                {isPaid ? "Change plan" : "Upgrade"}
              </button>
              {isPaid && (
                <button
                  type="button"
                  className="rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] px-4 py-2.5 text-sm font-semibold text-[#374151] transition"
                >
                  Manage subscription
                </button>
              )}
            </div>
          </div>

          {/* Current usage card */}
          <div
            className="rounded-2xl border border-[#E5E7EB] bg-white p-6 flex flex-col"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#111111]">Current usage</h2>
              <span className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-xs text-[#374151]">
                This month
              </span>
            </div>
            <p className="text-4xl font-bold text-[#111111]">{fmt(totalUsedThisMonth)}</p>
            <p className="mt-0.5 text-sm text-[#6B7280]">credits used</p>
            <div className="mt-4 flex-1">
              <BarChart data={dailyUsage} labels={dayLabels} />
            </div>
            <p className="mt-3 text-[11px] text-[#6B7280]">
              ↗ Usage trending steady
            </p>
          </div>
        </div>

        {/* Cancel subscription — directly below plan */}
        {isPaid && (
          <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-100 border border-red-200 text-red-500">
                  <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 13 }} />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-[#111111]">Cancel subscription</h2>
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
                    className="rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] px-3 py-2 text-xs font-semibold text-[#374151] transition"
                  >
                    Keep plan
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl bg-red-500 text-white px-3 py-2 text-xs font-bold transition hover:brightness-110"
                  >
                    Confirm cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmCancel(true)}
                  className="rounded-xl border border-red-300 bg-white hover:bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition shrink-0"
                >
                  Cancel subscription
                </button>
              )}
            </div>
          </div>
        )}

        {/* Billing email */}
        <div
          className="rounded-2xl border border-[#E5E7EB] bg-white p-6"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#111111]">Billing email</h2>
              <p className="mt-1 text-xs text-[#6B7280]">Invoices and receipts will be sent to:</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#1F2937]">{email}</span>
              <button
                type="button"
                className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-[#F3F4F6] px-3 py-1.5 text-xs font-semibold text-[#374151] transition"
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Recent invoices — plans & top-ups only */}
        <div
          className="rounded-2xl border border-[#E5E7EB] bg-white p-6"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#111111]">Recent invoices</h2>
            <span className="text-[11px] text-[#9CA3AF] flex items-center gap-1">
              Plans and credit purchases
              <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 9 }} />
            </span>
          </div>

          {invoices.length === 0 ? (
            <p className="rounded-xl border border-[#E5E7EB] px-4 py-5 text-center text-sm text-[#6B7280]">
              No invoices yet.
            </p>
          ) : (
            <ul className="divide-y divide-[#F3F4F6]">
              {invoices.map((inv) => (
                <li key={inv.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-[#4B5563]">
                    <FontAwesomeIcon icon={faCreditCard} style={{ fontSize: 12 }} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-[#111111]">{inv.description}</p>
                    <p className="text-[11px] text-[#6B7280]">{inv.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#2563EB]">
                    +{fmt(Math.abs(inv.credits))}
                  </span>
                  <button
                    type="button"
                    className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] hover:text-[#111111] hover:bg-[#F3F4F6] transition"
                    aria-label="Download receipt"
                  >
                    <FontAwesomeIcon icon={faDownload} style={{ fontSize: 11 }} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
