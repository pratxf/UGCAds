import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id }, select: { role: true } });
  return dbUser?.role === "ADMIN" ? user : null;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.blogPost.findMany({
    orderBy: { publishedAt: "desc" },
    select: {
      id: true, slug: true, title: true, category: true, published: true,
      featured: true, author: true, publishedAt: true, readTime: true,
    },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
