import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Placeholder list (we’ll wire this to your real hole data later)
  return NextResponse.json({
    ok: true,
    holes: [],
    note: "Placeholder endpoint. Holes list will be added later.",
  });
}
