"use client";


import { useEffect, useMemo, useState } from "react";


const LAYOUTS = [
  { key: "red-12", label: "🔴 Red 12", shortLabel: "Red 12", par: 40 },
  { key: "blue-12", label: "🔵 Blue 12", shortLabel: "Blue 12", par: 37 },
  { key: "red-18", label: "🔴 Red 18", shortLabel: "Red 18", par: 63 },
  { key: "blue-18", label: "🔵 Blue 18", shortLabel: "Blue 18", par: 58 },
];


function getLayoutMeta(layout) {
  return LAYOUTS.find((x) => x.key === layout) || LAYOUTS[0];
}


function formatScore(score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "E";
  if (n > 0) return `+${n}`;
  return `${n}`;
}


function rankLabel(idx) {
  if (idx === 0) return "🥇";
  if (idx === 1) return "🥈";
  if (idx === 2) return "🥉";
  return `${idx + 1}`;
}


function LayoutTabs({ layout, setLayout }) {
  const tabStyle = (active) => ({
    padding: "12px 14px",
    borderRadius: 14,
    border: active ? "1px solid rgba(245,158,11,0.45)" : "1px solid rgba(0,0,0,0.12)",
    background: active ? "rgba(245,158,11,0.18)" : "rgba(255,255,255,0.88)",
    fontWeight: 1000,
    cursor: active ? "default" : "pointer",
    boxShadow: active ? "0 0 0 2px rgba(245,158,11,0.08) inset" : "0 1px 2px rgba(0,0,0,0.04)",
    minWidth: 120,
    textAlign: "center",
  });


  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {LAYOUTS.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => setLayout(item.key)}
          disabled={layout === item.key}
          style={tabStyle(layout === item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}


export default function PublicLeaderboardPage() {
  const [layout, setLayout] = useState("red-12");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");


  const meta = useMemo(() => getLayoutMeta(layout), [layout]);
  const topEntry = entries.length > 0 ? entries[0] : null;


  async function load() {
    setLoading(true);
    setErr("");


    try {
      const res = await fetch(`/api/leaderboard?layout=${layout}&take=500`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));


      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to load leaderboard");
      }


      setEntries(Array.isArray(data.entries) ? data.entries : []);
    } catch (e) {
      setEntries([]);
      setErr(e?.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    load();
  }, [layout]);


  return (
    <main className="itp-page">
      <div className="itp-card itp-cardWide">
        <div className="itp-headerRow">
          <div>
            <h1 className="itp-title" style={{ margin: 0 }}>
              Leaderboard
            </h1>
            <div className="itp-subtitle">Top rounds across all course layouts</div>
          </div>
        </div>


        <div className="itp-panel">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 0.7fr",
              gap: 14,
              alignItems: "start",
            }}
          >
            <div>
              <div className="itp-label" style={{ marginBottom: 10 }}>
                Layout
              </div>
              <LayoutTabs layout={layout} setLayout={setLayout} />
            </div>


            <div
              style={{
                display: "grid",
                gap: 10,
              }}
            >
              <div
                className="itp-badgeMuted"
                style={{
                  background: "rgba(245,158,11,0.14)",
                  borderColor: "rgba(0,0,0,0.12)",
                  justifyContent: "center",
                  padding: "14px 16px",
                }}
              >
                Layout: <b style={{ marginLeft: 6 }}>{meta.shortLabel}</b>
              </div>


              <div
                className="itp-badgeMuted"
                style={{
                  background: "rgba(245,158,11,0.14)",
                  borderColor: "rgba(0,0,0,0.12)",
                  justifyContent: "center",
                  padding: "14px 16px",
                }}
              >
                Par: <b style={{ marginLeft: 6 }}>{meta.par}</b>
              </div>
            </div>
          </div>


          {topEntry && !loading && !err && (
            <div
              style={{
                marginTop: 14,
                padding: 16,
                borderRadius: 16,
                border: "1px solid rgba(245,158,11,0.22)",
                background: "linear-gradient(180deg, rgba(245,158,11,0.12), rgba(255,255,255,0.72))",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.72, letterSpacing: 0.5 }}>
                COURSE LEADER FOR {meta.shortLabel.toUpperCase()}
              </div>
              <div style={{ marginTop: 6, fontSize: 22, fontWeight: 1000 }}>
                🏆 {topEntry.name}
              </div>
              <div style={{ marginTop: 4, fontWeight: 800 }}>
                {topEntry.strokes} strokes • {formatScore(topEntry.score)} • {String(topEntry.date || "").slice(0, 10)}
              </div>
            </div>
          )}


          {err && (
            <div className="itp-alert bad" style={{ marginTop: 12 }}>
              ❌ {err}
            </div>
          )}


          {loading ? (
            <div
              style={{
                marginTop: 14,
                padding: 18,
                borderRadius: 14,
                background: "rgba(255,255,255,0.68)",
                border: "1px solid rgba(0,0,0,0.08)",
                fontWeight: 800,
              }}
            >
              Loading leaderboard…
            </div>
          ) : entries.length === 0 ? (
            <div
              style={{
                marginTop: 14,
                padding: 18,
                borderRadius: 14,
                background: "rgba(255,255,255,0.68)",
                border: "1px dashed rgba(0,0,0,0.12)",
                fontWeight: 800,
                textAlign: "center",
              }}
            >
              No entries yet for {meta.shortLabel}.
            </div>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 14 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
                <thead>
                  <tr>
                    {["Rank", "Player", "Strokes", "Score", "Aces", "Date"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "12px 10px",
                          borderBottom: "1px solid rgba(0,0,0,0.10)",
                          fontSize: 13,
                          color: "#334155",
                          whiteSpace: "nowrap",
                          letterSpacing: 0.2,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>


                <tbody>
                  {entries.map((e, idx) => {
                    const isLeader = idx === 0;


                    return (
                      <tr
                        key={e.id || `${e.name}-${idx}`}
                        style={{
                          background: isLeader ? "rgba(245,158,11,0.08)" : "transparent",
                        }}
                      >
                        <td
                          style={{
                            padding: "12px 10px",
                            borderBottom: "1px solid rgba(0,0,0,0.06)",
                            fontWeight: 1000,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {rankLabel(idx)}
                        </td>


                        <td
                          style={{
                            padding: "12px 10px",
                            borderBottom: "1px solid rgba(0,0,0,0.06)",
                            fontWeight: 1000,
                          }}
                        >
                          {e.name} {isLeader ? "🏆" : ""}
                        </td>


                        <td
                          style={{
                            padding: "12px 10px",
                            borderBottom: "1px solid rgba(0,0,0,0.06)",
                          }}
                        >
                          <b>{e.strokes ?? "—"}</b>
                        </td>


                        <td
                          style={{
                            padding: "12px 10px",
                            borderBottom: "1px solid rgba(0,0,0,0.06)",
                          }}
                        >
                          <b>{formatScore(e.score)}</b>
                        </td>


                        <td
                          style={{
                            padding: "12px 10px",
                            borderBottom: "1px solid rgba(0,0,0,0.06)",
                          }}
                        >
                          {e.aces ?? 0}
                        </td>


                        <td
                          style={{
                            padding: "12px 10px",
                            borderBottom: "1px solid rgba(0,0,0,0.06)",
                            opacity: 0.9,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {String(e.date || "").slice(0, 10) || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
