
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // This endpoint just needs to exist and be a valid module for builds.
  // You can return real config later.
  return NextResponse.json({ ok: true });
}
