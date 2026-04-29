"use client";

import { Footer as FooterSection } from "@/components/ui/footer-section";
import { Globe, MessageCircle, Video, Users } from "lucide-react";

const sections = [
  {
    label: "Company",
    links: [
      { title: "About", href: "#" },
      { title: "Features", href: "#features" },
      { title: "Pricing", href: "#pricing" },
      { title: "Contact", href: "/support" },
    ],
  },
  {
    label: "Legal",
    links: [
      { title: "Privacy", href: "/privacy" },
      { title: "Terms", href: "/terms" },
      { title: "Refund Policy", href: "/refund" },
      { title: "Cookies", href: "/cookies" },
      { title: "Acceptable Use", href: "/acceptable-use" },
    ],
  },
  {
    label: "Social",
    links: [
      { title: "Twitter / X", href: "#", icon: MessageCircle },
      { title: "Instagram", href: "#", icon: Globe },
      { title: "YouTube", href: "#", icon: Video },
      { title: "LinkedIn", href: "#", icon: Users },
    ],
  },
];

export default function Footer() {
  return <FooterSection sections={sections} />;
}
