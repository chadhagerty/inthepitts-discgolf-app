"use client";


import { useMemo, useState } from "react";
import Link from "next/link";


const PARS_RED_18 = [3, 3, 3, 3, 4, 4, 3, 3, 3, 4, 3, 4, 4, 4, 4, 3, 3, 5];
const PARS_BLUE_18 = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 3, 3, 5];


const LAYOUTS = {
  "red-12": {
    label: "🔴 Red 12",
    shortLabel: "Red 12",
    tee: "red",
    holes: 12,
    pars: PARS_RED_18.slice(0, 12),
  },
  "blue-12": {
    label: "🔵 Blue 12",
    shortLabel: "Blue 12",
    tee: "blue",
    holes: 12,
    pars: PARS_BLUE_18.slice(0, 12),
  },
  "red-18": {
    label: "🔴 Red 18",
    shortLabel: "Red 18",
    tee: "red",
    holes: 18,
    pars: PARS_RED_18,
  },
  "blue-18": {
    label: "🔵 Blue 18",
    shortLabel: "Blue 18",
    tee: "blue",
    holes: 18,
    pars: PARS_BLUE_18,
  },
};


function layoutButtonStyle(active) {
  return {
    padding: "14px 16px",
    borderRadius: 14,
    border: active ? "1px solid rgba(245,158,11,0.45)" : "1px solid rgba(0,0,0,0.12)",
    background: active ? "rgba(245,158,11,0.18)" : "rgba(255,255,255,0.88)",
    fontWeight: 1000,
    cursor: active ? "default" : "pointer",
    boxShadow: active ? "0 0 0 2px rgba(245,158,11,0.08) inset" : "0 1px 2px rgba(0,0,0,0.04)",
    minWidth: 120,
    textAlign: "center",
  };
}


function scoreVsPar(scores, pars) {
  const holesPlayed = scores.filter((s) => s !== "").length;


  if (holesPlayed === 0) return "E";


  const strokes = scores.reduce((t, v) => t + Number(v || 0), 0);


  const parSoFar = scores.reduce((t, v, idx) => {
    if (v === "") return t;
    return t + Number(pars[idx] || 0);
  }, 0);


  const diff = strokes - parSoFar;


  if (diff === 0) return "E";
  if (diff > 0) return `+${diff}`;
  return `${diff}`;
}


function scoreBadgeStyle(diff) {
  return {
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 1000,
    border: "1px solid rgba(0,0,0,0.08)",
    background:
      diff === "E"
        ? "rgba(148,163,184,0.14)"
        : String(diff).startsWith("-")
          ? "rgba(34,197,94,0.14)"
          : "rgba(245,158,11,0.14)",
  };
}


