
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    game: "In The Pitts Disc Golf: The Game",
    course: "In The Pitts Disc Golf Course",
    creator: "Chad Hagerty",
    website: "https://inthepittsdiscgolf.ca",
    notes: "Authentic course-true realism with playful easter eggs 🥏🐴",
  });
}
