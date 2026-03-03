"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const PAR_RED = 40;
const PAR_BLUE = 37;

function parForTee(tee) {
  return tee === "blue" ? PAR_BLUE : PAR_RED;
}

function formatRoundFromStrokes(strokes, tee) {
  const par = parForTee(tee);
  const diff = Number(strokes) - par;

  if (!Number.isFinite(diff)) return "—";
  if (diff === 0) return "E";
  if (diff > 0) return `+${diff}`;
  return `${diff}`; // already includes "-"
}

function TeeTabs({ tee, setTee }) {
  const tabStyle = (active) => ({
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.18)",
    background: active ? "rgba(245,158,11,0.22)" : "rgba(255,255,255,0.85)",
    fontWeight: 1000,
    cursor: active ? "default" : "pointer",
  });

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <button type="button" onClick={() => setTee("red")} disabled={tee === "red"} style={tabStyle(tee === "red")}>
        🔴 Red
      </button>
      <button type="button" onClick={() => setTee("blue")} disabled={tee === "blue"} style={tabStyle(tee === "blue")}>
        🔵 Blue
      </button>
    </div>
  );
}

export default function PublicLeaderboardPage() {
  const [tee, setTee] = useState("red");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const par = useMemo(() => parForTee(tee), [tee]);

  async function load() {
    setLoading(true);
    setErr("");

    try {
      const res = await fetch(`/api/leaderboard?tee=${tee}&take=500`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load leaderboard");
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
  }, [tee]);

  return (
    <main className="itp-page">
      <div className="itp-card itp-cardWide">
        <div className="itp-headerRow">
          <div>
            <h1 className="itp-title" style={{ margin: 0 }}>
              Leaderboard
            </h1>
            <div className="itp-subtitle">Top rounds • Red / Blue</div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/" className="itp-link">
              ← Home
            </Link>
            <Link href="/admin" className="itp-link">
              Admin
            </Link>
          </div>
        </div>

        <div className="itp-panel">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div className="itp-label" style={{ marginBottom: 8 }}>
                Tee
              </div>
              <TeeTabs tee={tee} setTee={setTee} />
            </div>

            <div className="itp-badgeMuted" style={{ background: "rgba(245,158,11,0.14)", borderColor: "rgba(0,0,0,0.12)" }}>
              Par: <b>{par}</b>
            </div>
          </div>

          {err && <div className="itp-alert bad" style={{ marginTop: 12 }}>❌ {err}</div>}

          {loading ? (
            <p className="itp-muted" style={{ marginTop: 12 }}>
              Loading…
            </p>
          ) : entries.length === 0 ? (
            <p className="itp-muted" style={{ marginTop: 12 }}>
              No entries yet.
            </p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 12 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
                <thead>
                  <tr>
                    {["Rank", "Player", "Score", "Round", "Aces", "Date"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "10px",
                          borderBottom: "1px solid rgba(0,0,0,0.10)",
                          fontSize: 13,
                          color: "#334155",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {entries.map((e, idx) => (
                    <tr key={e.id || `${e.name}-${idx}`}>
                      <td style={{ padding: "10px", borderBottom: "1px solid rgba(0,0,0,0.06)", fontWeight: 1000 }}>
                        {idx + 1}
                      </td>

                      <td style={{ padding: "10px", borderBottom: "1px solid rgba(0,0,0,0.06)", fontWeight: 1000 }}>
                        {e.name}
                      </td>

                      {/* raw strokes total */}
                      <td style={{ padding: "10px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <b>{e.strokes ?? "—"}</b>
                      </td>

                      {/* round relative to par with + sign */}
                      <td style={{ padding: "10px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <b>{formatRoundFromStrokes(e.strokes, tee)}</b>
                      </td>

                      <td style={{ padding: "10px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {e.aces ?? 0}
                      </td>

                      <td style={{ padding: "10px", borderBottom: "1px solid rgba(0,0,0,0.06)", opacity: 0.9, whiteSpace: "nowrap" }}>
                        {String(e.date || "").slice(0, 10) || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="itp-footerRow">
          <Link href="/" className="itp-link">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
