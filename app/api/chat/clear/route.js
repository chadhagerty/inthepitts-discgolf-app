import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


/**
 * @param {Request} req
 */
function requireAdmin(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const admin = (process.env.ADMIN_KEY || "").trim();


  if (!admin || !token) return false;
  return token.toLowerCase() === admin.toLowerCase();
}



// POST /api/chat/clear
/**
 * @param {Request} req
 */
export async function POST(req) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }


    const prisma = getPrisma();
    const result = await prisma.chatMessage.deleteMany({});
    return NextResponse.json({ ok: true, deleted: result.count });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e?.message || "Clear failed" }, { status: 500 });
  }
}
