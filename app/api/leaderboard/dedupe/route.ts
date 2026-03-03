import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requireAdmin(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const ADMIN_KEY = process.env.ADMIN_KEY || "";
  if (!ADMIN_KEY || token !== ADMIN_KEY) return false;
  return true;
}

// POST /api/leaderboard/dedupe
export async function POST(req: Request) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();

    // Pull enough fields to detect duplicates.
    const all = await prisma.leaderboardEntry.findMany({
      select: { id: true, tee: true, name: true, strokes: true, date: true, createdAt: true },
      orderBy: [{ createdAt: "asc" }],
      take: 5000,
    });

    const seen = new Map<string, string>(); // key -> keepId
    const toDelete: string[] = [];

    for (const e of all) {
      const key = [
        String(e.tee || ""),
        String(e.name || "").trim().toLowerCase(),
        String(e.strokes ?? ""),
        e.date ? String(e.date).slice(0, 10) : "",
      ].join("|");

      if (!seen.has(key)) {
        seen.set(key, e.id);
      } else {
        toDelete.push(e.id);
      }
    }

    if (toDelete.length) {
      await prisma.leaderboardEntry.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    return NextResponse.json({ ok: true, deleted: toDelete.length });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Dedupe failed" },
      { status: 500 }
    );
  }
}
