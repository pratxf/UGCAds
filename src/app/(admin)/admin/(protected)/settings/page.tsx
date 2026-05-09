"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, CheckCircle2, Bell } from "lucide-react";

export default function AdminSettingsPage() {
  const [announcementText, setAnnouncementText] = useState(
    "Create professional AI video ads in minutes. Get started today!"
  );
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-8 pb-8">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Site-wide configuration and announcements</p>
      </motion.div>

      {/* Announcement Bar */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-400/10">
            <Bell className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Announcement Bar</h2>
            <p className="text-[11px] text-muted-foreground">Shown at the top of the marketing site</p>
          </div>
          <button
            onClick={() => setAnnouncementEnabled(!announcementEnabled)}
            className="ml-auto relative h-6 w-11 rounded-full transition-colors"
            style={{ background: announcementEnabled ? "hsl(var(--primary))" : "rgba(255,255,255,0.1)" }}
          >
            <div
              className="absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: announcementEnabled ? "translateX(22px)" : "translateX(2px)" }}
            />
          </button>
        </div>

        <div>
          <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Banner Text</label>
          <input
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            placeholder="Enter announcement text..."
          />
        </div>

        {announcementEnabled && (
          <div className="rounded-xl bg-gradient-to-r from-primary/10 via-violet-400/10 to-primary/10 border border-primary/10 px-4 py-3 text-center">
            <p className="text-xs text-foreground">{announcementText}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black hover:brightness-105 transition"
          >
            {saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
