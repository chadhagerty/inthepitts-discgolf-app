import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanEmail(email) {
  return (email || "").trim().toLowerCase();
}

export async function POST(req) {
  try {
    const prisma = getPrisma();

    const body = await req.json().catch(() => ({}));
    const email = cleanEmail(body?.email);
    const source = (body?.source || "manual").toString();

    if (!email) {
      return NextResponse.json(
        { ok: false, status: "error", error: "Email required" },
        { status: 400 }
      );
    }

    // Find member by email (stored lower-case recommended)
    const member = await prisma.member.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        membership: true,
        expiresAt: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        {
          ok: false,
          status: "not-member",
          error: "No active membership/day pass found for that email.",
        },
        { status: 404 }
      );
    }

    const now = new Date();
    if (new Date(member.expiresAt) < now) {
      return NextResponse.json(
        {
          ok: false,
          status: "expired",
          error: "Pass/membership expired. Please purchase again.",
        },
        { status: 403 }
      );
    }

    // Create check-in (tracks visits for yearly + daypass)
    await prisma.checkIn.create({
      data: {
        memberId: member.id,
        source: ["manual", "qr", "stripe"].includes(source) ? source : "manual",
      },
    });

    return NextResponse.json({
      ok: true,
      status: "checked-in",
      message: "Checked in ✅ Have a great round!",
      member,
    });
  } catch (err) {
    console.error("CHECK-IN ERROR:", err);
    return NextResponse.json(
      { ok: false, status: "error", error: "Server error" },
      { status: 500 }
    );
  }
}
