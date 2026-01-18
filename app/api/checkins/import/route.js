import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

// Accept either "Bearer <key>" OR "<key>"
function requireAdmin(req) {
  const auth = req.headers.get("authorization") || "";
  const expected = process.env.ADMIN_KEY;

  if (!expected) {
    return { ok: false, res: NextResponse.json({ ok: false, error: "ADMIN_KEY not set" }, { status: 500 }) };
  }

  const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  if (token !== expected) {
    return { ok: false, res: NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 }) };
  }

  return { ok: true };
}

export async function POST(req) {
  const gate = requireAdmin(req);
  if (!gate.ok) return gate.res;

  try {
    const prisma = getPrisma();
    const body = await req.json().catch(() => ({}));
    const checkIns = Array.isArray(body.checkIns) ? body.checkIns : [];

    if (checkIns.length === 0) {
      return NextResponse.json({ ok: false, error: "no-checkins-in-payload" }, { status: 400 });
    }

    // Insert using original IDs so re-running won't duplicate.
    // If a row already exists, skip it.
    let created = 0;
    let skipped = 0;

    for (const c of checkIns) {
      if (!c?.id || !c?.memberId || !c?.createdAt || !c?.source) {
        skipped++;
        continue;
      }

      const exists = await prisma.checkIn.findUnique({ where: { id: c.id } });
      if (exists) {
        skipped++;
        continue;
      }

      await prisma.checkIn.create({
        data: {
          id: c.id,
          memberId: c.memberId,
          createdAt: new Date(c.createdAt),
          source: c.source,
        },
      });

      created++;
    }

    return NextResponse.json({ ok: true, created, skipped, total: checkIns.length });
  } catch (e) {
    console.error("IMPORT CHECKINS ERROR:", e);
    return NextResponse.json({ ok: false, error: "import-failed" }, { status: 500 });
  }
}
