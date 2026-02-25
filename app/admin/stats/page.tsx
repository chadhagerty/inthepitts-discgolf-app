"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const DEFAULT_KEYS = [
  "sponsorsCount",
  "roundsPlayed",
  "treesHit",
  "aceCount",
  "courseHoles",
  "coursePar",
];

export default function AdminStatsPage() {
  const [key, setKey] = useState("");
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [editKey, setEditKey] = useState("sponsorsCount");
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ADMIN_KEY") || "";
    if (saved) setKey(saved);
  }, []);

  const sortedKeys = useMemo(() => {
    const all = new Set([...DEFAULT_KEYS, ...Object.keys(overrides || {})]);
    return Array.from(all).sort();
  }, [overrides]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${key}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "load failed");
      setOverrides(json?.overrides || {});
      localStorage.setItem("ADMIN_KEY", key);
    } catch (e: any) {
      alert(e?.message || "load failed");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!editKey.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: editKey.trim(), value: editValue }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "save failed");
      await load();
      alert("Saved ✅");
    } catch (e: any) {
      alert(e?.message || "save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Admin: Stats</h1>

      <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/admin/members" style={{ textDecoration: "underline" }}>
          Members
        </Link>
        <Link href="/admin/checkins" style={{ textDecoration: "underline" }}>
          Check-ins
        </Link>
        <Link href="/stats" style={{ textDecoration: "underline" }}>
          Public Stats
        </Link>
        <Link href="/" style={{ textDecoration: "underline" }}>
          Home
        </Link>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: "block", marginBottom: 6, fontWeight: 800 }}>
          Admin Key
        </label>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="chad-super-secret-2026-01"
          style={{ padding: "0.5rem", width: "100%", maxWidth: 420 }}
        />
        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={load} disabled={loading || !key.trim()}>
            {loading ? "Loading..." : "Load overrides"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 18, border: "1px solid #e5e5e5", borderRadius: 14, padding: 14 }}>
        <h2 style={{ marginTop: 0 }}>Edit a stat</h2>

        <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
          <label style={{ fontWeight: 800 }}>Key</label>
          <select
            value={editKey}
            onChange={(e) => {
              const k = e.target.value;
              setEditKey(k);
              setEditValue(overrides?.[k] ?? "");
            }}
            style={{ padding: 10, borderRadius: 10 }}
          >
            {sortedKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>

          <label style={{ fontWeight: 800 }}>Value</label>
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="number (ex: 12)"
            style={{ padding: 10, borderRadius: 10 }}
          />

          <button onClick={save} disabled={loading || !key.trim()}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h2>Current overrides</h2>
        {Object.keys(overrides || {}).length === 0 ? (
          <p style={{ opacity: 0.7 }}>None yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {Object.entries(overrides).map(([k, v]) => (
              <div
                key={k}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ fontWeight: 900 }}>{k}</div>
                <div style={{ fontWeight: 900 }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
