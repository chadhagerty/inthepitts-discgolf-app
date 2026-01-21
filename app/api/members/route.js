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

    const members = await prisma.member.findMany({
      select: { id: true, name: true, expiresAt: true, membership: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ ok: true, count: members.length, members });
  } catch (err) {
    console.error("MEMBERS GET ERROR:", err);
    return NextResponse.json({ ok: false, error: "error" }, { status: 500 });
  }
}

export async function POST(req) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  try {
    const prisma = getPrisma();
    const body = await req.json().catch(() => ({}));

    const name = String(body?.name || "").trim();
    if (!name) {
      return NextResponse.json({ ok: false, error: "name-required" }, { status: 400 });
    }

    // membership is REQUIRED in your schema
    const membership = String(body?.membership || "yearly").trim() || "yearly";

    let expiresAt = body?.expiresAt ? new Date(body.expiresAt) : null;
    if (!expiresAt || Number.isNaN(expiresAt.getTime())) {
      expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    const member = await prisma.member.create({
      data: { name, membership, expiresAt },
      select: { id: true, name: true, expiresAt: true, membership: true },
    });

    return NextResponse.json({ ok: true, member });
  } catch (err) {
    console.error("MEMBERS POST ERROR:", err);
    return NextResponse.json(
      { ok: false, error: "error", details: err?.message || String(err) },
      { status: 500 }
    );
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

    // If there are check-ins referencing this member, delete those first
    await prisma.checkIn.deleteMany({ where: { memberId: id } });
    await prisma.member.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("MEMBERS DELETE ERROR:", err);
    return NextResponse.json({ ok: false, error: "error" }, { status: 500 });
  }
}
