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


const VALID_PAYMENT_STATUSES = ["not_required", "pending", "paid"];


// PATCH /api/events/joins/:id
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


    const paymentStatus = String(body?.paymentStatus || "").trim().toLowerCase();


    if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json({ ok: false, error: "invalid-payment-status" }, { status: 400 });
    }


    const updated = await prisma.eventJoin.update({
      where: { id },
      data: { paymentStatus },
    });


    return NextResponse.json({ ok: true, join: updated });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to update event join" },
      { status: 500 }
    );
  }
}


// DELETE /api/events/joins/:id
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


    await prisma.eventJoin.delete({
      where: { id },
    });


    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to delete event join" },
      { status: 500 }
    );
  }
}
