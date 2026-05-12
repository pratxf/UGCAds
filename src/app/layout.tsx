import type { Metadata } from "next";
import { Poppins, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UGCAds | AI UGC Video Ad Generator",
  description:
    "Generate UGC-style video ads, AI product photos, and on-model try-ons in under 2 minutes. No studio, no actors. From $5.",
  metadataBase: new URL("https://www.ugcads.us"),
  openGraph: {
    type: "website",
    siteName: "UGCAds",
    title: "UGCAds | AI UGC Video Ad Generator",
    description:
      "Generate UGC-style video ads, AI product photos, and on-model try-ons in under 2 minutes. No studio, no actors. From $5.",
    url: "https://www.ugcads.us",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UGCAds — AI UGC Video Ad Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UGCAds | AI UGC Video Ad Generator",
    description:
      "Generate UGC-style video ads in under 2 minutes. No studio, no actors. From $5.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <head>
        {/* Warm DNS + TLS to R2 so image fetches don't pay first-byte penalty */}
        <link rel="preconnect" href="https://pub-11b7974d8fd740f2ac02b8d38ea6b633.r2.dev" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pub-11b7974d8fd740f2ac02b8d38ea6b633.r2.dev" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://www.ugcads.us/#website",
                  url: "https://www.ugcads.us",
                  name: "UGCAds",
                  description:
                    "AI-powered platform for generating UGC-style video ads, product photoshoots, and AI model try-ons.",
                  publisher: { "@id": "https://www.ugcads.us/#organization" },
                },
                {
                  "@type": "Organization",
                  "@id": "https://www.ugcads.us/#organization",
                  name: "UGCAds",
                  url: "https://www.ugcads.us",
                  description: "AI-powered platform for generating UGC-style video ads, product photoshoots, and AI model try-ons in under 2 minutes.",
                  foundingDate: "2024",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://www.ugcads.us/og-image.png",
                    width: 1200,
                    height: 630,
                  },
                  contactPoint: {
                    "@type": "ContactPoint",
                    email: "support@ugcads.us",
                    contactType: "customer support",
                    availableLanguage: "English",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
