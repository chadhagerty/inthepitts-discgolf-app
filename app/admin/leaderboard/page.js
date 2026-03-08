"use client";


import { useEffect, useMemo, useState } from "react";
import Link from "next/link";


const LAYOUTS = [
  { key: "red-12", label: "🔴 Red 12", par: 40 },
  { key: "blue-12", label: "🔵 Blue 12", par: 37 },
  { key: "red-18", label: "🔴 Red 18", par: 63 },
  { key: "blue-18", label: "🔵 Blue 18", par: 58 },
];


const EMPTY_FORM = {
  name: "",
  strokes: 33,
  aces: 0,
  date: new Date().toISOString().slice(0, 10),
  notes: "",
};


function getLayoutMeta(layout) {
  return LAYOUTS.find((x) => x.key === layout) || LAYOUTS[0];
}


function teeFromLayout(layout) {
  return layout.startsWith("blue") ? "blue" : "red";
}


function formatScore(score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "E";
  if (n > 0) return `+${n}`;
  return `${n}`;
}


function relativeScoreFromStrokes(strokes, layout) {
  const meta = getLayoutMeta(layout);
  const diff = Number(strokes) - meta.par;
  return Number.isFinite(diff) ? diff : 0;
}


export default function AdminLeaderboardPage() {
  const [key, setKey] = useState("");
  const [layout, setLayout] = useState("red-12");
  const [entries, setEntries] = useState([]);
  const [loadingList, setLoadingList] = useState(true);


  const [mode, setMode] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);


  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");


  const canAuth = useMemo(() => key.trim().length > 0, [key]);
  const meta = useMemo(() => getLayoutMeta(layout), [layout]);


  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }


  async function load() {
    setErr("");
    setOkMsg("");
    setLoadingList(true);


    try {
      const res = await fetch(`/api/leaderboard?layout=${layout}&take=200`, {
        cache: "no-store",
      });


      const data = await res.json().catch(() => ({}));


      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to load leaderboard");
      }


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
    setMode(null);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }, [layout]);


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


  function startEdit(entry) {
    setErr("");
    setOkMsg("");
    setMode("edit");
    setEditingId(entry.id);


    setForm({
      name: entry.name || "",
      strokes: Number.isFinite(entry.strokes) ? entry.strokes : 0,
      aces: Number.isFinite(entry.aces) ? entry.aces : 0,
      date: String(entry.date || "").slice(0, 10) || new Date().toISOString().slice(0, 10),
      notes: entry.notes || "",
    });
  }


  function cancelMode() {
    setMode(null);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }


  async function addEntry() {
    if (!canAuth) {
      setErr("Paste ADMIN_KEY first.");
      return;
    }


    const cleanName = String(form.name || "").trim();
    const strokes = Number(form.strokes);


    if (!cleanName) {
      setErr("Player name is required.");
      return;
    }


    if (!Number.isFinite(strokes)) {
      setErr("Strokes must be a number.");
      return;
    }


    setSaving(true);
    setErr("");
    setOkMsg("");


    try {
      const payload = {
        name: cleanName,
        layout,
        tee: teeFromLayout(layout),
        strokes: Math.trunc(strokes),
        score: relativeScoreFromStrokes(strokes, layout),
        aces: Math.trunc(Number(form.aces || 0)),
        date: String(form.date || "").slice(0, 10),
        notes: String(form.notes || "").trim(),
      };


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
        throw new Error(data?.error || "Add failed");
      }


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


    if (!canAuth) {
      setErr("Paste ADMIN_KEY first.");
      return;
    }


    const cleanName = String(form.name || "").trim();
    const strokes = Number(form.strokes);


    if (!cleanName) {
      setErr("Player name is required.");
      return;
    }


    if (!Number.isFinite(strokes)) {
      setErr("Strokes must be a number.");
      return;
    }


    setSaving(true);
    setErr("");
    setOkMsg("");


    try {
      const payload = {
        name: cleanName,
        layout,
        tee: teeFromLayout(layout),
        strokes: Math.trunc(strokes),
        score: relativeScoreFromStrokes(strokes, layout),
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


      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Save failed");
      }


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
    if (!canAuth) {
      setErr("Paste ADMIN_KEY first.");
      return;
    }


    if (!confirm("Delete this entry?")) return;


    setErr("");
    setOkMsg("");


    try {
      const res = await fetch(`/api/leaderboard/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${key.trim()}`,
        },
      });


      const data = await res.json().catch(() => ({}));


      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Delete failed");
      }


      setOkMsg("Deleted ✅");


      if (editingId === id) {
        cancelMode();
      }


      await load();
    } catch (e) {
      setErr(e?.message || "Delete failed");
    }
  }


  function tabStyle(active) {
    return {
      padding: "10px 12px",
      borderRadius: 999,
      border: "1px solid rgba(0,0,0,0.18)",
      background: active ? "rgba(245,158,11,0.22)" : "rgba(255,255,255,0.85)",
      fontWeight: 1000,
      cursor: active ? "default" : "pointer",
    };
  }


  const isAdd = mode === "add";
  const isEdit = mode === "edit";


  return (
    <main className="itp-page">
      <div className="itp-card itp-cardWide">
        <div className="itp-headerRow">
          <h1 className="itp-title">Admin Leaderboard</h1>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/admin" className="itp-link">
              ← Admin HQ
            </Link>
            <Link href="/" className="itp-link">
              Home
            </Link>
          </div>
        </div>


        <div className="itp-panel">
          <div style={{ marginBottom: 10 }}>
            <div className="itp-label" style={{ marginBottom: 8 }}>
              Layout
            </div>


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
          </div>


          <p className="itp-muted">Par: {meta.par}</p>


          <input
            type="password"
            placeholder="Paste ADMIN_KEY"
            className="itp-input"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />


          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <button onClick={startAdd} className="itp-btn">
              ➕ Add Entry
            </button>
            <button onClick={cancelMode} className="itp-btnSecondary">
              Cancel
            </button>
            <button onClick={load} className="itp-btnSecondary">
              Refresh
            </button>
          </div>
        </div>


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
              placeholder="Strokes total"
              value={form.strokes}
              onChange={(e) => setField("strokes", e.target.value)}
            />


            <input
              className="itp-input"
              placeholder="Aces"
              value={form.aces}
              onChange={(e) => setField("aces", e.target.value)}
            />


            <input
              className="itp-input"
              type="date"
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
            />


            <input
              className="itp-input"
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
            />


            <p className="itp-muted">
              Score: <b>{formatScore(relativeScoreFromStrokes(form.strokes, layout))}</b>
            </p>


            <button
              className="itp-btn"
              onClick={isAdd ? addEntry : saveEdit}
              disabled={saving}
            >
              {saving ? "Saving..." : isAdd ? "Add Entry" : "Save Changes"}
            </button>


            {okMsg && <p style={{ color: "green" }}>{okMsg}</p>}
            {err && <p style={{ color: "red" }}>{err}</p>}
          </div>
        )}


        <div className="itp-panel">
          {loadingList ? (
            <p>Loading...</p>
          ) : entries.length === 0 ? (
            <p>No entries</p>
          ) : (
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Strokes</th>
                  <th>Score</th>
                  <th>Aces</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>


              <tbody>
                {entries.map((entry, i) => (
                  <tr key={entry.id || i}>
                    <td>{i + 1}</td>
                    <td>{entry.name}</td>
                    <td>{entry.strokes}</td>
                    <td>
                      <b>{formatScore(entry.score)}</b>
                    </td>
                    <td>{entry.aces}</td>
                    <td>{String(entry.date || "").slice(0, 10)}</td>
                    <td>
                      <button
                        type="button"
                        className="itp-btnSecondary"
                        onClick={() => delEntry(entry.id)}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        className="itp-btnSecondary"
                        onClick={() => startEdit(entry)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}


          {okMsg && !mode && <p style={{ color: "green" }}>{okMsg}</p>}
          {err && !mode && <p style={{ color: "red" }}>{err}</p>}
        </div>
      </div>
    </main>
  );
}
