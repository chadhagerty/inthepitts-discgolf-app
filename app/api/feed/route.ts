import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


function scoreLabel(score: number) {
  if (!Number.isFinite(score)) return "E";
  if (score === 0) return "E";
  if (score > 0) return `+${score}`;
  return `${score}`;
}


function layoutLabel(layout?: string | null, tee?: string | null, holes?: number | null) {
  if (layout === "red-12") return "Red 12";
  if (layout === "blue-12") return "Blue 12";
  if (layout === "red-18") return "Red 18";
  if (layout === "blue-18") return "Blue 18";


  if (tee && holes) {
    const teeLabel = tee === "blue" ? "Blue" : "Red";
    return `${teeLabel} ${holes}`;
  }


  return "Layout";
}


function formatEventType(type?: string | null) {
  if (type === "tournament") return "Tournament";
  if (type === "league") return "League";
  if (type === "special") return "Special Event";
  if (type === "community") return "Community Event";
  return "Event";
}


export async function GET(req: Request) {
  try {
    const prisma = getPrisma();
    const url = new URL(req.url);
    const take = Math.min(Number(url.searchParams.get("take") || "20") || 20, 50);


    const [checkIns, rounds, joins] = await Promise.all([
      prisma.checkIn.findMany({
        take,
        orderBy: { createdAt: "desc" },
        include: {
          member: {
            select: {
              name: true,
              membership: true,
            },
          },
        },
      }),
      prisma.leaderboardEntry.findMany({
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.eventJoin.findMany({
        take,
        orderBy: { createdAt: "desc" },
        include: {
          event: {
            select: {
              title: true,
              type: true,
            },
          },
        },
      }),
    ]);


    const feed = [
      ...checkIns.map((item) => ({
        id: `checkin-${item.id}`,
        type: "checkin",
        createdAt: item.createdAt,
        headline: `${item.member?.name || "Player"} checked in`,
        detail: item.member?.membership === "yearly" ? "Yearly member" : "Day pass",
      })),
      ...rounds.map((item) => ({
        id: `round-${item.id}`,
        type: "round",
        createdAt: item.createdAt,
        headline: `${item.name} shot ${scoreLabel(item.score)} on ${layoutLabel(item.layout, item.tee, item.holes)}`,
        detail: `${item.strokes} strokes`,
      })),
      ...joins.map((item) => ({
        id: `join-${item.id}`,
        type: "event_join",
        createdAt: item.createdAt,
        headline: `${item.name} joined ${item.event?.title || "an event"}`,
        detail: `${item.division} • ${formatEventType(item.event?.type)}`,
      })),
    ]
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, take);


    return NextResponse.json({ ok: true, feed });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to load feed" },
      { status: 500 }
    );
  }
}
