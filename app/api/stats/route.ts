import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

function requireAdmin(req: Request) {
  const adminKey = process.env.ADMIN_KEY || "";
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return !!adminKey && token === adminKey;
}

// ✅ ONLY the keys you said you want
const DEFAULTS: Record<string, string> = {
  roundsPlayed: "0",
  uniquePlayers: "0",
  aces: "0",
  eagles: "0",
  birdies: "0",
  pars: "0",
  bogeys: "0",
  doubleBogeysPlus: "0",
  donationsTotal: "0",
  courseRecord: "",
};

const NUMBER_KEYS = new Set([
  "roundsPlayed",
  "uniquePlayers",
  "aces",
  "eagles",
  "birdies",
  "pars",
  "bogeys",
  "doubleBogeysPlus",
  "donationsTotal",
]);

async function getAllStats(prisma: any) {
  const rows = await prisma.statsOverride.findMany({
    select: { key: true, value: true, updatedAt: true },
  });

  const stats: Record<string, any> = { ...DEFAULTS };

  for (const r of rows) {
    // ignore old keys you no longer want
    if (stats[r.key] !== undefined) stats[r.key] = r.value;
  }

  // cast numeric-ish fields
  for (const k of Object.keys(stats)) {
    if (NUMBER_KEYS.has(k)) {
      const v = stats[k];
      stats[k] = v === "" || v === null || v === undefined ? 0 : Number(v) || 0;
    }
  }

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
