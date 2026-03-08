import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


const PARS_RED_18 = [3, 3, 3, 3, 4, 4, 3, 3, 3, 4, 3, 4, 4, 4, 4, 3, 3, 5];
const PARS_BLUE_18 = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 3, 3, 5];


const PARS_BY_LAYOUT = {
  "red-12": PARS_RED_18.slice(0, 12),
  "blue-12": PARS_BLUE_18.slice(0, 12),
  "red-18": PARS_RED_18,
  "blue-18": PARS_BLUE_18,
};


async function setStat(prisma, key, value) {
  await prisma.statsOverride.upsert({
    where: { key },
    update: { value: String(value) },
    create: { key, value: String(value) },
  });
}


async function getStatNumber(prisma, key) {
  const row = await prisma.statsOverride.findUnique({
    where: { key },
    select: { value: true },
  });


  if (!row) return 0;


  const n = Number(row.value);
  return Number.isFinite(n) ? n : 0;
}


async function getStatString(prisma, key) {
  const row = await prisma.statsOverride.findUnique({
    where: { key },
    select: { value: true },
  });


  return row?.value || "";
}


function formatScore(score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "E";
  if (n > 0) return `+${n}`;
  return `${n}`;
}


// Public: POST /api/rounds
// Accepts a completed round and writes it into LeaderboardEntry
export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json().catch(() => ({}));


    const name = String(body?.name || "").trim();
    const tee = String(body?.tee || "red").trim().toLowerCase();
    const layout = String(body?.layout || "").trim().toLowerCase();
    const holes = Array.isArray(body?.holes) ? body.holes : [];
    const aces = Number(body?.aces || 0);
    const dateStr = String(body?.date || "").slice(0, 10);


    if (!name) {
      return NextResponse.json({ ok: false, error: "name-required" }, { status: 400 });
    }


    if (tee !== "red" && tee !== "blue") {
      return NextResponse.json({ ok: false, error: "invalid-tee" }, { status: 400 });
    }


    const validLayouts = ["red-12", "blue-12", "red-18", "blue-18"];
    if (!validLayouts.includes(layout)) {
      return NextResponse.json({ ok: false, error: "invalid-layout" }, { status: 400 });
    }


    const pars = PARS_BY_LAYOUT[layout];
    const expectedHoles = pars.length;


    if (!Array.isArray(holes) || holes.length !== expectedHoles) {
      return NextResponse.json(
        { ok: false, error: `holes-required-${expectedHoles}` },
        { status: 400 }
      );
    }


    const scores = holes.map((v) => Number(v));
    if (scores.some((n) => !Number.isFinite(n) || n <= 0)) {
      return NextResponse.json({ ok: false, error: "invalid-hole-score" }, { status: 400 });
    }


    const strokes = scores.reduce((t, n) => t + Math.trunc(n), 0);
    const parTotal = pars.reduce((t, p) => t + Number(p || 0), 0);


    let score = Number(body?.score);
    if (!Number.isFinite(score)) {
      score = strokes - parTotal;
    }


    const date = dateStr ? new Date(dateStr + "T00:00:00.000Z") : new Date();


    const created = await prisma.leaderboardEntry.create({
      data: {
        name,
        layout,
        tee,
        holes: expectedHoles,
        strokes,
        score: Math.trunc(score),
        aces: Math.trunc(Number.isFinite(aces) ? aces : 0),
        date,
        notes: "Submitted via Round Tracker",
      },
    });


    let countedAces = 0;
    let eagles = 0;
    let birdies = 0;
    let parsCount = 0;
    let bogeys = 0;
    let doubleBogeysPlus = 0;


    scores.forEach((strokesOnHole, i) => {
      const par = Number(pars[i] || 0);
      const diff = strokesOnHole - par;


      if (strokesOnHole === 1) countedAces += 1;


      if (diff <= -2) eagles += 1;
      else if (diff === -1) birdies += 1;
      else if (diff === 0) parsCount += 1;
      else if (diff === 1) bogeys += 1;
      else if (diff >= 2) doubleBogeysPlus += 1;
    });


    const roundsPlayed = (await getStatNumber(prisma, "roundsPlayed")) + 1;
    const acesTotal = (await getStatNumber(prisma, "aces")) + countedAces;
    const eaglesTotal = (await getStatNumber(prisma, "eagles")) + eagles;
    const birdiesTotal = (await getStatNumber(prisma, "birdies")) + birdies;
    const parsTotal = (await getStatNumber(prisma, "pars")) + parsCount;
    const bogeysTotal = (await getStatNumber(prisma, "bogeys")) + bogeys;
    const doubleBogeysPlusTotal =
      (await getStatNumber(prisma, "doubleBogeysPlus")) + doubleBogeysPlus;


    const existingPlayer = await prisma.leaderboardEntry.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        NOT: {
          id: created.id,
        },
      },
      select: { id: true },
    });


    const uniquePlayers =
      (await getStatNumber(prisma, "uniquePlayers")) + (existingPlayer ? 0 : 1);


    const currentCourseRecord = await getStatString(prisma, "courseRecord");
    const match = String(currentCourseRecord || "").match(/([+-]?\d+)/);
    const currentCourseRecordScore = match ? Number(match[1]) : null;


    let nextCourseRecord = currentCourseRecord;


    if (
      !currentCourseRecord ||
      currentCourseRecordScore === null ||
      !Number.isFinite(currentCourseRecordScore) ||
      Number(score) < currentCourseRecordScore
    ) {
      nextCourseRecord = `${name} ${formatScore(score)} (${layout})`;
    }


    await setStat(prisma, "roundsPlayed", roundsPlayed);
    await setStat(prisma, "uniquePlayers", uniquePlayers);
    await setStat(prisma, "aces", acesTotal);
    await setStat(prisma, "eagles", eaglesTotal);
    await setStat(prisma, "birdies", birdiesTotal);
    await setStat(prisma, "pars", parsTotal);
    await setStat(prisma, "bogeys", bogeysTotal);
    await setStat(prisma, "doubleBogeysPlus", doubleBogeysPlusTotal);
    await setStat(prisma, "courseRecord", nextCourseRecord);


    return NextResponse.json({ ok: true, entry: created });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "round-submit-failed" },
      { status: 500 }
    );
  }
}
