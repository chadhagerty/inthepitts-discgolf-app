import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const prisma = getPrisma();

    const body = await request.json();
    const name = (body?.name || "").trim();

    if (!name) {
      return NextResponse.json(
        { ok: false, error: "Name is required" },
        { status: 400 }
      );
    }

    const member = await prisma.member.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
      },
    });

    if (!member) {
      return NextResponse.json(
        { ok: false, status: "not-member" },
        { status: 404 }
      );
    }

    if (new Date(member.expiresAt) < new Date()) {
      return NextResponse.json(
        { ok: false, status: "expired" },
        { status: 403 }
      );
    }

    return NextResponse.json({ ok: true, status: "checked-in" });
  } catch (err) {
    console.error("Check-in error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}


