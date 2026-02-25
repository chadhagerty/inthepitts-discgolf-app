import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

function requireAdmin(req: Request) {
  const adminKey = process.env.ADMIN_KEY || "";
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return !!adminKey && token === adminKey;
}

const DEFAULTS: Record<string, string> = {
  // Feel free to add keys later without migrations
  roundsPlayed: "0",
  uniquePlayers: "0",
  aces: "0",
  eagles: "0",
  birdies: "0",
  pars: "0",
  bogeys: "0",
  doubleBogeysPlus: "0",
  // examples you may want:
  donationsTotal: "0",
  courseRecord: "",
  notes: "",
};

async function getAllStats(prisma: any) {
  const rows = await prisma.statsOverride.findMany({
    select: { key: true, value: true, updatedAt: true },
  });

  const stats: Record<string, any> = { ...DEFAULTS };

  for (const r of rows) stats[r.key] = r.value;

  // cast numeric-ish fields
  const numberKeys = [
    "roundsPlayed",
    "uniquePlayers",
    "aces",
    "eagles",
    "birdies",
    "pars",
    "bogeys",
    "doubleBogeysPlus",
    "donationsTotal",
  ];
  for (const k of numberKeys) {
    if (stats[k] !== undefined && stats[k] !== "") stats[k] = Number(stats[k]) || 0;
  }

  // last updated = newest updatedAt in table (if any)
  const lastUpdated =
    rows.length > 0
      ? rows.reduce((m: any, r: any) => (!m || r.updatedAt > m ? r.updatedAt : m), null)
      : null;

  return { stats, lastUpdated };
}

export async function GET() {
  try {
    const prisma = getPrisma();
    const { stats, lastUpdated } = await getAllStats(prisma);
    return Response.json({ ok: true, stats, lastUpdated });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || "stats error" }, { status: 500 });
  }
}

// Admin-only upsert of any keys you send
export async function POST(req: Request) {
  try {
    if (!requireAdmin(req)) {
      return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    if (!body || typeof body !== "object") {
      return Response.json({ ok: false, error: "invalid body" }, { status: 400 });
    }

    const prisma = getPrisma();

    // Allow only these keys (prevents junk writes)
    const allowedKeys = new Set(Object.keys(DEFAULTS));
    const entries = Object.entries(body).filter(([k]) => allowedKeys.has(k));

    for (const [key, value] of entries) {
      await prisma.statsOverride.upsert({
        where: { key },
        update: { value: String(value ?? "") },
        create: { key, value: String(value ?? "") },
      });
    }

    const { stats, lastUpdated } = await getAllStats(prisma);
    return Response.json({ ok: true, stats, lastUpdated });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || "stats error" }, { status: 500 });
  }
}
