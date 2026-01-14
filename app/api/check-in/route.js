import { NextResponse } from "next/server";
import { getPrisma } from "../../../lib/prisma.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const prisma = getPrisma();

    const { name } = await req.json();
    const cleanName = (name || "").trim();

    if (!cleanName) {
      return NextResponse.json(
        { ok: false, status: "error", error: "Name required" },
        { status: 400 }
      );
    }

    const member = await prisma.member.findFirst({
      where: { name: { equals: cleanName, mode: "insensitive" } },
      select: { id: true, name: true, expiresAt: true },
    });

    if (!member) {
      return NextResponse.json({ ok: false, status: "not-member" }, { status: 404 });
    }

    if (new Date(member.expiresAt) < new Date()) {
      return NextResponse.json({ ok: false, status: "expired" }, { status: 403 });
    }

    await prisma.checkIn.create({
      data: {
        memberId: member.id,
        source: "manual",
      },
    });

  return NextResponse.json({
  ok: true,
  status: "checked-in",
  member,
});


  } catch (err) {
    console.error("CHECK-IN ERROR:", err);
    return NextResponse.json({ ok: false, status: "error" }, { status: 500 });
  }
}



