import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/leaderboard?tee=red&take=100
export async function GET(req: Request) {
  try {
    const prisma = getPrisma();
    const url = new URL(req.url);
    const tee = (url.searchParams.get("tee") || "red").toLowerCase();
    const take = Number(url.searchParams.get("take") || "100") || 100;

    const entries = await prisma.leaderboardEntry.findMany({
      where: { tee },
      orderBy: [{ score: "asc" }, { createdAt: "asc" }],
      take,
    });

    return NextResponse.json({ ok: true, entries });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to load leaderboard" },
      { status: 500 }
    );
  }
}

// POST /api/leaderboard
// Requires Authorization: Bearer <ADMIN_KEY>
export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";

    const ADMIN_KEY = process.env.ADMIN_KEY || "";
    if (!ADMIN_KEY || token !== ADMIN_KEY) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    const body = await req.json().catch(() => ({}));

    const name = String(body?.name || "").trim();
    const tee = String(body?.tee || "red").trim().toLowerCase();
    const score = Number(body?.score);
    const strokes = Number(body?.strokes || 0);
    const aces = Number(body?.aces || 0);
    const rawDate = String(body?.date || "").slice(0, 10);
    const date = rawDate ? new Date(rawDate + "T00:00:00.000Z") : null;
    const notes = String(body?.notes || "").trim();

    if (!name) {
      return NextResponse.json({ ok: false, error: "name-required" }, { status: 400 });
    }
    if (tee !== "red" && tee !== "blue") {
      return NextResponse.json({ ok: false, error: "invalid-tee" }, { status: 400 });
    }
    if (!Number.isFinite(score)) {
      return NextResponse.json({ ok: false, error: "score-required" }, { status: 400 });
    }

    const created = await prisma.leaderboardEntry.create({
      data: {
        name,
        tee,
        score, // relative-to-par (negative is better)
        strokes: Number.isFinite(strokes) ? strokes : 0,
        aces: Number.isFinite(aces) ? aces : 0,
        date: date || new Date(),
        notes: notes || null,
      },
    });

    return NextResponse.json({ ok: true, entry: created });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to save leaderboard entry" },
      { status: 500 }
    );
  }
}
