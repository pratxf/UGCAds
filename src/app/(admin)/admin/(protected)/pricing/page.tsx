"use client";

import { useState, useRef, useEffect } from "react";
import { Tag, Search, Loader2, CheckCircle2, X, ArrowLeftRight, Lock, Info, ChevronDown, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

type UserRow = { id: string; email: string; name: string | null; credits: number; plan: string };

const baseInput: React.CSSProperties = { background: "#0A0F1E", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0" };

export default function AdminPricingPage() {
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [granting, setGranting] = useState(false);
  const [grantSuccess, setGrantSuccess] = useState<string | null>(null);
  const [grantError, setGrantError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function searchUsers(q: string) {
    setUserSearch(q);
    if (q.length < 2) { setSearchResults([]); setShowDropdown(false); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(q)}`);
      const data = await res.json();
      const results = (data.users || []).slice(0, 6);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
    } finally { setSearching(false); }
  }

  async function grantCredits() {
    if (!selectedUser) return;
    const amt = parseInt(creditAmount, 10);
    if (isNaN(amt) || amt === 0) { setGrantError("Enter a valid amount"); return; }
    setGranting(true); setGrantError("");
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/credits`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: amt, reason: creditReason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setGrantSuccess(`${amt > 0 ? "+" : ""}${amt} credits applied. New balance: ${data.newBalance}`);
      setCreditAmount(""); setCreditReason("");
      setSelectedUser((prev) => prev ? { ...prev, credits: data.newBalance } : null);
      setTimeout(() => setGrantSuccess(null), 6000);
    } catch (e) { setGrantError(e instanceof Error ? e.message : "Failed"); }
    finally { setGranting(false); }
  }

  const parsedAmount = parseInt(creditAmount, 10);
  const validAmount = !isNaN(parsedAmount) && parsedAmount !== 0;
  const newBalance = selectedUser && validAmount ? selectedUser.credits + parsedAmount : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      {/* Success banner */}
      {grantSuccess && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <p className="text-[14px] text-emerald-300">{grantSuccess}</p>
          <button onClick={() => setGrantSuccess(null)} className="ml-auto text-emerald-600 hover:text-emerald-400 transition">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main card */}
      <div className="rounded-2xl overflow-visible" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
        {/* Top accent line */}
        <div className="h-[2px] w-full rounded-t-2xl" style={{ background: "linear-gradient(90deg, #10B981, #059669)" }} />

        {/* Card header */}
        <div className="flex items-start gap-3 mx-6 mt-5 mb-5 p-4 rounded-xl" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl mt-0.5" style={{ background: "rgba(16,185,129,0.15)" }}>
            <Info className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-slate-200">Adjust user credits</p>
            <p className="text-[13px] mt-0.5" style={{ color: "#6B7280" }}>Add credits to reward users or deduct credits in case of misuse or adjustments.</p>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* User search */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#9CA3AF" }}>User</label>
            {selectedUser ? (
              <div className="flex items-center justify-between h-12 rounded-xl px-4" style={{ background: "#0A0F1E", border: "1px solid rgba(16,185,129,0.25)" }}>
                <div className="flex items-center gap-3">
                  <div className="flex size-7 items-center justify-center rounded-full shrink-0" style={{ background: "rgba(16,185,129,0.12)" }}>
                    <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-200 leading-none">{selectedUser.name || selectedUser.email.split("@")[0]}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "#6B7280" }}>{selectedUser.email} &bull; {selectedUser.credits} credits</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedUser(null); setUserSearch(""); }} className="flex size-6 items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 transition">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg className="h-4 w-4" style={{ color: "#4B5563" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <input
                    value={userSearch}
                    onChange={(e) => searchUsers(e.target.value)}
                    placeholder="Search by email or name..."
                    className="w-full h-12 rounded-xl pl-11 pr-10 text-[14px] placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition"
                    style={baseInput}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {searching ? <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#4B5563" }} /> : <ChevronDown className="h-4 w-4" style={{ color: "#4B5563" }} />}
                  </div>
                </div>
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full mt-1.5 w-full rounded-xl overflow-hidden z-20" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                    {searchResults.map((u, i) => (
                      <button key={u.id} onClick={() => { setSelectedUser(u); setShowDropdown(false); setUserSearch(""); }}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.04] transition"
                        style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                        <div className="flex items-center gap-3">
                          <div className="flex size-7 items-center justify-center rounded-full shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-slate-200">{u.name || u.email.split("@")[0]}</p>
                            <p className="text-[11px]" style={{ color: "#6B7280" }}>{u.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] font-bold text-emerald-400 tabular-nums">{u.credits}</p>
                          <p className="text-[10px]" style={{ color: "#6B7280" }}>credits</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amount + Reason */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#9CA3AF" }}>Amount</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Coins className="h-4 w-4" style={{ color: "#4B5563" }} />
                </div>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => { setCreditAmount(e.target.value); setGrantError(""); }}
                  placeholder="e.g. 50 or -10"
                  className="w-full h-12 rounded-xl pl-11 pr-4 text-[14px] placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition"
                  style={baseInput}
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: "#9CA3AF" }}>Reason (Optional)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg className="h-4 w-4" style={{ color: "#4B5563" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                <input
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  placeholder="e.g. Compensation"
                  className="w-full h-12 rounded-xl pl-11 pr-4 text-[14px] placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition"
                  style={baseInput}
                />
              </div>
            </div>
          </div>

          {/* Helper text */}
          <p className="text-[13px]" style={{ color: "#6B7280" }}>
            Use a <span className="text-emerald-400 font-semibold">positive</span> number to add credits
            {" "}or a <span className="text-red-400 font-semibold">negative</span> number to deduct credits.
          </p>

          {/* Preview box */}
          <div className="rounded-xl p-4 flex items-center justify-between gap-4" style={{ background: "#080C18", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#6B7280" }}>Preview</p>
              {selectedUser && validAmount ? (
                <p className="text-[13px]" style={{ color: "#9CA3AF" }}>
                  {parsedAmount > 0 ? "Add" : "Deduct"} <span className={cn("font-bold", parsedAmount > 0 ? "text-emerald-400" : "text-red-400")}>{parsedAmount > 0 ? "+" : ""}{parsedAmount} credits</span> for <span className="text-slate-300">{selectedUser.name || selectedUser.email.split("@")[0]}</span>
                </p>
              ) : (
                <p className="text-[13px]" style={{ color: "#4B5563" }}>This action will adjust the user&apos;s credits balance.</p>
              )}
            </div>
            <div className="flex items-center gap-2.5 shrink-0 rounded-xl px-4 py-2.5" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
              <svg className="h-4 w-4" style={{ color: "#6B7280" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.613 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.144-.807-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
              </svg>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#6B7280" }}>Current Balance</p>
                <p className="text-[16px] font-bold text-slate-100 tabular-nums leading-tight">
                  {selectedUser ? selectedUser.credits : 0}
                  {newBalance !== null && newBalance !== selectedUser?.credits && (
                    <span className={cn("text-[12px] font-semibold ml-1.5", parsedAmount > 0 ? "text-emerald-400" : "text-red-400")}>
                      &rarr; {newBalance}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {grantError && <p className="text-[13px] text-red-400">{grantError}</p>}

          {/* Footer actions */}
          <div className="flex items-center gap-4 pt-1">
            <button
              onClick={grantCredits}
              disabled={!selectedUser || !validAmount || granting}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[14px] font-bold text-white disabled:opacity-40 transition-all"
              style={{ background: "linear-gradient(135deg, #10B981, #059669)", boxShadow: selectedUser && validAmount ? "0 0 20px rgba(16,185,129,0.3)" : "none" }}
            >
              {granting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeftRight className="h-4 w-4" />}
              {granting ? "Applying..." : "Adjust Credits"}
            </button>
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <p className="text-[12px]" style={{ color: "#6B7280" }}>This action will be logged for auditing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
