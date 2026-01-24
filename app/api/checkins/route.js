import { NextResponse } from "next/server";
import { getPrisma } from "../../../lib/prisma.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- Admin auth (accepts either "Bearer <key>" OR just "<key>") ---
function requireAdmin(req) {
  const expected = process.env.ADMIN_KEY;

  if (!expected) {
    return NextResponse.json({ ok: false, error: "ADMIN_KEY not set" }, { status: 500 });
  }

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : auth;

  if (token !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  return null;
}

export async function GET(req) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  try {
    const prisma = getPrisma();

    const checkIns = await prisma.checkIn.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { member: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ ok: true, count: checkIns.length, checkIns });
  } catch (err) {
    console.error("CHECKINS GET ERROR:", err);
    return NextResponse.json({ ok: false, error: "error" }, { status: 500 });
  }
}

export async function POST(req) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  try {
    const prisma = getPrisma();
    const body = await req.json().catch(() => ({}));

    const source = String(body?.source || "manual").trim() || "manual";
    const memberId = body?.memberId ? String(body.memberId).trim() : "";
    const name = body?.name ? String(body.name).trim() : "";

    let member = null;

    if (memberId) {
      member = await prisma.member.findUnique({
        where: { id: memberId },
        select: { id: true, name: true },
      });
    } else if (name) {
      member = await prisma.member.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
        select: { id: true, name: true },
      });
    }

    if (!member) {
      return NextResponse.json({ ok: false, error: "member-not-found" }, { status: 404 });
    }

    const created = await prisma.checkIn.create({
      data: { memberId: member.id, source },
      include: { member: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ ok: true, checkIn: created });
  } catch (err) {
    console.error("CHECKINS POST ERROR:", err);
    return NextResponse.json({ ok: false, error: "error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  try {
    const prisma = getPrisma();

    const url = new URL(req.url);
    let id = url.searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body?.id;
    }

    id = String(id || "").trim();
    if (!id) {
      return NextResponse.json({ ok: false, error: "id-required" }, { status: 400 });
    }

    await prisma.checkIn.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("CHECKINS DELETE ERROR:", err);
    return NextResponse.json({ ok: false, error: "error" }, { status: 500 });
  }
}
