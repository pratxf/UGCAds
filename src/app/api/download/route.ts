import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

const R2_PUBLIC = (process.env.R2_PUBLIC_URL || "").trim();

/**
 * Proxy downloads through our origin so the browser's `download` attribute
 * actually triggers a save dialog instead of opening the file in a new tab
 * (which is what happens for cross-origin URLs).
 *
 * Only proxies URLs from our R2 bucket — prevents the route from being abused
 * as an open redirect / SSRF.
 */
export async function GET(req: Request) {
  try {
    await requireUser();
    const url = new URL(req.url);
    const target = url.searchParams.get("url");
    const filename = url.searchParams.get("filename") || "download";

    if (!target) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }
    if (R2_PUBLIC && !target.startsWith(R2_PUBLIC)) {
      return NextResponse.json({ error: "Forbidden host" }, { status: 403 });
    }

    const upstream = await fetch(target);
    if (!upstream.ok) {
      return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const headers = new Headers({
      "content-type": contentType,
      "content-disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
      "cache-control": "private, no-store",
    });
    const cl = upstream.headers.get("content-length");
    if (cl) headers.set("content-length", cl);

    return new Response(upstream.body, { status: 200, headers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
