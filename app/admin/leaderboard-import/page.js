"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const PAR_RED = 40;
const PAR_BLUE = 37;

function parForTee(tee) {
  return tee === "blue" ? PAR_BLUE : PAR_RED;
}

function relativeFromStrokes(strokes, tee) {
  // score stored as number relative-to-par (sorting works)
  return Number(strokes) - parForTee(tee); // 33 -> -7, 44 -> +4
}

function formatRoundFromStrokes(strokes, tee) {
  const diff = Number(strokes) - parForTee(tee);
  if (!Number.isFinite(diff)) return "—";
  if (diff === 0) return "E";
  if (diff > 0) return `+${diff}`;
  return `${diff}`;
}

export default function LeaderboardImportPage() {
  const [key, setKey] = useState("");
  const [tee, setTee] = useState("red");
  const [text, setText] = useState(`[
  { "name": "carteryeomans3", "score": 33 }
]`);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);
  const [okCount, setOkCount] = useState(0);
  const [failCount, setFailCount] = useState(0);

  const par = useMemo(() => parForTee(tee), [tee]);

  async function runImport() {
    setRunning(true);
    setLog([]);
    setOkCount(0);
    setFailCount(0);

    if (!key.trim()) {
      setLog((l) => [...l, "❌ Missing ADMIN_KEY"]);
      setRunning(false);
      return;
    }

    let rows;
    try {
      rows = JSON.parse(text);
      if (!Array.isArray(rows)) throw new Error("Not an array");
    } catch (e) {
      setLog((l) => [...l, `❌ Invalid JSON: ${e.message}`]);
      setRunning(false);
      return;
    }

    // de-dupe by name+strokes just in case
    const seen = new Set();
    const cleaned = [];
    for (const r of rows) {
      const name = String(r?.name || "").trim();
      const strokes = Number(r?.score);
      if (!name || !Number.isFinite(strokes)) continue;
      const sig = `${name}::${strokes}`;
      if (seen.has(sig)) continue;
      seen.add(sig);
      cleaned.push({ name, strokes });
    }

    setLog((l) => [
      ...l,
      `Starting import: ${cleaned.length} entries to ${tee.toUpperCase()} (Par ${par})`,
    ]);

    for (let i = 0; i < cleaned.length; i++) {
      const { name, strokes } = cleaned[i];

      const payload = {
        name,
        tee,
        strokes, // raw strokes total
        score: relativeFromStrokes(strokes, tee), // numeric relative-to-par
        aces: 0,
        date: new Date().toISOString().slice(0, 10),
        notes: "Imported from UDisc",
      };

      try {
        const res = await fetch("/api/leaderboard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key.trim()}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.ok) {
          setFailCount((c) => c + 1);
          setLog((l) => [
            ...l,
            `❌ ${i + 1}/${cleaned.length} ${name} ${strokes} (${formatRoundFromStrokes(
              strokes,
              tee
            )}) -> ${data?.error || res.statusText}`,
          ]);
        } else {
          setOkCount((c) => c + 1);
          setLog((l) => [
            ...l,
            `✅ ${i + 1}/${cleaned.length} ${name} ${strokes} (${formatRoundFromStrokes(
              strokes,
              tee
            )})`,
          ]);
        }
      } catch (e) {
        setFailCount((c) => c + 1);
        setLog((l) => [
          ...l,
          `❌ ${i + 1}/${cleaned.length} ${name} -> ${e?.message || "network error"}`,
        ]);
      }
    }

    setLog((l) => [...l, `Done. ✅ ${okCount} ok, ❌ ${failCount} failed`]);
    setRunning(false);
  }

  return (
    <main className="itp-page">
      <div className="itp-card itp-cardWide">
        <div className="itp-headerRow">
          <div>
            <h1 className="itp-title" style={{ margin: 0 }}>
              Admin: Bulk Import Leaderboard
            </h1>
            <div className="itp-subtitle">
              Paste UDisc JSON → import into DB (no scripts)
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/admin" className="itp-link">
              ← Admin HQ
            </Link>
            <Link href="/leaderboard" className="itp-link">
              Public Leaderboard →
            </Link>
          </div>
        </div>

        <div className="itp-panel">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setTee("red")}
              className="itp-btnSecondary"
              disabled={tee === "red"}
            >
              🔴 Red (Par {PAR_RED})
            </button>
            <button
              type="button"
              onClick={() => setTee("blue")}
              className="itp-btnSecondary"
              disabled={tee === "blue"}
            >
              🔵 Blue (Par {PAR_BLUE})
            </button>

            <div className="itp-muted" style={{ marginLeft: "auto" }}>
              Importing to: <b>{tee.toUpperCase()}</b> • Par <b>{par}</b>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label className="itp-label">Admin Key</label>
            <input
              className="itp-input"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste ADMIN_KEY"
              autoComplete="new-password"
              spellCheck={false}
            />
          </div>

          <div style={{ marginTop: 14 }}>
            <label className="itp-label">Paste JSON (name + score=strokes)</label>
            <textarea
              className="itp-input"
              style={{ minHeight: 220, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="itp-muted" style={{ marginTop: 8 }}>
              Example row: {"{ \"name\": \"carteryeomans3\", \"score\": 33 }"} • Round displays like +4 / -7 automatically.
            </div>
          </div>

          <button
            type="button"
            onClick={runImport}
            disabled={running}
            className={`itp-btn ${running ? "isDisabled" : ""}`}
            style={{ marginTop: 14, maxWidth: 420 }}
          >
            {running ? "Importing..." : "🚀 Import into Leaderboard DB"}
          </button>

          <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span className="itp-badgeMuted">✅ Imported: {okCount}</span>
            <span className="itp-badgeMuted">❌ Failed: {failCount}</span>
          </div>
        </div>

        <div className="itp-panel">
          <h3 className="itp-sectionTitle" style={{ marginTop: 0 }}>
            Import Log
          </h3>
          <div style={{ maxHeight: 320, overflow: "auto" }}>
            {log.length === 0 ? (
              <p className="itp-muted">Nothing yet.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {log.map((x, idx) => (
                  <li key={idx} style={{ marginBottom: 6 }}>
                    {x}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="itp-footerRow">
          <Link href="/leaderboard" className="itp-link">
            View Public Leaderboard →
          </Link>
        </div>
      </div>
    </main>
  );
}
