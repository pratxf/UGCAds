"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  credits: string;
  features: string[];
  highlighted: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminSettingsPage() {
  // Announcement bar
  const [announcementText, setAnnouncementText] = useState(
    "Create professional AI video ads in minutes. Get started today!"
  );
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  // Pricing plans
  const [plans, setPlans] = useState<PricingPlan[]>([
    {
      id: "basic",
      name: "Basic",
      price: "$19",
      credits: "15",
      features: ["15 credits/month", "720p resolution", "Email support", "Basic characters"],
      highlighted: false,
    },
    {
      id: "creator",
      name: "Creator",
      price: "$39",
      credits: "30",
      features: ["30 credits/month", "1080p resolution", "Priority support", "All characters", "Custom scripts"],
      highlighted: true,
    },
    {
      id: "agency",
      name: "Agency",
      price: "$99",
      credits: "100",
      features: ["100 credits/month", "4K resolution", "Dedicated support", "All characters", "API access", "White label"],
      highlighted: false,
    },
  ]);
  const [pricingSaved, setPricingSaved] = useState(false);

  const [editingPlan, setEditingPlan] = useState<string | null>(null);

  const handleSaveAnnouncement = () => {
    setAnnouncementSaved(true);
    setTimeout(() => setAnnouncementSaved(false), 2000);
  };

  const handleSavePricing = () => {
    setPricingSaved(true);
    setTimeout(() => setPricingSaved(false), 2000);
  };

  const updatePlan = (id: string, field: keyof PricingPlan, value: any) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const updateFeature = (planId: string, featureIndex: number, value: string) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;
        const features = [...p.features];
        features[featureIndex] = value;
        return { ...p, features };
      })
    );
  };

  const addFeature = (planId: string) => {
    setPlans((prev) =>
      prev.map((p) => p.id === planId ? { ...p, features: [...p.features, "New feature"] } : p)
    );
  };

  const removeFeature = (planId: string, featureIndex: number) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;
        return { ...p, features: p.features.filter((_, i) => i !== featureIndex) };
      })
    );
  };

  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-8 pb-8">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage pricing, announcement bar, and site content</p>
      </motion.div>

      {/* ── Announcement Bar ── */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Announcement Bar</h2>
          <button
            onClick={() => setAnnouncementEnabled(!announcementEnabled)}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              announcementEnabled ? "bg-primary" : "bg-white/10"
            )}
          >
            <div className={cn(
              "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
              announcementEnabled ? "translate-x-[22px]" : "translate-x-0.5"
            )} />
          </button>
        </div>

        <div>
          <label className="text-[11px] font-medium text-muted-foreground">Banner Text</label>
          <input
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            placeholder="Enter announcement text..."
          />
        </div>

        {/* Preview */}
        {announcementEnabled && (
          <div className="rounded-xl bg-gradient-to-r from-primary/10 via-violet/10 to-primary/10 border border-primary/10 px-4 py-2.5 text-center">
            <p className="text-xs text-foreground">{announcementText}</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSaveAnnouncement} size="sm" className="rounded-xl gap-1.5">
            {announcementSaved ? "Saved!" : <><Save className="h-3.5 w-3.5" />Save</>}
          </Button>
        </div>
      </motion.div>

      {/* ── Pricing Plans ── */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Pricing Plans</h2>
          <Button onClick={handleSavePricing} size="sm" className="rounded-xl gap-1.5">
            {pricingSaved ? "Saved!" : <><Save className="h-3.5 w-3.5" />Save All</>}
          </Button>
        </div>

        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "rounded-xl border p-5 transition-all",
                plan.highlighted ? "border-primary/30 bg-primary/[0.03]" : "border-border"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  {/* Plan name */}
                  <input
                    value={plan.name}
                    onChange={(e) => updatePlan(plan.id, "name", e.target.value)}
                    className="text-base font-semibold text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary/50 focus:outline-none transition-colors w-32"
                  />
                  {plan.highlighted && (
                    <Badge className="bg-primary/10 text-primary text-[10px]">Popular</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Highlighted toggle */}
                  <button
                    onClick={() => updatePlan(plan.id, "highlighted", !plan.highlighted)}
                    className={cn(
                      "text-[10px] font-medium px-2 py-1 rounded-lg transition-colors",
                      plan.highlighted
                        ? "bg-primary/10 text-primary"
                        : "bg-white/5 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {plan.highlighted ? "Featured" : "Set Featured"}
                  </button>
                </div>
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

              {/* Features */}
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
