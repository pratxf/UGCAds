import { redirect } from "next/navigation";
import Sidebar from "@/components/app/Sidebar";
import ActiveGenerationsPill from "@/components/app/ActiveGenerationsPill";
import { getCurrentUser } from "@/lib/auth";
import { GradientBackground4 } from "@/components/ui/gradient-background-4";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: { plan: true },
  });

  return (
    <div className="relative flex min-h-screen" style={{ background: "#000000" }}>
      <GradientBackground4 className="fixed" />
      <Sidebar
        userName={user.name || user.email.split("@")[0]}
        userEmail={user.email}
        userAvatar={user.avatar || undefined}
        credits={user.credits}
        plan={subscription?.plan ?? undefined}
      />
      <div className="relative z-10 flex flex-1 flex-col lg:ml-[252px]">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        <ActiveGenerationsPill />
      </div>
    </div>
  );
}
