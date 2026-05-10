import { LenisProvider } from "@/components/lenis-provider";
import LiveSupportPill from "@/components/landing/LiveSupportPill";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LenisProvider>
      {children}
      <LiveSupportPill />
    </LenisProvider>
  );
}
