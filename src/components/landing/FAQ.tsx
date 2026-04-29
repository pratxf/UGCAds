"use client";

import { FAQ1 } from "@/components/ui/faq-monochrome";

const faqs = [
  {
    question: "How do credits work?",
    answer:
      "Each video generation costs 2 credits. Your plan includes a monthly credit allowance that renews on your billing date. You can always purchase additional credits if you need more.",
    meta: "Credits",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Absolutely. You can switch plans at any time from your dashboard. Upgrades take effect immediately with prorated billing, and downgrades apply at the start of your next billing cycle.",
    meta: "Billing",
  },
  {
    question: "Do unused credits expire?",
    answer:
      "No, unused credits roll over to the next month. As long as your subscription is active, your credits accumulate so nothing goes to waste.",
    meta: "Credits",
  },
  {
    question: "What video formats are supported?",
    answer:
      "We export in MP4 (H.264) optimized for all major platforms including TikTok, Instagram Reels, YouTube Shorts, and Facebook. You can choose portrait (9:16), landscape (16:9), or square (1:1) aspect ratios.",
    meta: "Export",
  },
  {
    question: "Can I use my own product images?",
    answer:
      "Yes! Our Product Ad Mode lets you upload your own product images. The AI will generate a complete ad narrative around your product, including a character presenting it naturally.",
    meta: "Product",
  },
  {
    question: "Is there an API?",
    answer:
      "API access is coming soon on the Agency plan. It will allow you to programmatically generate videos, manage templates, and integrate UGCAds into your existing workflows.",
    meta: "API",
  },
  {
    question: "What is your refund policy?",
    answer:
      "We offer a 3-day refund window on all subscription plans, provided no credits have been used. Contact support@ugcads.com within 3 days of purchase for a full refund. Failed generations are automatically refunded.",
    meta: "Policy",
  },
];

export default function FAQ() {
  return (
    <FAQ1
      faqs={faqs}
      heading="Frequently Asked Questions"
      description="Everything you need to know about UGCAds, from credits to exports."
      badge="FAQ"
    />
  );
}
