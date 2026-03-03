import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


function requireAdmin(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const admin = (process.env.ADMIN_KEY || "").trim();


  if (!admin || !token) return false;
  return token.toLowerCase() === admin.toLowerCase();
}


export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }


    const { id } = await ctx.params; // ✅ required for Next 16
    const cleanId = String(id || "").trim();


    if (!cleanId) {
      return NextResponse.json({ ok: false, error: "missing-id" }, { status: 400 });
    }


    const prisma = getPrisma();
    await prisma.chatMessage.delete({ where: { id: cleanId } });


    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.toLowerCase().includes("record") && msg.toLowerCase().includes("not found")) {
      return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
    }
    return NextResponse.json({ ok: false, error: e?.message || "Delete failed" }, { status: 500 });
  }
}
