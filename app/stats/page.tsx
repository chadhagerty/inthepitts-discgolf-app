"use client";


export const dynamic = "force-dynamic";


import { useEffect, useMemo, useState } from "react";
import PublicLeaderboardPage from "../leaderboard/page";


type ApiOk = { ok: true; stats: any; lastUpdated: string | null };
type ApiErr = { ok: false; error?: string; detail?: string };
type ApiResp = ApiOk | ApiErr;


const LAYOUTS = [
  { key: "red-12", label: "Red 12", par: 40 },
  { key: "blue-12", label: "Blue 12", par: 37 },
  { key: "red-18", label: "Red 18", par: 63 },
  { key: "blue-18", label: "Blue 18", par: 58 },
];


async function safeJson(res: Response): Promise<ApiResp> {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      error: `Non-JSON response (${res.status})`,
      detail: text.slice(0, 200),
    };
  }
  return (await res.json()) as ApiResp;
}


async function fetchLayoutLeader(layout: string) {
  try {
    const res = await fetch(`/api/leaderboard?layout=${layout}&take=1`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));


    if (!res.ok || !data?.ok || !Array.isArray(data?.entries) || data.entries.length === 0) {
      return null;
    }


    return data.entries[0];
  } catch {
    return null;
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
        border: "1px solid rgba(255,255,255,0.16)",
        borderRadius: 18,
        padding: 18,
        minHeight: 126,
        background: "rgba(10, 40, 30, 0.35)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>{title}</div>
      <div style={{ fontSize: 30, fontWeight: 950, marginTop: 8 }}>
        {value}
      </div>
      {sub ? (
        <div style={{ marginTop: 8, opacity: 0.8, fontWeight: 700 }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}


function LayoutRecordCard({
  title,
  entry,
  par,
}: {
  title: string;
  entry: any;
  par: number;
}) {
  function formatScore(score: any) {
    const n = Number(score);
    if (!Number.isFinite(n)) return "—";
    if (n === 0) return "E";
    if (n > 0) return `+${n}`;
    return `${n}`;
  }


  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.16)",
        borderRadius: 18,
        padding: 18,
        minHeight: 126,
        background: "rgba(10, 40, 30, 0.35)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>{title}</div>


      {entry ? (
        <>
          <div style={{ fontSize: 24, fontWeight: 950, marginTop: 8 }}>
            {entry.name}
          </div>
          <div style={{ marginTop: 8, opacity: 0.88, fontWeight: 800 }}>
            {entry.strokes} strokes • {formatScore(entry.score)}
          </div>
          <div style={{ marginTop: 6, opacity: 0.72, fontWeight: 700 }}>
            Par {par} • {String(entry.date || "").slice(0, 10)}
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 24, fontWeight: 950, marginTop: 8 }}>—</div>
          <div style={{ marginTop: 8, opacity: 0.72, fontWeight: 700 }}>
            No record yet
          </div>
        </>
      )}
    </div>
  );
}


