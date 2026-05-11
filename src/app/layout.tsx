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
  title: "UGCAds | AI Powered Ad Generation",
  description:
    "Create human-looking video ads in minutes with AI characters and authentic voices.",
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
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
