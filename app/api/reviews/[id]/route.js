import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requireAdmin(req) {
  const want = process.env.ADMIN_KEY || "";
  if (!want) return { ok: false, status: 500, error: "Missing ADMIN_KEY env var" };

  const auth = req.headers.get("authorization") || "";
  const got = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!got || got !== want) return { ok: false, status: 401, error: "unauthorized" };

  return { ok: true };
}

export async function PATCH(req, { params }) {
  const gate = requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ ok: false, error: gate.error }, { status: gate.status });

  try {
    const prisma = getPrisma();
    const id = params?.id;
    const body = await req.json().catch(() => ({}));
    const ownerResponse = String(body?.ownerResponse || "").trim();

    const updated = await prisma.review.update({
      where: { id },
      data: {
        ownerResponse: ownerResponse || null,
        respondedAt: ownerResponse ? new Date() : null,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: updated.id });
  } catch (err) {
    console.error("REVIEWS PATCH ERROR:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const gate = requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ ok: false, error: gate.error }, { status: gate.status });

  try {
    const prisma = getPrisma();
    const id = params?.id;

    await prisma.review.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
      select: { id: true },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("REVIEWS DELETE ERROR:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
