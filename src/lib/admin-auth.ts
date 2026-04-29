import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "ugcads_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("ADMIN_PASSWORD env var not set");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function makeToken() {
  const issued = Date.now().toString();
  return `${issued}.${sign(issued)}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [issued, sig] = token.split(".");
  if (!issued || !sig) return false;
  const expected = sign(issued);
  try {
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
      return false;
    }
  } catch {
    return false;
  }
  const issuedAt = parseInt(issued, 10);
  if (!issuedAt) return false;
  if (Date.now() - issuedAt > MAX_AGE_SECONDS * 1000) return false;
  return true;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const c = await cookies();
    return verifyToken(c.get(COOKIE_NAME)?.value);
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) throw new Error("Forbidden");
}

export async function loginAdmin(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const token = makeToken();
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return true;
}

export async function logoutAdmin() {
  const c = await cookies();
  c.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}
