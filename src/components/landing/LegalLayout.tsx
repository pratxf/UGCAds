import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 px-6 bg-[#F7F7F5] min-h-screen">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#111111] mb-2">{title}</h1>
          <p className="text-sm text-[#9CA3AF] mb-10">Last updated: {lastUpdated}</p>
          <div className="prose-legal space-y-6 text-sm text-[#6B7280] leading-relaxed [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-[#111111] [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-[#111111] [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_a]:text-[#2563EB] [&_a]:underline [&_strong]:text-[#111111] [&_strong]:font-semibold">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
