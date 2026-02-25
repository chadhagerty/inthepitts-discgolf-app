import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(s, max) {
  return (s || "").toString().trim().slice(0, max);
}

export async function GET() {
  const prisma = getPrisma();

  const messages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // return oldest -> newest for display
  return NextResponse.json({ ok: true, messages: messages.reverse() });
}

export async function POST(req) {
  try {
    const prisma = getPrisma();
    const body = await req.json().catch(() => ({}));

    const name = clean(body.name, 32);
    const message = clean(body.message, 500);

    if (!name) {
      return NextResponse.json({ ok: false, error: "Name required" }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ ok: false, error: "Message required" }, { status: 400 });
    }

    const row = await prisma.chatMessage.create({
      data: { name, message },
    });

    return NextResponse.json({ ok: true, message: row });
  } catch (e) {
    console.error("CHAT POST ERROR:", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
