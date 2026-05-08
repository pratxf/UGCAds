import { redirect } from "next/navigation";
import Sidebar from "@/components/app/Sidebar";
import ConditionalOrb from "@/components/app/ConditionalOrb";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: { plan: true },
  });

  return (
    <div className="relative flex min-h-screen" style={{ background: "#F7F9FC" }}>
      <Sidebar
        userName={user.name || user.email.split("@")[0]}
        userEmail={user.email}
        userAvatar={user.avatar || undefined}
        credits={user.credits}
        plan={subscription?.plan ?? undefined}
      />
      {/* Generations orb — fixed top-right of content area */}
      <div className="fixed top-4 right-4 z-[25]">
        <ConditionalOrb />
      </div>
      <div className="relative z-[20] flex flex-1 flex-col lg:ml-[252px]">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
