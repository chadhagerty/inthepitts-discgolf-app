import { NextResponse } from "next/server";
import { getPrisma } from "../../../lib/prisma.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      select: { id: true, name: true, expiresAt: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ ok: true, count: members.length, members });
  } catch (err) {
    console.error("MEMBERS API ERROR:", err);
    return NextResponse.json({ ok: false, error: "error" }, { status: 500 });
  }
}
