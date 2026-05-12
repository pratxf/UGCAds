"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faBox,
  faImage,
  faFilm,
  faChevronRight,
  faUpRightFromSquare,
  faDownload,
  faArrowTrendUp,
  faPlay,
  faWandMagicSparkles,
  faFire,
  faBolt,
  faClock,
  faBookOpen,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAvatars } from "@/lib/hooks/use-library";

interface Generation {
  id: string;
  title: string;
  type: string;
  status: string;
  date: string;
  characterImage: string | null;
  thumbnailUrl: string | null;
}

interface Props {
  userName: string;
  credits: number;
  creditsTotal: number;
  totalAds: number;
  thisMonthCount: number;
  weeklyData: { day: string; value: number }[];
  recentGenerations: Generation[];
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } } };

function statusVariant(s: string) {
  switch (s) {
    case "Complete": return "default" as const;
    case "Processing": return "secondary" as const;
    case "Failed": return "destructive" as const;
    default: return "secondary" as const;
  }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

type IconDef = IconDefinition;

function MiniStat({
  label,
  value,
  sub,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  sub: string;
  icon: IconDef;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-3",
        highlight && "border-primary/30 bg-gradient-to-br from-primary/10 to-transparent"
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-medium uppercase tracking-widest text-[#9CA3AF]">
          {label}
        </span>
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md border border-[#E5E7EB] bg-[#F9FAFB]",
            highlight && "border-primary/20 bg-primary/10 text-primary"
          )}
        >
          <FontAwesomeIcon icon={icon} style={{ fontSize: 12 }} />
        </div>
      </div>
      <p className="mt-2 text-xl font-semibold text-[#111111]">{value}</p>
      <p className="mt-0.5 text-[11px] text-[#6B7280]">{sub}</p>
    </div>
  );
}

type TileGrad = string;

function CreationTile({
  href,
  title,
  desc,
  icon,
  grad,
  credits,
}: {
  href: string;
  title: string;
  desc: string;
  icon: IconDef;
  grad: TileGrad;
  credits: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-6 transition-all hover:border-[#D1D5DB] hover:bg-[#F3F4F6]"
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br opacity-30 blur-2xl transition-opacity group-hover:opacity-60",
          grad
        )}
      />
      <div className="relative flex items-start justify-between">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white",
            grad
          )}
        >
          <FontAwesomeIcon icon={icon} style={{ fontSize: 20 }} />
        </div>
        <FontAwesomeIcon
          icon={faUpRightFromSquare}
          className="text-[#9CA3AF] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#111111]"
          style={{ fontSize: 18 }}
        />
      </div>
      <div className="relative mt-5">
        <h3 className="text-lg font-semibold text-[#111111]">{title}</h3>
        <p className="mt-1 text-sm text-[#6B7280]">{desc}</p>
      </div>
      <div className="relative mt-5 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-[11px] text-[#374151]">
          <FontAwesomeIcon icon={faBolt} className="text-primary" style={{ fontSize: 10 }} />
          {credits}
        </span>
      </div>
    </Link>
  );
}

