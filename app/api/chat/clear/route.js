import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req) {
  const key = req.headers.get("authorization")?.replace("Bearer ", "") || "";
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  await prisma.chatMessage.deleteMany({});
  return NextResponse.json({ ok: true });
}
