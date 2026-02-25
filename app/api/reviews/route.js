import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clampInt(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  const i = Math.trunc(x);
  if (i < min || i > max) return null;
  return i;
}

export async function GET() {
  const prisma = getPrisma();

  const reviews = await prisma.review.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      createdAt: true,
      name: true,
      text: true,
      overall: true,
      upkeep: true,
      shotSelection: true,
      signage: true,
      app: true,
      game: true,
      ownerResponse: true,
      respondedAt: true,
    },
  });

  return NextResponse.json({ ok: true, reviews });
}

export async function POST(req) {
  try {
    const prisma = getPrisma();
    const body = await req.json().catch(() => ({}));

    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const text = String(body?.text || "").trim();

    if (!name) return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
    if (!email || !email.includes("@"))
      return NextResponse.json({ ok: false, error: "Valid email is required" }, { status: 400 });
    if (!text) return NextResponse.json({ ok: false, error: "Review text is required" }, { status: 400 });

    const overall = clampInt(body?.overall, 1, 5);
    const upkeep = clampInt(body?.upkeep, 1, 5);
    const shotSelection = clampInt(body?.shotSelection, 1, 5);
    const signage = clampInt(body?.signage, 1, 5);
    const app = clampInt(body?.app, 1, 5);
    const game = clampInt(body?.game, 1, 5);

    if ([overall, upkeep, shotSelection, signage, app, game].some((v) => v === null)) {
      return NextResponse.json(
        { ok: false, error: "All star ratings must be between 1 and 5" },
        { status: 400 }
      );
    }

    // 1 per email (hard rule)
    const existing = await prisma.review.findUnique({
      where: { email },
      select: { id: true, isDeleted: true },
    });

    if (existing && !existing.isDeleted) {
      return NextResponse.json(
        { ok: false, error: "That email already left a review. Thanks! If you need to update it, contact the course." },
        { status: 409 }
      );
    }

    // If they reviewed before but it was deleted, allow them to submit again by updating that record
    const review = existing
      ? await prisma.review.update({
          where: { email },
          data: {
            isDeleted: false,
            deletedAt: null,
            name,
            text,
            overall,
            upkeep,
            shotSelection,
            signage,
            app,
            game,
            ownerResponse: null,
            respondedAt: null,
          },
          select: { id: true },
        })
      : await prisma.review.create({
          data: {
            name,
            email,
            text,
            overall,
            upkeep,
            shotSelection,
            signage,
            app,
            game,
          },
          select: { id: true },
        });

    return NextResponse.json({ ok: true, id: review.id });
  } catch (err) {
    console.error("REVIEWS POST ERROR:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
