import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ticket = await prisma.supportTicket.findFirst({
    where: { id, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ticket });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ticket = await prisma.supportTicket.findFirst({ where: { id, userId: user.id } });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ticket.status === "CLOSED") return NextResponse.json({ error: "Ticket is closed" }, { status: 400 });

  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const [message] = await prisma.$transaction([
    prisma.supportMessage.create({
      data: { ticketId: id, fromAdmin: false, body: body.trim().slice(0, 5000) },
    }),
    prisma.supportTicket.update({
      where: { id },
      data: { status: "OPEN", updatedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ message });
}
