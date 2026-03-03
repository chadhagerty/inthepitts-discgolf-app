"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const PAR_RED = 40;
const PAR_BLUE = 37;

function parForTee(tee) {
  return tee === "blue" ? PAR_BLUE : PAR_RED;
}

function formatRound(strokes, tee) {
  const diff = Number(strokes) - parForTee(tee);
  if (!Number.isFinite(diff)) return "—";
  if (diff === 0) return "E";
  if (diff > 0) return `+${diff}`;
  return `${diff}`;
}

function relativeScoreFromStrokes(strokes, tee) {
  const diff = Number(strokes) - parForTee(tee);
  return Number.isFinite(diff) ? diff : 0;
}

const EMPTY_FORM = {
  name: "",
  strokes: 33, // raw strokes total (ex: 33)
  aces: 0,
  date: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
  notes: "",
};

function Badge({ children }) {
  return (
    <span
      className="itp-badgeMuted"
      style={{
        background: "rgba(245,158,11,0.14)",
        borderColor: "rgba(0,0,0,0.12)",
      }}
    >
      {children}
    </span>
  );
}
export default function AdminLeaderboardPage() {
  const [key, setKey] = useState("");
  const [tee, setTee] = useState("red");
  const [entries, setEntries] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // mode: "add" | "edit" | null
  const [mode, setMode] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const canAuth = useMemo(() => key.trim().length > 0, [key]);

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function load() {
    setErr("");
    setOkMsg("");
    setLoadingList(true);
    try {
      const res = await fetch(`/api/leaderboard?tee=${tee}&take=200`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load leaderboard");
      setEntries(Array.isArray(data?.entries) ? data.entries : []);
    } catch (e) {
      setEntries([]);
      setErr(e?.message || "Failed to load leaderboard");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    load();
    // switching tee resets any active add/edit
    setMode(null);
    setEditingId(null);
    setForm((f) => ({ ...EMPTY_FORM, strokes: f.strokes }));
  }, [tee]);

  function resetFormForMode(nextMode) {
    setErr("");
    setOkMsg("");
    setMode(nextMode);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function startAdd() {
    resetFormForMode("add");
  }

  function startEdit(e) {
    setErr("");
    setOkMsg("");
    setMode("edit");
    setEditingId(e.id);

    setForm({
      name: e.name || "",
      strokes: Number.isFinite(e.strokes) ? e.strokes : 0,
      aces: Number.isFinite(e.aces) ? e.aces : 0,
      date: String(e.date || "").slice(0, 10) || new Date().toISOString().slice(0, 10),
      notes: e.notes || "",
    });
  }

  function cancelMode() {
    setMode(null);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function addEntry() {
    if (!canAuth) return setErr("Paste ADMIN_KEY first.");
    const cleanName = String(form.name || "").trim();
    const strokes = Number(form.strokes);

    if (!cleanName) return setErr("Player name is required.");
    if (!Number.isFinite(strokes)) return setErr("Strokes must be a number.");

    setSaving(true);
    setErr("");
    setOkMsg("");

    try {
      const payload = {
        name: cleanName,
        tee,
        strokes: Math.trunc(strokes),
        score: relativeScoreFromStrokes(strokes, tee), // stored relative-to-par
        aces: Math.trunc(Number(form.aces || 0)),
        date: String(form.date || "").slice(0, 10),
        notes: String(form.notes || "").trim(),
      };

      const res = await fetch(`/api/leaderboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key.trim()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Add failed");

      setOkMsg("Added ✅");
      setForm(EMPTY_FORM);
      await load();
    } catch (e) {
      setErr(e?.message || "Add failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit() {
    if (!editingId) return;
    if (!canAuth) return setErr("Paste ADMIN_KEY first.");

    const cleanName = String(form.name || "").trim();
    const strokes = Number(form.strokes);

    if (!cleanName) return setErr("Player name is required.");
    if (!Number.isFinite(strokes)) return setErr("Strokes must be a number.");

    setSaving(true);
    setErr("");
    setOkMsg("");

    try {
      const payload = {
        name: cleanName,
        tee,
        strokes: Math.trunc(strokes),
        score: relativeScoreFromStrokes(strokes, tee),
        aces: Math.trunc(Number(form.aces || 0)),
        date: String(form.date || "").slice(0, 10),
        notes: String(form.notes || "").trim(),
      };

      const res = await fetch(`/api/leaderboard/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key.trim()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Save failed");

      setOkMsg("Updated ✅");
      cancelMode();
      await load();
    } catch (e) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function delEntry(id) {
    if (!canAuth) return setErr("Paste ADMIN_KEY first.");
    if (!confirm("Delete this entry?")) return;

    setErr("");
    setOkMsg("");

    try {
      const res = await fetch(`/api/leaderboard/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${key.trim()}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Delete failed");

      setOkMsg("Deleted ✅");
      if (editingId === id) cancelMode();
      await load();
    } catch (e) {
      setErr(e?.message || "Delete failed");
    }
  }

  const isAdd = mode === "add";
  const isEdit = mode === "edit";

  return (
    <main className="itp-page">
      <div className="itp-card itp-cardWide">

        {/* HEADER */}
        <div className="itp-headerRow">
          <h1 className="itp-title">Admin Leaderboard</h1>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/admin" className="itp-link">← Admin HQ</Link>
            <Link href="/" className="itp-link">Home</Link>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="itp-panel">

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setTee("red")} className="itp-btnSecondary">🔴 Red</button>
            <button onClick={() => setTee("blue")} className="itp-btnSecondary">🔵 Blue</button>
          </div>

          <p className="itp-muted">Par: {parForTee(tee)}</p>

          <input
            type="password"
            placeholder="Paste ADMIN_KEY"
            className="itp-input"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button onClick={startAdd} className="itp-btn">➕ Add Entry</button>
            <button onClick={cancelMode} className="itp-btnSecondary">Cancel</button>
            <button onClick={load} className="itp-btnSecondary">Refresh</button>
          </div>
        </div>

        {/* FORM */}
        {mode && (
          <div className="itp-panel">
            <input
              className="itp-input"
              placeholder="Player Name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
            />

            <input
              className="itp-input"
              placeholder="Score (strokes total)"
              value={form.strokes}
              onChange={(e) => setField("strokes", e.target.value)}
            />

            <p className="itp-muted">
              Round: <b>{formatRound(form.strokes, tee)}</b>
            </p>

            <button
              className="itp-btn"
              onClick={isAdd ? addEntry : saveEdit}
            >
              {isAdd ? "Add Entry" : "Save Changes"}
            </button>

            {okMsg && <p style={{ color: "green" }}>{okMsg}</p>}
            {err && <p style={{ color: "red" }}>{err}</p>}
          </div>
        )}

        {/* TABLE */}
        <div className="itp-panel">
          {entries.length === 0 ? (
            <p>No entries</p>
          ) : (
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Score</th>
                  <th>Round</th>
                  <th>Aces</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {entries.map((e, i) => (
                  <tr key={e.id || i}>
                    <td>{i + 1}</td>
                    <td>{e.name}</td>
                    <td>{e.strokes}</td>
                    <td><b>{formatRound(e.strokes, tee)}</b></td>
                    <td>{e.aces}</td>
<td>
  <button
    type="button"
    className="itp-btnSecondary"
    onClick={() => {
      alert(`Deleting id: ${e?.id}`);      // TEMP proof
      delEntry(e?.id);                    // MUST be e.id
    }}
  >
    Delete
  </button>
  <button
    type="button"
    onClick={() => startEdit(e)}
    className="itp-btnSecondary"
  >
    Edit
  </button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </main>
  );
}
