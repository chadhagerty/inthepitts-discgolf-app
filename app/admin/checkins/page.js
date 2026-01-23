"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    } catch (e) {
      setData({ ok: false, error: "network-error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Admin: Check-ins</h1>

      {/* NAV (clean) */}
      <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/admin/members" style={{ textDecoration: "underline" }}>
          Members
        </Link>
        <Link href="/" style={{ textDecoration: "underline" }}>
          Home
        </Link>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label style={{ display: "block", marginBottom: 6 }}>
          Admin Key (paste exactly)
        </label>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="chad-super-secret-2026-01"
          style={{ padding: "0.5rem", width: "100%", maxWidth: 420 }}
        />
        <div style={{ marginTop: 10 }}>
          <button onClick={load} disabled={loading || !key.trim()}>
            {loading ? "Loading..." : "Load check-ins"}
          </button>
        </div>
      </div>

      {data?.ok === false && (
        <p style={{ color: "red", marginTop: "1rem" }}>
          ❌ {data?.error || "unauthorized"}
        </p>
      )}

      {data?.ok && (
        <div style={{ marginTop: "1.5rem" }}>
          <p>
            <strong>Total:</strong> {data.count}
          </p>

          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {(data.checkIns || []).map((c) => (
              <div
                key={c.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {c.member?.name || "Unknown"} ({c.source})
                </div>
                <div style={{ opacity: 0.8 }}>
                  {new Date(c.createdAt).toLocaleString()}
                </div>
              </div>
            ))}

            {data.count === 0 && (
              <p style={{ opacity: 0.8 }}>No check-ins yet.</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
