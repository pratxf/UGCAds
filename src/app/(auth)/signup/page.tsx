"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginCardSection from "@/components/ui/login-signup";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup({ email, password, name }: { email: string; password: string; name?: string }) {
    setError(null);
    setMessage(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=/dashboard`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.user && !data.session) {
      setMessage("Check your email to confirm your account.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/dashboard`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <LoginCardSection
      mode="signup"
      onSubmit={handleSignup}
      onGoogle={handleGoogle}
      loading={loading}
      error={error}
      message={message}
    />
  );
}
