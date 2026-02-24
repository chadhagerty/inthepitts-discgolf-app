import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

type Tee = "red" | "blue";

function safeReadJson(filePath: string) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    if (!raw || !raw.trim()) return { ok: false as const, error: "empty file" };
    return { ok: true as const, data: JSON.parse(raw) };
  } catch (e: any) {
    return { ok: false as const, error: e?.message ?? "read/parse failed" };
  }
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  // you pass course=in-the-pitts, so id will be "in-the-pitts"
  const basePath = path.join(process.cwd(), "game-data", "courses", id);

  const coursePath = path.join(basePath, "course.json");
  const courseRes = safeReadJson(coursePath);

  if (!courseRes.ok) {
    return NextResponse.json(
      { error: `Could not read course.json: ${courseRes.error}`, coursePath },
      { status: 500 }
    );
  }

  const course = courseRes.data;

  const holeOrder: string[] = Array.isArray(course?.holeOrder)
    ? course.holeOrder
    : [];

  const holesDir = path.join(basePath, "holes");

  const holes: any[] = [];
  const missing: { holeId: string; file: string; error: string }[] = [];

  for (const holeId of holeOrder) {
    const file = path.join(holesDir, `${holeId}.json`);
    const res = safeReadJson(file);

    if (!res.ok) {
      missing.push({ holeId, file: `${holeId}.json`, error: res.error });
      continue;
    }

    holes.push(res.data);
  }

  // If holeOrder is missing, fallback: read all json in holes/
  if (holeOrder.length === 0) {
    try {
      const files = fs
        .readdirSync(holesDir)
        .filter((f) => f.endsWith(".json"))
        .sort();

      for (const f of files) {
        const res = safeReadJson(path.join(holesDir, f));
        if (res.ok) holes.push(res.data);
        else missing.push({ holeId: f.replace(".json", ""), file: f, error: res.error });
      }
    } catch (e: any) {
      return NextResponse.json(
        { error: `No holeOrder and failed reading holes dir: ${e?.message ?? e}` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ course, holes, missing });
}
