"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Plus, Trash2, Coins, Search, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  credits: string;
  features: string[];
  highlighted: boolean;
}

const DEFAULT_PLANS: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: "$39",
    credits: "100",
    features: ["100 credits/month", "UGC Studio", "Product Photoshoot", "AI Try-On", "Email support"],
    highlighted: false,
  },
  {
    id: "creator",
    name: "Creator",
    price: "$79",
    credits: "300",
    features: ["300 credits/month", "All Basic features", "Priority support", "Credits roll over"],
    highlighted: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: "$129",
    credits: "500",
    features: ["500 credits/month", "All Creator features", "Dedicated support", "Team access"],
    highlighted: false,
  },
];

type UserRow = { id: string; email: string; name: string | null; credits: number; plan: string };

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>(DEFAULT_PLANS);
  const [pricingSaved, setPricingSaved] = useState(false);

  // Grant credits
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [granting, setGranting] = useState(false);
  const [grantSuccess, setGrantSuccess] = useState<string | null>(null);
  const [grantError, setGrantError] = useState("");

  const handleSavePricing = () => {
    setPricingSaved(true);
    setTimeout(() => setPricingSaved(false), 2000);
  };

  const updatePlan = (id: string, field: keyof PricingPlan, value: string | boolean | string[]) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const updateFeature = (planId: string, fi: number, value: string) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;
        const features = [...p.features];
        features[fi] = value;
        return { ...p, features };
      })
    );
  };

  const addFeature = (planId: string) => {
    setPlans((prev) => prev.map((p) => p.id === planId ? { ...p, features: [...p.features, "New feature"] } : p));
  };

  const removeFeature = (planId: string, fi: number) => {
    setPlans((prev) =>
      prev.map((p) => p.id === planId ? { ...p, features: p.features.filter((_, i) => i !== fi) } : p)
    );
  };

  async function searchUsers(q: string) {
    setUserSearch(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults((data.users || []).slice(0, 5));
    } finally {
      setSearching(false);
    }
  }

  async function grantCredits() {
    if (!selectedUser) return;
    const amt = parseInt(creditAmount, 10);
    if (isNaN(amt) || amt === 0) { setGrantError("Enter a valid amount"); return; }
    setGranting(true);
    setGrantError("");
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: amt, reason: creditReason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setGrantSuccess(`${amt > 0 ? "+" : ""}${amt} credits granted to ${selectedUser.email}. New balance: ${data.newBalance}`);
      setCreditAmount("");
      setCreditReason("");
      setSelectedUser(null);
      setUserSearch("");
      setSearchResults([]);
      setTimeout(() => setGrantSuccess(null), 5000);
    } catch (e) {
      setGrantError(e instanceof Error ? e.message : "Failed");
    } finally {
      setGranting(false);
    }
  }

  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-8 pb-8">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-foreground">Pricing</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Edit plan tiers and grant credits to users</p>
      </motion.div>

      {/* Grant Credits */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Coins className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Grant Credits to User</h2>
            <p className="text-[11px] text-muted-foreground">Manually add or remove credits from any account</p>
          </div>
        </div>

        {grantSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-400/10 border border-emerald-400/20 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-400">{grantSuccess}</p>
          </div>
        )}

        <div className="space-y-3">
          {/* User search */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Search User</label>
            {selectedUser ? (
              <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedUser.name || selectedUser.email.split("@")[0]}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedUser.email} · {selectedUser.credits} credits</p>
                </div>
                <button onClick={() => { setSelectedUser(null); setUserSearch(""); }} className="text-muted-foreground hover:text-foreground text-xs">
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={userSearch}
                  onChange={(e) => searchUsers(e.target.value)}
                  placeholder="Search by email or name..."
                  className="w-full h-10 rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}
                {searchResults.length > 0 && (
                  <div className="absolute top-full mt-1 w-full rounded-xl border border-border bg-[#0f0f14] shadow-xl z-10 overflow-hidden">
                    {searchResults.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => { setSelectedUser(u); setSearchResults([]); setUserSearch(""); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.04] text-left transition"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{u.name || u.email.split("@")[0]}</p>
                          <p className="text-[11px] text-muted-foreground">{u.email}</p>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{u.credits} cr</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Amount (negative to deduct)</label>
              <input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="e.g. 50 or -10"
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Reason (optional)</label>
              <input
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                placeholder="e.g. Compensation"
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          {grantError && <p className="text-xs text-destructive">{grantError}</p>}

          <button
            onClick={grantCredits}
            disabled={!selectedUser || !creditAmount || granting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50 hover:brightness-105 transition"
          >
            {granting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Grant Credits
          </button>
        </div>
      </motion.div>

      {/* Pricing Plans */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">Pricing Plans</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Edit plan details (display only)</p>
          </div>
          <button
            onClick={handleSavePricing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black hover:brightness-105 transition"
          >
            {pricingSaved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {pricingSaved ? "Saved!" : "Save All"}
          </button>
        </div>

        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "rounded-xl border p-5 transition-all",
                plan.highlighted ? "border-primary/30 bg-primary/[0.03]" : "border-border bg-white/[0.01]"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <input
                    value={plan.name}
                    onChange={(e) => updatePlan(plan.id, "name", e.target.value)}
                    className="text-base font-semibold text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary/50 focus:outline-none transition-colors w-32"
                  />
                  {plan.highlighted && (
                    <span className="rounded-full bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5">Popular</span>
                  )}
                </div>
                <button
                  onClick={() => updatePlan(plan.id, "highlighted", !plan.highlighted)}
                  className={cn(
                    "text-[10px] font-medium px-2.5 py-1 rounded-lg transition-colors",
                    plan.highlighted
                      ? "bg-primary/10 text-primary"
                      : "bg-white/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {plan.highlighted ? "Featured" : "Set Featured"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[10px] text-muted-foreground">Price/month</label>
                  <input
                    value={plan.price}
                    onChange={(e) => updatePlan(plan.id, "price", e.target.value)}
                    className="mt-0.5 w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Credits/month</label>
                  <input
                    value={plan.credits}
                    onChange={(e) => updatePlan(plan.id, "credits", e.target.value)}
                    className="mt-0.5 w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground">Features</label>
                {plan.features.map((feature, fi) => (
                  <div key={fi} className="flex items-center gap-2">
                    <input
                      value={feature}
                      onChange={(e) => updateFeature(plan.id, fi, e.target.value)}
                      className="flex-1 h-8 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                    <button
                      onClick={() => removeFeature(plan.id, fi)}
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addFeature(plan.id)}
                  className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors mt-1"
                >
                  <Plus className="h-3 w-3" /> Add feature
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
