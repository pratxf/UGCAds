"use client";

import { Users, Film, Download } from "lucide-react";
import { HowItWorks } from "@/components/ui/how-it-works";

const steps = [
  {
    icon: <Users className="h-6 w-6" />,
    title: "Pick Your Character",
    description:
      "Choose from dozens of realistic AI-generated characters that match your brand and target audience.",
    benefits: [
      "117 diverse AI characters",
      "Filter by gender, style, ethnicity",
      "Realistic human-like appearance",
    ],
  },
  {
    icon: <Film className="h-6 w-6" />,
    title: "Write Your Script",
    description:
      "Write your ad script or let our AI generate one that converts. Add a natural voiceover to bring it to life.",
    benefits: [
      "AI voiceover with ElevenLabs",
      "Script auto-generation option",
      "Multiple voice styles available",
    ],
  },
  {
    icon: <Download className="h-6 w-6" />,
    title: "Download Your Ad",
    description:
      "In under two minutes, your professional video ad is ready to publish across every platform.",
    benefits: [
      "Ready in under 2 minutes",
      "Optimized for all platforms",
      "Multiple aspect ratios",
    ],
  },
];

export default function HowItWorksSection() {
  return (
    <HowItWorks
      id="how-it-works"
      steps={steps}
      heading="How It Works"
      description="Three simple steps to go from idea to a professional, ready-to-run video ad."
    />
  );
}
