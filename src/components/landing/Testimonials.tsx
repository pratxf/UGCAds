"use client";

import TestimonialsSection from "@/components/ui/testimonial-v2";

const testimonials = [
  {
    text: "UGCAds cut our ad production time by 90%. We went from one video a week to five a day, and our ROAS doubled.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Sarah Mitchell",
    role: "Operations Manager, TrendHive",
  },
  {
    text: "The AI characters are shockingly realistic. Our clients can't tell the difference between UGCAds content and a real shoot.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "James Ortega",
    role: "Creative Director, ScaleUp Agency",
  },
  {
    text: "We tested 40 ad variations in a single afternoon. The product ad mode is a game-changer for e-commerce.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Priya Kapoor",
    role: "Head of Growth, NovaBrands",
  },
  {
    text: "Onboarding was seamless. Within 10 minutes we had our first ad generated. No tutorials needed.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Marcus Chen",
    role: "CEO, DropShipPro",
  },
  {
    text: "The voiceover quality blew us away. ElevenLabs integration makes every ad sound professionally produced.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Zara Hussein",
    role: "Content Lead, MediaForge",
  },
  {
    text: "We replaced a $5K/month video production budget with UGCAds. The ROI is unmatched.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Aliza Rahman",
    role: "Marketing Director, GrowthLab",
  },
  {
    text: "Being able to pick the perfect character for each ad means every piece of content feels on-brand. Our conversion rates jumped 34%.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "David Kim",
    role: "Performance Marketer, AdVentures",
  },
  {
    text: "The speed is incredible. We ship ads faster than our competitors can brief their agencies.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Sana Patel",
    role: "VP Marketing, QuickCommerce",
  },
  {
    text: "Credits rolling over is a huge plus. We scale up during launches and relax during off-season without wasting money.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Ryan Torres",
    role: "E-commerce Manager, FreshBrands",
  },
];

export default function Testimonials() {
  return (
    <TestimonialsSection
      testimonials={testimonials}
      heading="Loved by Creators"
      description="See why 10,000+ businesses trust UGCAds to produce scroll-stopping video ads at scale."
      badge="Testimonials"
    />
  );
}
