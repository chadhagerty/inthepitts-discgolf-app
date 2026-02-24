import { NextResponse } from "next/server";
import coursesIndex from "../../../../game-data/courses.index.json";


export async function GET() {
  return NextResponse.json(coursesIndex);
}
