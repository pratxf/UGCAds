"use client";

import SiteNavbar from "@/components/ui/navbar";

export default function Navbar() {
  return (
    <SiteNavbar
      navigationLinks={[
        {
          name: "Menu",
          items: [
            { href: "#features", label: "Features" },
            { href: "#how-it-works", label: "How It Works" },
            { href: "#pricing", label: "Pricing" },
          ],
        },
      ]}
      signInHref="/login"
      getStartedHref="/signup"
    />
  );
}
