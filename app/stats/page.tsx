import { getPrisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
function toNumber(v: unknown) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}
async function getStats() {
  try {
    const prisma = await getPrisma();
    const rows = await prisma.statsOverride.findMany();
    const map = new Map<string, { value: string; updatedAt: Date }>();
    for (const r of rows) {
      map.set(r.key, { value: r.value, updatedAt: r.updatedAt });
    }
    const stats = {
      roundsPlayed: toNumber(map.get("roundsPlayed")?.value),
      uniquePlayers: toNumber(map.get("uniquePlayers")?.value),
      aces: toNumber(map.get("aces")?.value),
      eagles: toNumber(map.get("eagles")?.value),
      birdies: toNumber(map.get("birdies")?.value),
      pars: toNumber(map.get("pars")?.value),
      bogeys: toNumber(map.get("bogeys")?.value),
      doubleBogeysPlus: toNumber(map.get("doubleBogeysPlus")?.value),
      donationsTotal: toNumber(map.get("donationsTotal")?.value),
      courseRecord: map.get("courseRecord")?.value || "",
      notes: map.get("notes")?.value || "",
    };
    const lastUpdated =
      rows.length > 0
        ? new Date(Math.max(...rows.map((r) => r.updatedAt.getTime()))).toISOString()
        : null;
    return { ok: true, stats, lastUpdated };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Failed to load stats" };
  }
}
function Card({
  title,
  value,
  sub,
}: {
  title: string;
  value: any;
  sub?: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 14,
        padding: 14,
        background: "rgba(255,255,255,0.85)",
      }}
    >
      <div style={{ fontWeight: 900 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 900, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ marginTop: 6, opacity: 0.75 }}>{sub}</div>}
    </div>
  );
}
export default async function StatsPage() {
  const data: any = await getStats();
  if (!data?.ok) {
    return (
      <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>Stats</h1>
        <p style={{ color: "crimson", fontWeight: 800 }}>
          Stats unavailable: {data?.error || "unknown error"}
        </p>
        <a href="/" style={{ textDecoration: "underline", fontWeight: 800 }}>
          ← Home
        </a>
      </main>
    );
  }
  const s = data.stats || {};
  const lastUpdated = data.lastUpdated
    ? new Date(data.lastUpdated).toLocaleString()
    : null;
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Stats</h1>
        <a href="/" style={{ textDecoration: "underline", fontWeight: 800 }}>
          ← Home
        </a>
      </div>
      <p style={{ color: "#555", marginTop: 6 }}>
        Sponsor-friendly + player-friendly course stats.{" "}
        {lastUpdated ? (
          <span style={{ opacity: 0.8 }}>(Last updated: {lastUpdated})</span>
        ) : null}
      </p>
      <h2 style={{ marginTop: 18 }}>Course</h2>
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <Card title="Rounds played" value={s.roundsPlayed ?? 0} sub="(editable)" />
        <Card
          title="Unique players"
          value={s.uniquePlayers ?? 0}
          sub="(editable)"
        />
        <Card title="Aces" value={s.aces ?? 0} sub="(editable)" />
        <Card title="Eagles" value={s.eagles ?? 0} sub="(editable)" />
        <Card title="Birdies" value={s.birdies ?? 0} sub="(editable)" />
        <Card title="Pars" value={s.pars ?? 0} sub="(editable)" />
        <Card title="Bogeys" value={s.bogeys ?? 0} sub="(editable)" />
        <Card
          title="Double+ Bogeys"
          value={s.doubleBogeysPlus ?? 0}
          sub="(editable)"
        />
      </div>
      <h2 style={{ marginTop: 22 }}>Extras</h2>
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <Card
          title="Donations total"
          value={s.donationsTotal ?? 0}
          sub="(editable)"
        />
        <Card
          title="Course record"
          value={s.courseRecord || "—"}
          sub="(editable)"
        />
        <Card title="Notes" value={s.notes || "—"} sub="(editable)" />
      </div>
      <div style={{ marginTop: 18 }}>
        <a href="/admin" style={{ textDecoration: "underline", fontWeight: 800 }}>
          Admin →
        </a>
      </div>
    </main>
  );
}

