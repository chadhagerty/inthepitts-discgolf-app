import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

function unauthorized(msg = "unauthorized") {
  return NextResponse.json({ ok: false, error: msg }, { status: 401 });
}

function requireAdmin(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token || token !== process.env.ADMIN_KEY) return null;
  return token;
}

export async function PATCH(req, { params }) {
  if (!requireAdmin(req)) return unauthorized();

  try {
    const id = params?.id;
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const body = await req.json().catch(() => ({}));

    const data = {};
    if (body.name !== undefined) data.name = String(body.name || "").trim();
    if (body.membership !== undefined) data.membership = String(body.membership || "daypass").trim();

    if (body.expiresAt !== undefined) {
      const v = body.expiresAt;
      data.expiresAt = v ? new Date(String(v)) : null;
    }

    const prisma = getPrisma();
    const updated = await prisma.member.update({ where: { id }, data });

    return NextResponse.json({ ok: true, member: updated });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to update member" },
      { status: 500 }
    );
  }
}
