import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requireAdmin(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const ADMIN_KEY = process.env.ADMIN_KEY || "";
  return Boolean(ADMIN_KEY && token === ADMIN_KEY);
}

function getIdFromReq(req: Request) {
  // Works even if Next "params" breaks / is empty
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  return String(parts[parts.length - 1] || "").trim(); // last path segment
}

export async function PATCH(req: Request) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const id = getIdFromReq(req);
    if (!id || id === "leaderboard") {
      return NextResponse.json({ ok: false, error: "missing-id" }, { status: 400 });
    }

    const prisma = getPrisma();
    const body = await req.json().catch(() => ({}));

    const name = String(body?.name || "").trim();
    const tee = String(body?.tee || "").trim().toLowerCase();
    const score = Number(body?.score);
    const strokes = Number(body?.strokes);
    const aces = Number(body?.aces || 0);
    const rawDate = String(body?.date || "").slice(0, 10);
    const date = rawDate ? new Date(rawDate + "T00:00:00.000Z") : null;
    const notes = String(body?.notes || "").trim();

    if (!name) return NextResponse.json({ ok: false, error: "name-required" }, { status: 400 });
    if (tee !== "red" && tee !== "blue") return NextResponse.json({ ok: false, error: "invalid-tee" }, { status: 400 });
    if (!Number.isFinite(score)) return NextResponse.json({ ok: false, error: "score-required" }, { status: 400 });
    if (!Number.isFinite(strokes)) return NextResponse.json({ ok: false, error: "strokes-required" }, { status: 400 });

    const updated = await prisma.leaderboardEntry.update({
      where: { id },
      data: {
        name,
        tee,
        score: Math.trunc(score),
        strokes: Math.trunc(strokes),
        aces: Math.trunc(Number.isFinite(aces) ? aces : 0),
        date: date || undefined,
        notes: notes || null,
      },
    });

    return NextResponse.json({ ok: true, entry: updated });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Save failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const id = getIdFromReq(req);
    if (!id || id === "leaderboard") {
      return NextResponse.json({ ok: false, error: "missing-id" }, { status: 400 });
    }

    const prisma = getPrisma();
    await prisma.leaderboardEntry.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = String(e?.message || "").toLowerCase();
    if (msg.includes("record") && msg.includes("not found")) {
      return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
    }
    return NextResponse.json({ ok: false, error: e?.message || "Delete failed" }, { status: 500 });
  }
}
