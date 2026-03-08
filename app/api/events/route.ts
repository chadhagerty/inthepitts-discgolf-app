import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


function requireAdmin(req: Request) {
  const adminKey = process.env.ADMIN_KEY || "";
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return !!adminKey && token === adminKey;
}


const VALID_TYPES = ["tournament", "league", "special", "community"];
const VALID_LAYOUTS = ["red-12", "blue-12", "red-18", "blue-18"];
const VALID_PAYMENT_TYPES = ["free", "cash", "etransfer", "stripe"];


// GET /api/events?take=100
export async function GET(req: Request) {
  try {
    const prisma = getPrisma();
    const url = new URL(req.url);
    const take = Number(url.searchParams.get("take") || "100") || 100;


    const events = await prisma.event.findMany({
      where: { isActive: true },
      orderBy: [{ date: "asc" }, { createdAt: "desc" }],
      take,
      include: {
        joins: {
          orderBy: { createdAt: "asc" },
        },
      },
    });


    return NextResponse.json({ ok: true, events });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to load events" },
      { status: 500 }
    );
  }
}


// POST /api/events
// Public join: { eventId, name, division }
// Admin create: Authorization + { title, date, type, layout, description, paymentType, price, paymentNotes }
export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json().catch(() => ({}));


    const eventId = String(body?.eventId || "").trim();
    const joinName = String(body?.name || "").trim();
    const joinDivision = String(body?.division || "").trim();


    if (eventId) {
      if (!joinName) {
        return NextResponse.json({ ok: false, error: "name-required" }, { status: 400 });
      }


      if (!joinDivision) {
        return NextResponse.json({ ok: false, error: "division-required" }, { status: 400 });
      }


      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          isActive: true,
          paymentType: true,
        },
      });


      if (!event || !event.isActive) {
        return NextResponse.json({ ok: false, error: "event-not-found" }, { status: 404 });
      }


      const existingJoin = await prisma.eventJoin.findFirst({
        where: {
          eventId,
          name: {
            equals: joinName,
            mode: "insensitive",
          },
        },
        select: { id: true },
      });


      if (existingJoin) {
        return NextResponse.json(
          { ok: false, error: "already-joined" },
          { status: 400 }
        );
      }


      const createdJoin = await prisma.eventJoin.create({
        data: {
          eventId,
          name: joinName,
          division: joinDivision,
          paymentStatus: event.paymentType === "free" ? "not_required" : "pending",
        },
      });


      return NextResponse.json({ ok: true, join: createdJoin });
    }


    if (!requireAdmin(req)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }


    const title = String(body?.title || "").trim();
    const dateStr = String(body?.date || "").slice(0, 10);
    const type = String(body?.type || "").trim().toLowerCase();
    const layout = String(body?.layout || "").trim().toLowerCase();
    const description = String(body?.description || "").trim();
    const paymentType = String(body?.paymentType || "free").trim().toLowerCase();
    const price = Number(body?.price || 0);
    const paymentNotes = String(body?.paymentNotes || "").trim();


    if (!title) {
      return NextResponse.json({ ok: false, error: "title-required" }, { status: 400 });
    }


    if (!dateStr) {
      return NextResponse.json({ ok: false, error: "date-required" }, { status: 400 });
    }


    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ ok: false, error: "invalid-type" }, { status: 400 });
    }


    if (!VALID_LAYOUTS.includes(layout)) {
      return NextResponse.json({ ok: false, error: "invalid-layout" }, { status: 400 });
    }


    if (!VALID_PAYMENT_TYPES.includes(paymentType)) {
      return NextResponse.json({ ok: false, error: "invalid-payment-type" }, { status: 400 });
    }


    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ ok: false, error: "invalid-price" }, { status: 400 });
    }


    const date = new Date(dateStr + "T12:00:00.000Z");


    const created = await prisma.event.create({
      data: {
        title,
        date,
        type,
        layout,
        description: description || null,
        paymentType,
        price: Math.trunc(price),
        paymentNotes: paymentNotes || null,
      },
      include: {
        joins: {
          orderBy: { createdAt: "asc" },
        },
      },
    });


    return NextResponse.json({ ok: true, event: created });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to save event" },
      { status: 500 }
    );
  }
}