export default function StatsPage() {
  const [data, setData] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [layoutLeaders, setLayoutLeaders] = useState<Record<string, any>>({});


  async function load() {
    setLoading(true);


    try {
      const [statsRes, red12, blue12, red18, blue18] = await Promise.all([
        fetch("/api/stats", { cache: "no-store" }),
        fetchLayoutLeader("red-12"),
        fetchLayoutLeader("blue-12"),
        fetchLayoutLeader("red-18"),
        fetchLayoutLeader("blue-18"),
      ]);


      const json = await safeJson(statsRes);


      if (!statsRes.ok || !json?.ok) {
        setData({
          ok: false,
          error: (json as any)?.error || `Failed to load stats (${statsRes.status})`,
          detail: (json as any)?.detail,
        });
      } else {
        setData(json);
      }


      setLayoutLeaders({
        "red-12": red12,
        "blue-12": blue12,
        "red-18": red18,
        "blue-18": blue18,
      });
    } catch (e: any) {
      setData({ ok: false, error: e?.message || "stats fetch error" });
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    load();
  }, []);


  const pageBg: React.CSSProperties = {
    minHeight: "100vh",
    padding: 24,
    background:
      "radial-gradient(1200px 600px at 20% 10%, rgba(34,197,94,0.22), transparent 60%)," +
      "radial-gradient(900px 500px at 80% 30%, rgba(16,185,129,0.18), transparent 55%)," +
      "linear-gradient(180deg, #071a12 0%, #06140e 100%)",
    color: "rgba(255,255,255,0.92)",
  };


  const panel: React.CSSProperties = {
    width: "min(1150px, 96vw)",
    margin: "0 auto",
    borderRadius: 22,
    padding: 18,
    border: "1px solid rgba(255,255,255,0.14)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
  };


  const linkStyle: React.CSSProperties = {
    color: "rgba(255,255,255,0.92)",
    textDecoration: "underline",
    fontWeight: 900,
  };


  const topBar: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
    padding: "8px 8px 14px 8px",
  };


  const titleRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
  };


  const lastUpdated =
    data && (data as any).ok && (data as any).lastUpdated
      ? new Date((data as any).lastUpdated).toLocaleString()
      : null;


  const s = data && (data as any).ok ? (data as any).stats || {} : {};


  const statCards = useMemo(
    () => [
      { title: "Rounds played", value: s.roundsPlayed ?? 0 },
      { title: "Unique players", value: s.uniquePlayers ?? 0 },
      { title: "Aces", value: s.aces ?? 0 },
      { title: "Eagles", value: s.eagles ?? 0 },
      { title: "Birdies", value: s.birdies ?? 0 },
      { title: "Pars", value: s.pars ?? 0 },
      { title: "Bogeys", value: s.bogeys ?? 0 },
      { title: "Double+ Bogeys", value: s.doubleBogeysPlus ?? 0 },
    ],
    [s]
  );


  return (
    <main style={pageBg}>
      <div style={panel}>
        <div style={topBar}>
          <div style={titleRow}>
            <img
              src="/logo.png"
              alt="In The Pitts"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            />
            <div>
              <h1 style={{ margin: 0, fontSize: 34, fontWeight: 950 }}>
                In The Pitts Stats
              </h1>
              <div style={{ marginTop: 4, opacity: 0.85, fontWeight: 700 }}>
                Sponsor-friendly + player-friendly course stats
                {lastUpdated ? ` • Updated: ${lastUpdated}` : ""}
              </div>
            </div>
          </div>


          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <a href="/" style={linkStyle}>
              ← Home
            </a>
          </div>
        </div>


        {loading ? (
          <div style={{ padding: 12, opacity: 0.85, fontWeight: 800 }}>
            Loading…
          </div>
        ) : data && !data.ok ? (
          <div
            style={{
              padding: 14,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(120, 20, 20, 0.22)",
            }}
          >
            <div style={{ fontWeight: 950, color: "#ffb4b4" }}>
              Stats unavailable: {(data as ApiErr).error || "unknown error"}
            </div>
            {(data as ApiErr).detail ? (
              <pre style={{ whiteSpace: "pre-wrap", opacity: 0.85 }}>
                {(data as ApiErr).detail}
              </pre>
            ) : null}


            <button
              onClick={load}
              style={{
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(0,0,0,0.25)",
                color: "rgba(255,255,255,0.92)",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                marginTop: 10,
                display: "grid",
                gap: 14,
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              }}
            >
              {statCards.map((card) => (
                <Card key={card.title} title={card.title} value={card.value} />
              ))}
            </div>


            <div style={{ marginTop: 28 }}>
              <h2 style={{ fontSize: 24, fontWeight: 950, marginBottom: 14 }}>
                Layout Records
              </h2>


              <div
                style={{
                  display: "grid",
                  gap: 14,
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                }}
              >
                {LAYOUTS.map((layout) => (
                  <LayoutRecordCard
                    key={layout.key}
                    title={layout.label}
                    entry={layoutLeaders[layout.key]}
                    par={layout.par}
                  />
                ))}
              </div>
            </div>
          </>
        )}


        <div style={{ marginTop: 36 }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12 }}>
            Leaderboard
          </h2>
          <div style={{ opacity: 0.82, fontWeight: 700, marginBottom: 14 }}>
            Browse standings by layout.
          </div>
          <PublicLeaderboardPage />
        </div>
      </div>
    </main>
  );
}
