import { NextResponse } from "next/server";
import { getPrisma } from "../../../lib/prisma.js";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const prisma = getPrisma();

    const body = await req.json();
    const name = (body?.name || "").trim();

    if (!name) {
      return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
    }

    const member = await prisma.member.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (!member) {
      return NextResponse.json({ ok: false, status: "not-member" }, { status: 404 });
    }

    if (new Date(member.expiresAt) < new Date()) {
      return NextResponse.json({ ok: false, status: "expired" }, { status: 403 });
    }

    await prisma.checkIn.create({
      data: { memberId: member.id, source: "manual" },
    });

    return NextResponse.json({ ok: true, status: "checked-in", member: { name: member.name } });
  } catch (err) {
    console.error("CHECK-IN ERROR:", err);
    return NextResponse.json({ ok: false, error: "server-error" }, { status: 500 });
  }
}

