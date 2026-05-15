import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const posts = await prisma.blogPost.findMany({
    orderBy: { publishedAt: "desc" },
    select: {
      id: true, slug: true, title: true, excerpt: true, category: true, published: true,
      featured: true, author: true, publishedAt: true, readTime: true,
    },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const body = await req.json();
  const post = await prisma.blogPost.create({
    data: {
      slug: body.slug,
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      category: body.category,
      author: body.author,
      authorRole: body.authorRole ?? "",
      authorImage: body.authorImage ?? "",
      coverImage: body.coverImage,
      readTime: body.readTime ?? "5 min read",
      published: body.published ?? false,
      featured: body.featured ?? false,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
    },
  });
  return NextResponse.json(post, { status: 201 });
}
