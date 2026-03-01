"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
type Stats = {
  roundsPlayed: number;
  uniquePlayers: number;
  aces: number;
  eagles: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubleBogeysPlus: number;
  donationsTotal: number;
  courseRecord: string;
};
const NUM_FIELDS: (keyof Stats)[] = [
  "roundsPlayed",
  "uniquePlayers",
  "aces",
  "eagles",
  "birdies",
  "pars",
  "bogeys",
  "doubleBogeysPlus",
  "donationsTotal",
];
const LABELS: Record<keyof Stats, string> = {
  roundsPlayed: "Rounds played",
  uniquePlayers: "Unique players",
  aces: "Aces",
  eagles: "Eagles",
  birdies: "Birdies",
  pars: "Pars",
  bogeys: "Bogeys",
  doubleBogeysPlus: "Double+ Bogeys",
  donationsTotal: "Donations total",
  courseRecord: "Course record",
};
const DEFAULTS: Stats = {
  roundsPlayed: 0,
  uniquePlayers: 0,
  aces: 0,
  eagles: 0,
  birdies: 0,
  pars: 0,
  bogeys: 0,
  doubleBogeysPlus: 0,
  donationsTotal: 0,
  courseRecord: "",
};
function CardWrap({ children }: { children: any }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 16,
        padding: 14,
        background: "rgba(0,0,0,0.18)",
        backdropFilter: "blur(10px)",
      }}
    >
      {children}
    </div>
  );
}
export default function AdminStatsPage() {
  const [adminKey, setAdminKey] = useState("");
  const [stats, setStats] = useState<Stats>(DEFAULTS);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  async function load() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load stats");
      setStats({ ...DEFAULTS, ...(data.stats || {}) });
      setLastUpdated(data.lastUpdated || null);
    } catch (e: any) {
      setStatus({ ok: false, msg: e?.message || "Failed to load" });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    // remember admin key for phone convenience
    const saved = localStorage.getItem("ADMIN_KEY") || "";
    if (saved) setAdminKey(saved);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const canSave = useMemo(() => adminKey.trim().length > 0, [adminKey]);
  function setNum(k: keyof Stats, v: string) {
    const n = Number(v);
    setStats((s) => ({ ...s, [k]: Number.isFinite(n) ? n : 0 }));
  }
  async function save() {
    if (!canSave) return;
    setSaving(true);
    setStatus(null);
    try {
      const payload: any = { ...stats };
      for (const k of NUM_FIELDS) payload[k] = Number(payload[k]) || 0;
      const key = adminKey.trim();
      localStorage.setItem("ADMIN_KEY", key);
      const res = await fetch("/api/stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Save failed");
      setStats({ ...DEFAULTS, ...(data.stats || {}) });
      setLastUpdated(data.lastUpdated || null);
      setStatus({ ok: true, msg: "Saved ✅" });
    } catch (e: any) {
      setStatus({ ok: false, msg: e?.message || "Save failed" });
    } finally {
      setSaving(false);
    }
  }
  const prettyUpdated = lastUpdated ? new Date(lastUpdated).toLocaleString() : null;
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background:
          "radial-gradient(1200px 600px at 20% 0%, rgba(34,197,94,0.45), rgba(0,0,0,0.2)), linear-gradient(180deg, #064e3b 0%, #052e23 45%, #031b14 100%)",
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <img
              src="/logo.png"
              alt="In The Pitts"
              width={56}
              height={56}
              style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.25)" }}
              draggable={false}
            />
            <div>
              <h1 style={{ margin: 0 }}>Admin: Stats</h1>
              <div style={{ marginTop: 4, opacity: 0.9, fontWeight: 700 }}>
                Edits update <b>/stats</b>. {prettyUpdated ? <span>(Last updated: {prettyUpdated})</span> : null}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/admin" style={{ textDecoration: "underline", fontWeight: 900, color: "#fff" }}>
              ← Admin HQ
            </Link>
            <Link href="/stats" style={{ textDecoration: "underline", fontWeight: 900, color: "#fff" }}>
              View /stats →
            </Link>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <CardWrap>
            <label style={{ fontWeight: 900, display: "block", marginBottom: 6 }}>
              Admin key (required to save)
            </label>
           <input
  type="text"
  value={adminKey}
  onChange={(e) => setAdminKey(e.target.value)}
  placeholder="Paste ADMIN_KEY"
  autoComplete="new-password"
  name="nope"
  spellCheck={false}
/>


            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              <button
                onClick={save}
                disabled={!canSave || saving}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: !canSave || saving ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.35)",
                  color: "#fff",
                  fontWeight: 900,
                  cursor: !canSave || saving ? "default" : "pointer",
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={load}
                disabled={loading}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.10)",
                  color: "#fff",
                  fontWeight: 900,
                  cursor: loading ? "default" : "pointer",
                }}
              >
                {loading ? "Loading..." : "Reload"}
              </button>
            </div>
            {status && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: status.ok ? "rgba(34,197,94,0.22)" : "rgba(239,68,68,0.22)",
                  color: "#fff",
                  fontWeight: 900,
                }}
              >
                {status.msg}
              </div>
            )}
          </CardWrap>
        </div>
        {loading ? (
          <p style={{ marginTop: 14, opacity: 0.85, fontWeight: 800 }}>Loading…</p>
        ) : (
          <>
            <h2 style={{ marginTop: 18, marginBottom: 10 }}>Course</h2>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {NUM_FIELDS.filter((k) => k !== "donationsTotal").map((k) => (
                <CardWrap key={k as string}>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>{LABELS[k]}</div>
                  <input
                    value={String(stats[k] ?? 0)}
                    onChange={(e) => setNum(k, e.target.value)}
                    inputMode="numeric"
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.25)",
                      background: "rgba(255,255,255,0.08)",
                      color: "#fff",
                      outline: "none",
                      fontWeight: 900,
                    }}
                  />
                </CardWrap>
              ))}
            </div>
            <h2 style={{ marginTop: 22, marginBottom: 10 }}>Extras</h2>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              <CardWrap>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>{LABELS.donationsTotal}</div>
                <input
                  value={String(stats.donationsTotal ?? 0)}
                  onChange={(e) => setNum("donationsTotal", e.target.value)}
                  inputMode="numeric"
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.25)",
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    outline: "none",
                    fontWeight: 900,
                  }}
                />
              </CardWrap>
              <CardWrap>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>{LABELS.courseRecord}</div>
                <input
                  value={stats.courseRecord ?? ""}
                  onChange={(e) => setStats((s) => ({ ...s, courseRecord: e.target.value }))}
                  placeholder="e.g. -12 (Chad, 2026-03-01)"
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.25)",
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    outline: "none",
                    fontWeight: 800,
                  }}
                />
                <div style={{ marginTop: 8, opacity: 0.85, fontWeight: 700, fontSize: 13 }}>
                  Tip: use any format you want — it’s just text.
                </div>
              </CardWrap>
            </div>
            <div style={{ marginTop: 18, opacity: 0.9, fontWeight: 800, fontSize: 13 }}>
              Next: we’ll add <b>player-submitted</b> aces/birdies/etc (with admin approval) so it’s A&B like you want.
            </div>
          </>
        )}
      </div>
    </main>
  );
}

