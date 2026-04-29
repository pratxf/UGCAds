"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadset,
  faEnvelope,
  faBook,
  faUpRightFromSquare,
  faCheck,
  faChevronRight,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const faqs = [
  { q: "How do credits work?", a: "Each ad generation uses credits from your plan. UGC ads, Product ads, and Product Photoshoots all cost 2 credits each. Credits reset monthly." },
  { q: "What formats are supported?", a: "Videos are delivered in MP4 at up to 1080p. Choose between 9:16 (vertical) and 16:9 (horizontal)." },
  { q: "Can I use ads commercially?", a: "Yes! All generated content is fully licensed for commercial use across all platforms." },
  { q: "How long does generation take?", a: "UGC and Product ads take 2 to 3 minutes. Product Photoshoots are faster at around 30 seconds." },
  { q: "Can I get a refund?", a: "Failed generations are automatically refunded. For other requests, contact our support team." },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-violet to-amber px-5 py-2.5 text-xs font-semibold text-background shadow-[0_0_30px_rgba(57,255,20,0.25)] hover:brightness-110 transition-all disabled:opacity-60";

/* ------------------------------------------------------------------ */
/*  Field helper                                                       */
/* ------------------------------------------------------------------ */

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="block">
      <span className="text-xs text-white/50">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all";

/* ------------------------------------------------------------------ */
/*  Contact cards                                                      */
/* ------------------------------------------------------------------ */

type ContactCard = {
  icon: IconDefinition;
  grad: string;
  title: string;
  desc: string;
  cta: string;
  ctaColor: string;
};

const contactCards: ContactCard[] = [
  {
    icon: faHeadset,
    grad: "from-primary to-violet",
    title: "Live chat",
    desc: "Chat with our team in real time for immediate help.",
    cta: "Start chat",
    ctaColor: "text-primary",
  },
  {
    icon: faEnvelope,
    grad: "from-sky-500 to-violet",
    title: "Email support",
    desc: "Drop us a line at support@ugcads.com and we reply within 24 hours.",
    cta: "Send email",
    ctaColor: "text-violet",
  },
  {
    icon: faBook,
    grad: "from-amber to-rose-500",
    title: "Knowledge base",
    desc: "Browse guides, tutorials, and best practices for every workflow.",
    cta: "View articles",
    ctaColor: "text-amber",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setEmail("");
      setMessage("");
    }, 3000);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 pb-8">
      {/* ── Contact options ── */}
      <motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {contactCards.map((card) => (
          <div
            key={card.title}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 transition-all hover:border-white/20 hover:shadow-lg hover:shadow-black/30 cursor-pointer"
          >
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br mb-4",
                card.grad
              )}
            >
              <FontAwesomeIcon icon={card.icon} className="text-background" style={{ fontSize: 20 }} />
            </div>
            <h3 className="text-sm font-semibold text-white">{card.title}</h3>
            <p className="mt-1 text-xs text-white/60 leading-relaxed">{card.desc}</p>
            <div
              className={cn(
                "mt-5 inline-flex items-center gap-1 text-xs font-medium",
                card.ctaColor
              )}
            >
              {card.cta}
              <FontAwesomeIcon
                icon={faUpRightFromSquare}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                style={{ fontSize: 12 }}
              />
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── FAQ + Contact Form ── */}
      <div className="grid gap-3 lg:grid-cols-2">
        {/* FAQ */}
        <motion.div
          variants={fadeUp}
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Frequently asked</h3>
              <p className="mt-0.5 text-xs text-white/50">Quick answers to the most common questions</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:brightness-110 transition"
            >
              Suggest a question
              <FontAwesomeIcon icon={faUpRightFromSquare} style={{ fontSize: 11 }} />
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="py-1">
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between py-3 text-left group/faq"
                  >
                    <span className="text-[13px] font-semibold text-white pr-4 group-hover/faq:text-primary transition-colors">
                      {faq.q}
                    </span>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className={cn(
                        "shrink-0 text-white/50 transition-transform duration-200",
                        open ? "rotate-90" : "rotate-0"
                      )}
                      style={{ fontSize: 12 }}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="pb-3 pr-6 text-xs text-white/60 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          variants={fadeUp}
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-white">Send us a message</h3>
            <p className="mt-0.5 text-xs text-white/50">For anything the FAQ doesn&apos;t cover</p>
          </div>
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-primary to-violet flex items-center justify-center mb-3 shadow-[0_0_40px_rgba(57,255,20,0.25)]">
                <FontAwesomeIcon icon={faCheck} className="text-background" style={{ fontSize: 26 }} />
              </div>
              <p className="text-sm font-semibold text-white">Sent!</p>
              <p className="mt-1 text-xs text-white/60">We&apos;ll reply within 24 hours</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Name">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your name"
                  className={inputClass}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </Field>
              <Field label="Message">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder="How can we help?"
                  className={cn(inputClass, "resize-none")}
                />
              </Field>
              <div className="pt-1">
                <button type="submit" className={primaryBtn}>
                  <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: 14 }} />
                  Send message
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