export default function RoundTrackerPage() {
  const [name, setName] = useState("");
  const [layout, setLayout] = useState("");
  const [scores, setScores] = useState([]);
  const [status, setStatus] = useState("");


  const selected = useMemo(() => {
    return layout ? LAYOUTS[layout] : null;
  }, [layout]);


  const holesPlayed = useMemo(() => {
    return scores.filter((s) => s !== "").length;
  }, [scores]);


  const parTotal = useMemo(() => {
    return selected ? selected.pars.reduce((t, p) => t + Number(p || 0), 0) : 0;
  }, [selected]);


  const liveScore = useMemo(() => {
    return selected ? scoreVsPar(scores, selected.pars) : "E";
  }, [scores, selected]);


  function chooseLayout(nextLayout) {
    setLayout(nextLayout);
    setScores(Array(LAYOUTS[nextLayout].holes).fill(""));
    setStatus("");
  }


  function updateScore(i, val) {
    const next = [...scores];
    next[i] = val;
    setScores(next);
  }


  function resetRound() {
    if (!selected) return;
    setScores(Array(selected.holes).fill(""));
    setStatus("");
  }


  function total() {
    return scores.reduce((t, v) => t + Number(v || 0), 0);
  }


  async function submitRound() {
    const cleanName = (name || "").trim();


    if (!cleanName) {
      setStatus("Enter your name first.");
      return;
    }


    if (!selected) {
      setStatus("Select a layout first.");
      return;
    }


    const parsed = scores.map((v) => Number(v));
    const allFilled =
      parsed.length === selected.holes &&
      parsed.every((n) => Number.isFinite(n) && n > 0);


    if (!allFilled) {
      setStatus(`Fill in all ${selected.holes} hole scores first.`);
      return;
    }


    setStatus("Submitting…");


    try {
      const strokes = parsed.reduce((t, n) => t + Math.trunc(n), 0);
      const score = strokes - parTotal;


      const res = await fetch("/api/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          tee: selected.tee,
          layout,
          holes: parsed,
          strokes,
          parTotal,
          score,
          aces: 0,
          date: new Date().toISOString().slice(0, 10),
        }),
      });


      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Submit failed");


      setStatus("Submitted ✅");
      setScores(Array(selected.holes).fill(""));
    } catch (e) {
      setStatus(e?.message || "Submit failed");
    }
  }


  return (
    <main className="itp-page">
      <div className="itp-card itp-cardWide">
        <div className="itp-headerRow">
          <div>
            <h1 className="itp-title" style={{ margin: 0 }}>
              Round Tracker
            </h1>
            <div className="itp-subtitle">
              Track 12-hole and 18-hole rounds
            </div>
          </div>


          <Link href="/" className="itp-link">
            ← Home
          </Link>
        </div>


        <div
          className="itp-panel"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.82))",
          }}
        >
          <div className="itp-field">
            <label className="itp-label">Player</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="itp-input"
              placeholder="Player name"
            />
          </div>


          <div style={{ marginTop: 18 }}>
            <div className="itp-label" style={{ marginBottom: 10 }}>
              Select Layout
            </div>


            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => chooseLayout("red-12")}
                style={layoutButtonStyle(layout === "red-12")}
              >
                🔴 Red 12
              </button>


              <button
                type="button"
                onClick={() => chooseLayout("blue-12")}
                style={layoutButtonStyle(layout === "blue-12")}
              >
                🔵 Blue 12
              </button>


              <button
                type="button"
                onClick={() => chooseLayout("red-18")}
                style={layoutButtonStyle(layout === "red-18")}
              >
                🔴 Red 18
              </button>


              <button
                type="button"
                onClick={() => chooseLayout("blue-18")}
                style={layoutButtonStyle(layout === "blue-18")}
              >
                🔵 Blue 18
              </button>
            </div>
          </div>
        </div>


        {!selected && (
          <div className="itp-panel">
            <div
              style={{
                padding: 18,
                borderRadius: 14,
                border: "1px dashed rgba(0,0,0,0.14)",
                background: "rgba(255,255,255,0.65)",
                textAlign: "center",
                fontWeight: 800,
              }}
            >
              Choose a layout above to start entering scores.
            </div>
          </div>
        )}


        {selected && (
          <>
            <div className="itp-panel">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 10,
                }}
              >
                <div
                  className="itp-badgeMuted"
                  style={{ justifyContent: "center", padding: "14px 16px" }}
                >
                  Layout: <b style={{ marginLeft: 6 }}>{selected.shortLabel}</b>
                </div>


                <div
                  className="itp-badgeMuted"
                  style={{ justifyContent: "center", padding: "14px 16px" }}
                >
                  Holes: <b style={{ marginLeft: 6 }}>{selected.holes}</b>
                </div>


                <div
                  className="itp-badgeMuted"
                  style={{ justifyContent: "center", padding: "14px 16px" }}
                >
                  Par: <b style={{ marginLeft: 6 }}>{parTotal}</b>
                </div>


                <div
                  className="itp-badgeMuted"
                  style={{ justifyContent: "center", padding: "14px 16px" }}
                >
                  Progress: <b style={{ marginLeft: 6 }}>{holesPlayed}/{selected.holes}</b>
                </div>
              </div>
            </div>


            <div className="itp-panel">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <h3 className="itp-sectionTitle" style={{ margin: 0 }}>
                  Scores
                </h3>


                <div style={scoreBadgeStyle(liveScore)}>
                  Total: {total()} ({liveScore})
                </div>
              </div>


              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
                  gap: 10,
                  marginTop: 10,
                }}
              >
                {scores.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.78)",
                      border: "1px solid rgba(0,0,0,0.08)",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>
                      Hole {i + 1}
                    </div>


                    <div
                      style={{
                        fontSize: 13,
                        opacity: 0.8,
                        marginBottom: 8,
                        fontWeight: 700,
                      }}
                    >
                      Par {selected.pars[i]}
                    </div>


                    <input
                      type="number"
                      min="1"
                      value={s}
                      onChange={(e) => updateScore(i, e.target.value)}
                      className="itp-input"
                      placeholder="Score"
                    />
                  </div>
                ))}
              </div>
            </div>


            <div className="itp-panel">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.78)",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <div style={{ fontSize: 13, opacity: 0.75, fontWeight: 800 }}>
                    Current total
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 1000, marginTop: 4 }}>
                    {total()}
                  </div>
                </div>


                <div
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.78)",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <div style={{ fontSize: 13, opacity: 0.75, fontWeight: 800 }}>
                    Relative to par
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 1000, marginTop: 4 }}>
                    {liveScore}
                  </div>
                </div>
              </div>


              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div className="itp-muted">
                  {selected.shortLabel} • {selected.holes} holes • Par {parTotal}
                </div>


                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="itp-btnSecondary" type="button" onClick={resetRound}>
                    Reset Scores
                  </button>


                  <button className="itp-btn" onClick={submitRound}>
                    Submit Round
                  </button>
                </div>
              </div>


              {status && (
                <div className="itp-muted" style={{ marginTop: 10, fontWeight: 800 }}>
                  {status}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
