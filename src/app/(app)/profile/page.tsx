import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const provider = (authUser?.app_metadata?.provider as string) || "email";
  const createdAt = authUser?.created_at || null;

  return (
    <ProfileClient
      name={user.name || ""}
      email={user.email}
      avatar={user.avatar || null}
      credits={user.credits}
      provider={provider}
      memberSince={createdAt}
    />
  );
}
