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


// PATCH /api/events/:id
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }


    const prisma = getPrisma();
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));


    const data: any = {};


    if (body?.title !== undefined) {
      const title = String(body.title || "").trim();
      if (!title) {
        return NextResponse.json({ ok: false, error: "title-required" }, { status: 400 });
      }
      data.title = title;
    }


    if (body?.date !== undefined) {
      const dateStr = String(body.date || "").slice(0, 10);
      if (!dateStr) {
        return NextResponse.json({ ok: false, error: "date-required" }, { status: 400 });
      }
      data.date = new Date(dateStr + "T12:00:00.000Z");
    }


    if (body?.type !== undefined) {
      const type = String(body.type || "").trim().toLowerCase();
      if (!VALID_TYPES.includes(type)) {
        return NextResponse.json({ ok: false, error: "invalid-type" }, { status: 400 });
      }
      data.type = type;
    }


    if (body?.layout !== undefined) {
      const layout = String(body.layout || "").trim().toLowerCase();
      if (!VALID_LAYOUTS.includes(layout)) {
        return NextResponse.json({ ok: false, error: "invalid-layout" }, { status: 400 });
      }
      data.layout = layout;
    }


    if (body?.description !== undefined) {
      const description = String(body.description || "").trim();
      data.description = description || null;
    }


    if (body?.paymentType !== undefined) {
      const paymentType = String(body.paymentType || "").trim().toLowerCase();
      if (!VALID_PAYMENT_TYPES.includes(paymentType)) {
        return NextResponse.json({ ok: false, error: "invalid-payment-type" }, { status: 400 });
      }
      data.paymentType = paymentType;
    }


    if (body?.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ ok: false, error: "invalid-price" }, { status: 400 });
      }
      data.price = Math.trunc(price);
    }


    if (body?.paymentNotes !== undefined) {
      const paymentNotes = String(body.paymentNotes || "").trim();
      data.paymentNotes = paymentNotes || null;
    }


    if (body?.isActive !== undefined) {
      data.isActive = !!body.isActive;
    }


    const updated = await prisma.event.update({
      where: { id },
      data,
      include: {
        joins: {
          orderBy: { createdAt: "asc" },
        },
      },
    });


    return NextResponse.json({ ok: true, event: updated });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to update event" },
      { status: 500 }
    );
  }
}


// DELETE /api/events/:id
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }


    const prisma = getPrisma();
    const { id } = await context.params;


    await prisma.event.delete({
      where: { id },
    });


    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to delete event" },
      { status: 500 }
    );
  }
}
