"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Plus, Trash2, Coins, Search, Loader2, CheckCircle2, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingPlan {
  id: string; name: string; price: string; credits: string; features: string[]; highlighted: boolean;
}

const DEFAULT_PLANS: PricingPlan[] = [
  { id: "basic", name: "Basic", price: "$39", credits: "100", features: ["100 credits/month", "UGC Studio", "Product Photoshoot", "AI Try-On", "Email support"], highlighted: false },
  { id: "creator", name: "Creator", price: "$79", credits: "300", features: ["300 credits/month", "All Basic features", "Priority support", "Credits roll over"], highlighted: true },
  { id: "agency", name: "Agency", price: "$129", credits: "500", features: ["500 credits/month", "All Creator features", "Dedicated support", "Team access"], highlighted: false },
];

type UserRow = { id: string; email: string; name: string | null; credits: number; plan: string };

const PLAN_COLORS: Record<string, { gradient: string; glow: string; text: string; badge: string }> = {
  basic:   { gradient: "from-amber-500 to-orange-600",  glow: "rgba(245,158,11,0.2)",   text: "text-amber-300",  badge: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  creator: { gradient: "from-sky-500 to-blue-600",      glow: "rgba(14,165,233,0.2)",   text: "text-sky-300",    badge: "bg-sky-500/10 text-sky-300 border-sky-500/20" },
  agency:  { gradient: "from-violet-500 to-purple-600", glow: "rgba(139,92,246,0.2)",   text: "text-violet-300", badge: "bg-violet-500/10 text-violet-300 border-violet-500/20" },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const up = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22,1,0.36,1] as any } } };

