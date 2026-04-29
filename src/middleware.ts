import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const ADMIN_COOKIE = "ugcads_admin";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin gate: every /admin/* except /admin/login requires the cookie
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // Already-logged-in admin visiting /admin/login → bounce to /admin
  if (pathname === "/admin/login" && request.cookies.get(ADMIN_COOKIE)?.value) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand|UGC_Ads|fonts|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
