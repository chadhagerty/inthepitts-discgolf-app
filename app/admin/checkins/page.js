"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function fmt(d) {
  try {
    return new Date(d).toLocaleString("en-CA", { timeZone: "America/Toronto" });
  } catch {
    try {
      return new Date(d).toLocaleString();
    } catch {
      return String(d);
    }
  }
}

export default function AdminCheckinsPage() {
  const [key, setKey] = useState("");
  const [data, setData] = useState(null); // { ok, count, checkIns } or { ok:false, error }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ADMIN_KEY") || "";
    if (saved) setKey(saved);
  }, []);

  async function load() {
    setLoading(true);
    setData(null);

    try {
      const res = await fetch("/api/checkins", {
        headers: { Authorization: `Bearer ${key}` },
      });

      const json = await res.json().catch(() => ({}));
      setData(json);
      localStorage.setItem("ADMIN_KEY", key);
    } catch {
      setData({ ok: false, error: "network-error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background:
          "radial-gradient(1200px 600px at 20% 0%, rgba(34,197,94,0.20), transparent 60%), radial-gradient(900px 500px at 90% 20%, rgba(16,185,129,0.18), transparent 55%), linear-gradient(180deg, #0b1b13, #0b1220)",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.06)",
          borderRadius: 18,
          padding: 18,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src="/logo.png"
              alt="In The Pitts"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.2)",
              }}
            />
            <div>
              <h1 style={{ margin: 0, color: "#eafff2" }}>Admin: Check-ins</h1>
              <div
                style={{
                  marginTop: 4,
                  color: "rgba(234,255,242,0.75)",
                  fontWeight: 700,
                }}
              >
                {data?.ok ? `Total loaded: ${data.count}` : "Load recent check-ins"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/admin"
              style={{
                textDecoration: "underline",
                color: "#eafff2",
                fontWeight: 800,
              }}
            >
              ← Admin HQ
            </Link>
            <Link
              href="/"
              style={{
                textDecoration: "underline",
                color: "rgba(234,255,242,0.85)",
                fontWeight: 800,
              }}
            >
              Home
            </Link>
          </div>
        </div>

        {/* KEY + ACTIONS */}
        <div
          style={{
            marginTop: 14,
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 14,
            background: "rgba(0,0,0,0.18)",
            padding: 14,
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: 900,
              color: "#eafff2",
            }}
          >
            Admin Key (paste exactly)
          </label>

          {/* Autofill-proof-ish: turn off autocomplete + unique name */}
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Paste ADMIN_KEY"
            autoComplete="new-password"
            name="admin_key_no_autofill"
            spellCheck={false}
            style={{
              width: "100%",
              maxWidth: 520,
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.08)",
              color: "#eafff2",
              outline: "none",
            }}
          />

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={load}
              disabled={loading || !key.trim()}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: loading || !key.trim() ? "rgba(255,255,255,0.08)" : "rgba(34,197,94,0.18)",
                color: "#eafff2",
                fontWeight: 900,
                cursor: loading || !key.trim() ? "default" : "pointer",
              }}
            >
              {loading ? "Loading..." : "Load check-ins"}
            </button>

            <Link
              href="/admin/members"
              style={{
                display: "inline-block",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.08)",
                color: "#eafff2",
                fontWeight: 900,
                textDecoration: "none",
              }}
            >
              Members →
            </Link>
          </div>
        </div>

        {/* ERROR */}
        {data?.ok === false && (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(239,68,68,0.35)",
              background: "rgba(239,68,68,0.12)",
              color: "#fee2e2",
              fontWeight: 900,
            }}
          >
            ❌ {data?.error || "unauthorized"}
          </div>
        )}

        {/* LIST */}
        {data?.ok && (
          <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
            {(data.checkIns || []).map((c) => (
              <div
                key={c.id}
                style={{
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.06)",
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900, color: "#eafff2" }}>
                    {c.member?.name || "Unknown"}
                    <span style={{ marginLeft: 8, opacity: 0.8, fontWeight: 800 }}>
                      ({c.source})
                    </span>
                  </div>
                  <div style={{ color: "rgba(234,255,242,0.75)", fontWeight: 800 }}>
                    {fmt(c.createdAt)}
                  </div>
                </div>

                {c.member?.email ? (
                  <div style={{ marginTop: 6, color: "rgba(234,255,242,0.8)" }}>
                    {c.member.email}
                  </div>
                ) : null}
              </div>
            ))}

            {data.count === 0 && (
              <div style={{ opacity: 0.8, color: "#eafff2" }}>No check-ins yet.</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
