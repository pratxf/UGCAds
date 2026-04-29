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
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: {lastUpdated}</p>
          <div className="prose-legal space-y-6 text-sm text-muted-foreground leading-relaxed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_a]:text-primary [&_a]:underline [&_strong]:text-foreground [&_strong]:font-semibold">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
