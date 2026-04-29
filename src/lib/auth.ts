import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SIGNUP_CREDITS_UNITS } from "@/lib/credits";
import type { User as PrismaUser } from "@prisma/client";

/**
 * Returns the current Supabase auth user + the synced Prisma user record.
 * Creates the Prisma row on first call if it doesn't exist.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<PrismaUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        supabaseId: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar: user.user_metadata?.avatar_url || null,
        credits: SIGNUP_CREDITS_UNITS,
      },
    });
  }

  return dbUser;
}

/**
 * Throws if user is not authenticated.
 */
export async function requireUser(): Promise<PrismaUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

/**
 * Throws if user is not an admin.
 */
export async function requireAdmin(): Promise<PrismaUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Forbidden");
  return user;
}