export default function DashboardClient({
  userName, credits, creditsTotal, totalAds, thisMonthCount, weeklyData, recentGenerations,
}: Props) {
  const { items: characters } = useAvatars();
  const creditsPct = creditsTotal > 0 ? Math.round((credits / creditsTotal) * 100) : 0;
  const weekTotal = weeklyData.reduce((s, d) => s + d.value, 0);
  const fmt = (units: number) => String(units);
  const displayCredits = fmt(credits);
  const displayTotal = fmt(creditsTotal);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-10 pb-12">
      {/* HERO */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-3xl border border-[#E5E7EB] bg-gradient-to-br from-[#F3F4F6] to-[#F9FAFB] p-8 lg:p-10"
      >
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-violet opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary opacity-10 blur-3xl" />

        <div className="relative grid gap-8 sm:grid-cols-5">
          {/* Left: greeting + CTAs */}
          <div className="sm:col-span-3 flex flex-col justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-xs text-[#374151]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                All systems generating. avg 47s
              </div>

              <h2 className="mt-5 text-2xl font-semibold leading-tight tracking-tight text-[#111111] sm:text-4xl lg:text-5xl">
                {getGreeting()}, {userName}. What are we{" "}
                <span className="gradient-text">making today?</span>
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-[#4B5563]">
                {credits > 0 ? (
                  <>
                    You have{" "}
                    <span className="font-semibold text-[#111111]">{displayCredits} credits</span>{" "}
                    ready to go. Spin up a scroll stopping ad in under a minute.
                  </>
                ) : (
                  <>
                    You have{" "}
                    <span className="font-semibold text-destructive">no credits</span> left.{" "}
                    <Link href="/credits?upgrade=true" className="text-primary hover:underline">
                      Upgrade your plan
                    </Link>{" "}
                    to keep creating.
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/create/ugc-studio"
                className="inline-flex items-center gap-2 rounded-full bg-[#C6FF33] px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-[#C6FF33]/20 transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: 14 }} />
                Start creating
              </Link>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-5 py-2.5 text-sm font-medium text-[#1F2937] transition-all hover:border-[#D1D5DB] hover:bg-[#F3F4F6] hover:text-[#111111]"
              >
                <FontAwesomeIcon icon={faPlay} style={{ fontSize: 14 }} />
                Watch 90 sec tour
              </button>
            </div>
          </div>

          {/* Right: 2x2 MiniStats */}
          <div className="sm:col-span-2 grid grid-cols-2 gap-3 self-center">
            <MiniStat
              label="Credits left"
              value={displayCredits}
              sub={creditsTotal > 0 ? `of ${displayTotal} this cycle. ${creditsPct}%` : "Top up anytime"}
              icon={faBolt}
              highlight
            />
            <MiniStat
              label="Total ads"
              value={String(totalAds)}
              sub={totalAds === 0 ? "No ads yet" : `${thisMonthCount} created this month`}
              icon={faFilm}
            />
            <MiniStat
              label="This week"
              value={String(weekTotal)}
              sub={weekTotal === 0 ? "Nothing yet this week" : `${weekTotal} ad${weekTotal === 1 ? "" : "s"} generated`}
              icon={faArrowTrendUp}
            />
            <MiniStat
              label="Momentum"
              value={thisMonthCount > 0 ? `+${thisMonthCount}` : "0"}
              sub={thisMonthCount > 0 ? "Up on last month" : "Ready to start"}
              icon={faFire}
            />
          </div>
        </div>
      </motion.div>

      {/* START SOMETHING */}
      <motion.div variants={fadeUp} className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#111111]">Start something</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Pick a format. We will handle the heavy lifting and hand you a finished asset.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <CreationTile
            href="/create/ugc-studio"
            title="UGC Studio"
            desc="Lip-synced creator videos with any avatar and your hook."
            icon={faVideo}
            grad="from-[#7D39EB] via-[#9B59FF] to-[#4f20c8]"
            credits="15 to 25 credits"
          />
          <CreationTile
            href="/create/product-photoshoot"
            title="Product Photoshoot"
            desc="Studio-grade product stills placed in any scene or background."
            icon={faImage}
            grad="from-[#C6FF33] via-[#a8db1f] to-[#6aaa00]"
            credits="1 credit"
          />
          <CreationTile
            href="/create/tryon"
            title="AI Try-On"
            desc="Virtually dress any model in your garment in seconds."
            icon={faBox}
            grad="from-[#7D39EB] via-[#C6FF33] to-[#4f20c8]"
            credits="5 credits"
          />
        </div>
      </motion.div>

      {/* RECENT + POPULAR */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          variants={fadeUp}
          className="relative overflow-hidden rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-6 backdrop-blur-xl lg:col-span-2"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#111111]">Recent generations</h2>
              <p className="mt-0.5 text-xs text-[#6B7280]">Your latest work, ready to share.</p>
            </div>
            {recentGenerations.length > 0 && (
              <Link
                href="/history"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#4B5563] transition-colors hover:text-[#111111]"
              >
                View all <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 12 }} />
              </Link>
            )}
          </div>

          {recentGenerations.length === 0 ? (
            <div className="relative flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
              <div className="pointer-events-none absolute inset-x-10 top-4 h-28 rounded-full bg-gradient-to-r from-primary/30 via-violet/30 to-amber/30 opacity-40 blur-3xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#F3F4F6] shadow-lg shadow-primary/10">
                <FontAwesomeIcon icon={faWandMagicSparkles} className="text-primary" style={{ fontSize: 26 }} />
              </div>
              <p className="relative mt-5 text-base font-semibold text-[#111111]">
                Your reel is empty. for now.
              </p>
              <p className="relative mt-1 text-sm text-[#6B7280]">
                Create your first ad and we will line it up here for you.
              </p>
              <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/create/ugc-studio"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet to-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  <FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: 14 }} />
                  Create your first ad
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {recentGenerations.map((g) => (
                <div
                  key={g.id}
                  className="group flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-3 transition-all hover:border-[#E5E7EB] hover:bg-[#F3F4F6]"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#F9FAFB]">
                    {(g.thumbnailUrl || g.characterImage) ? (
                      <Image
                        src={g.thumbnailUrl || g.characterImage!}
                        alt={g.title}
                        fill
                        className="object-cover object-top"
                        sizes="56px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FontAwesomeIcon icon={faFilm} className="text-[#9CA3AF]" style={{ fontSize: 20 }} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#111111]">{g.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[11px] text-[#6B7280]">{g.type}</span>
                      <span className="text-[#D1D5DB]">.</span>
                      <span className="text-[11px] text-[#6B7280]">{g.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={statusVariant(g.status)}
                      className="hidden text-[10px] sm:inline-flex"
                    >
                      {g.status === "Complete" && (
                        <FontAwesomeIcon icon={faCheck} className="mr-1" style={{ fontSize: 10 }} />
                      )}
                      {g.status}
                    </Badge>
                    {g.thumbnailUrl && (
                      <a
                        href={g.thumbnailUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-[#4B5563] opacity-0 transition-all hover:bg-[#F9FAFB] hover:text-[#111111] group-hover:opacity-100"
                      >
                        <FontAwesomeIcon icon={faDownload} style={{ fontSize: 14 }} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-6 backdrop-blur-xl"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#111111]">Popular characters</h2>
              <p className="mt-0.5 text-xs text-[#6B7280]">Loved by creators this week.</p>
            </div>
            <Link
              href="/create/ugc"
              className="text-xs font-medium text-[#4B5563] transition-colors hover:text-[#111111]"
            >
              See all
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {characters.slice(0, 6).map((char) => (
              <Link
                key={char.id}
                href="/create/ugc"
                className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-[#E5E7EB] transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
              >
                <Image
                  src={char.imageUrl}
                  alt={char.name}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  sizes="120px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2">
                  <p className="truncate text-[10px] font-medium text-white">{char.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
