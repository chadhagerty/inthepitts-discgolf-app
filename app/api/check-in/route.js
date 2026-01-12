export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const name = (body?.name || "").trim();

    if (!name) {
      return NextResponse.json(
        { ok: false, error: "Name is required." },
        { status: 400 }
      );
    }

    const member = await prisma.member.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (!member) {
      return NextResponse.json(
        { ok: false, error: "not-member" },
        { status: 404 }
      );
    }

    const expiresAt = member.expiresAt ? new Date(member.expiresAt) : null;
    const now = new Date();

    if (expiresAt && expiresAt < now) {
      return NextResponse.json(
        { ok: false, error: "expired" },
        { status: 403 }
      );
    }

    // record a check-in
    await prisma.checkIn.create({
      data: {
        memberId: member.id,
        source: "manual",
      },
    });

    return NextResponse.json({ ok: true, status: "checked-in" });
  } catch (e) {
    console.error("CHECK-IN ERROR:", e);
    return NextResponse.json(
      { ok: false, error: "server-error" },
      { status: 500 }
    );
  }
}
