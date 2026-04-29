import { redirect } from "next/navigation";
import Sidebar from "@/components/app/Sidebar";
import TopBar from "@/components/app/TopBar";
import { getCurrentUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={user.name || user.email.split("@")[0]}
        userEmail={user.email}
        userAvatar={user.avatar || undefined}
        credits={user.credits}
      />
      <div className="flex flex-1 flex-col lg:ml-[252px]">
        <TopBar credits={user.credits} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
