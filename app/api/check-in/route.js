import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const { getPrisma } = await import("../../../lib/prisma.js");

  try {
    const prisma = await getPrisma();
    const body = await req.json();
    const name = (body?.name || "").trim();

    if (!name) {
      return NextResponse.json(
        { ok: false, error: "Name required" },
        { status: 400 }
      );
    }

    const member = await prisma.member.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (!member) {
      return NextResponse.json(
        { ok: false, status: "not-member" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}