function inputStyle(focused: boolean) {
  return { background: "#080C15", borderColor: focused ? "rgba(14,165,233,0.4)" : "rgba(255,255,255,0.08)", border: "1px solid" };
}

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>(DEFAULT_PLANS);
  const [pricingSaved, setPricingSaved] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [granting, setGranting] = useState(false);
  const [grantSuccess, setGrantSuccess] = useState<string | null>(null);
  const [grantError, setGrantError] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleSavePricing = () => { setPricingSaved(true); setTimeout(() => setPricingSaved(false), 2000); };
  const updatePlan = (id: string, field: keyof PricingPlan, value: string | boolean | string[]) =>
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  const updateFeature = (planId: string, fi: number, value: string) =>
    setPlans((prev) => prev.map((p) => p.id !== planId ? p : { ...p, features: p.features.map((f, i) => i === fi ? value : f) }));
  const addFeature = (planId: string) =>
    setPlans((prev) => prev.map((p) => p.id === planId ? { ...p, features: [...p.features, "New feature"] } : p));
  const removeFeature = (planId: string, fi: number) =>
    setPlans((prev) => prev.map((p) => p.id === planId ? { ...p, features: p.features.filter((_, i) => i !== fi) } : p));

  async function searchUsers(q: string) {
    setUserSearch(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults((data.users || []).slice(0, 5));
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
      setGrantSuccess(`${amt > 0 ? "+" : ""}${amt} credits granted. New balance: ${data.newBalance}`);
      setCreditAmount(""); setCreditReason(""); setSelectedUser(null); setUserSearch(""); setSearchResults([]);
      setTimeout(() => setGrantSuccess(null), 5000);
    } catch (e) { setGrantError(e instanceof Error ? e.message : "Failed"); }
    finally { setGranting(false); }
  }

  const parsedAmount = parseInt(creditAmount, 10);
  const validAmount = !isNaN(parsedAmount) && parsedAmount !== 0;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-8 pb-8">
      <motion.div variants={up}>
        <h1 className="text-[22px] font-bold text-slate-100" style={{ fontFamily: "Satoshi, sans-serif" }}>Pricing</h1>
        <p className="text-sm text-slate-600 mt-0.5">Manage plan tiers and grant credits to users</p>
      </motion.div>

      {/* Grant Credits */}
      <motion.div variants={up} className="rounded-2xl overflow-hidden" style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
        <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl" style={{ background: "rgba(52,211,153,0.12)" }}>
              <Coins className="h-3.5 w-3.5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-slate-200">Grant Credits</h2>
              <p className="text-[11px] text-slate-600 mt-0.5">Manually add or remove credits from any account</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {grantSuccess && (
            <div className="flex items-center gap-2.5 rounded-xl px-4 py-3" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-300">{grantSuccess}</p>
            </div>
          )}

          {/* User search */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5 block">User</label>
            {selectedUser ? (
              <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)" }}>
                <div>
                  <p className="text-[13px] font-semibold text-slate-200">{selectedUser.name || selectedUser.email.split("@")[0]}</p>
                  <p className="text-[11px] text-slate-600">{selectedUser.email} · {selectedUser.credits} credits</p>
                </div>
                <button onClick={() => { setSelectedUser(null); setUserSearch(""); }} className="flex size-6 items-center justify-center rounded-md text-slate-600 hover:text-slate-300 transition">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-700" />
                <input
                  value={userSearch}
                  onChange={(e) => searchUsers(e.target.value)}
                  placeholder="Search by email or name..."
                  className="w-full h-10 rounded-xl pl-9 pr-9 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none transition-all"
                  style={inputStyle(focusedInput === "search")}
                  onFocus={() => setFocusedInput("search")}
                  onBlur={() => setFocusedInput(null)}
                />
                {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-slate-700" />}
                {searchResults.length > 0 && (
                  <div className="absolute top-full mt-1.5 w-full rounded-xl overflow-hidden z-10" style={{ background: "#0D1120", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                    {searchResults.map((u, i) => (
                      <button key={u.id} onClick={() => { setSelectedUser(u); setSearchResults([]); setUserSearch(""); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-white/[0.04] transition"
                        style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}
                      >
                        <div>
                          <p className="text-[13px] font-semibold text-slate-200">{u.name || u.email.split("@")[0]}</p>
                          <p className="text-[11px] text-slate-600">{u.email}</p>
                        </div>
                        <span className="text-[11px] text-slate-600 tabular-nums">{u.credits} cr</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5 block">Amount</label>
              <input
                type="number" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="e.g. 50 or -10"
                className="w-full h-10 rounded-xl px-3 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none transition-all"
                style={inputStyle(focusedInput === "amount")}
                onFocus={() => setFocusedInput("amount")}
                onBlur={() => setFocusedInput(null)}
              />
              {creditAmount && !isNaN(parsedAmount) && selectedUser && (
                <p className="text-[11px] mt-1.5 text-slate-600">
                  New balance: <span className={cn("font-bold", parsedAmount > 0 ? "text-emerald-400" : "text-red-400")}>{selectedUser.credits + parsedAmount}</span>
                </p>
              )}
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5 block">Reason (optional)</label>
              <input
                value={creditReason} onChange={(e) => setCreditReason(e.target.value)}
                placeholder="e.g. Compensation"
                className="w-full h-10 rounded-xl px-3 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none transition-all"
                style={inputStyle(focusedInput === "reason")}
                onFocus={() => setFocusedInput("reason")}
                onBlur={() => setFocusedInput(null)}
              />
            </div>
          </div>

          {grantError && <p className="text-xs text-red-400">{grantError}</p>}

          <button
            onClick={grantCredits}
            disabled={!selectedUser || !validAmount || granting}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40 transition-all"
            style={{ background: "linear-gradient(135deg, #0EA5E9, #2563EB)", boxShadow: selectedUser && validAmount ? "0 0 20px rgba(14,165,233,0.25)" : "none" }}
          >
            {granting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {granting ? "Granting..." : `${parsedAmount > 0 ? "Add" : "Deduct"} ${Math.abs(parsedAmount) || 0} Credits`}
          </button>
        </div>
      </motion.div>

      {/* Pricing Plans */}
      <motion.div variants={up} className="rounded-2xl overflow-hidden" style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="h-[2px] w-full bg-gradient-to-r from-violet-500 to-purple-600" />
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div>
            <h2 className="text-[13px] font-bold text-slate-200">Plan Editor</h2>
            <p className="text-[11px] text-slate-600 mt-0.5">Edit plan names, pricing, and features (display only)</p>
          </div>
          <button
            onClick={handleSavePricing}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-bold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #0EA5E9, #2563EB)", boxShadow: "0 0 16px rgba(14,165,233,0.2)" }}
          >
            {pricingSaved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {pricingSaved ? "Saved!" : "Save All"}
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const c = PLAN_COLORS[plan.id] || PLAN_COLORS.basic;
            return (
              <div key={plan.id} className="rounded-xl overflow-hidden" style={{ background: "#080C15", border: `1px solid ${plan.highlighted ? "rgba(14,165,233,0.2)" : "rgba(255,255,255,0.07)"}` }}>
                <div className={cn("h-[2px] w-full bg-gradient-to-r", c.gradient)} />
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <input
                      value={plan.name}
                      onChange={(e) => updatePlan(plan.id, "name", e.target.value)}
                      className={cn("text-[14px] font-bold bg-transparent focus:outline-none border-b border-transparent hover:border-white/10 focus:border-white/20 transition-colors", c.text)}
                    />
                    <button
                      onClick={() => updatePlan(plan.id, "highlighted", !plan.highlighted)}
                      className={cn("flex size-6 items-center justify-center rounded-md transition-colors", plan.highlighted ? "text-amber-300 bg-amber-500/10" : "text-slate-700 hover:text-slate-500")}
                    >
                      <Star className="h-3 w-3" fill={plan.highlighted ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-700 uppercase tracking-wider">Price</label>
                      <input value={plan.price} onChange={(e) => updatePlan(plan.id, "price", e.target.value)}
                        className="mt-1 w-full h-8 rounded-lg px-2.5 text-sm font-bold text-slate-200 focus:outline-none transition"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-700 uppercase tracking-wider">Credits</label>
                      <input value={plan.credits} onChange={(e) => updatePlan(plan.id, "credits", e.target.value)}
                        className="mt-1 w-full h-8 rounded-lg px-2.5 text-sm font-bold text-slate-200 focus:outline-none transition"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-700 uppercase tracking-wider">Features</label>
                    {plan.features.map((feature, fi) => (
                      <div key={fi} className="flex items-center gap-1.5">
                        <input value={feature} onChange={(e) => updateFeature(plan.id, fi, e.target.value)}
                          className="flex-1 h-7 rounded-lg px-2.5 text-[11px] text-slate-400 focus:outline-none"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                        />
                        <button onClick={() => removeFeature(plan.id, fi)} className="flex size-6 items-center justify-center rounded-md text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addFeature(plan.id)} className="flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-sky-400 transition-colors mt-0.5">
                      <Plus className="h-3 w-3" /> Add feature
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
