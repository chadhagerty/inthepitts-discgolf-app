
import { NextResponse } from "next/server";
import { getPrisma } from "../../../lib/prisma.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/checkins
 * Optional: ?date=YYYY-MM-DD
 * Protected by ADMIN_KEY
 */
export async function GET(req) {
  try {
    const prisma = getPrisma();

    // --- Admin auth ---
    const auth = req.headers.get("authorization") || "";
    const expected = process.env.ADMIN_KEY;

    if (!expected) {
      return NextResponse.json(
        { ok: false, error: "ADMIN_KEY not set" },
        { status: 500 }
      );
    }

    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    // --- Date range ---
    const url = new URL(req.url);
    const dateParam = url.searchParams.get("date");

    let start, end;

    if (dateParam) {
      start = new Date(`${dateParam}T00:00:00.000`);
      end = new Date(`${dateParam}T23:59:59.999`);
    } else {
      const now = new Date();
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    }

    const checkIns = await prisma.checkIn.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        source: true,
        member: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      count: checkIns.length,
      checkIns,
    });
  } catch (err) {
    console.error("CHECKINS API ERROR:", err);
    return NextResponse.json(
      { ok: false, error: "server-error" },
      { status: 500 }
    );
  }
}
