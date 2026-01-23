"use client";

import { useEffect, useState } from "react";

export default function CheckinPage() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState(null); // {ok, message} or {ok:false,error}

  async function checkIn() {
    setStatus(null);
    const n = name.trim();
    if (!n) return;

    try {
      // NOTE: this assumes your existing check-in endpoint is /api/checkin or similar.
      // If your current homepage uses a different endpoint, tell me the exact fetch URL
      // and I’ll match it exactly.
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n }),
      });

      const json = await res.json().catch(() => ({}));
      setStatus(json);
    } catch (e) {
      setStatus({ ok: false, error: "network-error" });
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href="/" style={{ textDecoration: "underline" }}>← Dashboard</a>
        <a href="/passes" style={{ textDecoration: "underline" }}>Passes</a>
        <a href="/links" style={{ textDecoration: "underline" }}>Links</a>
      </div>

      <h1 style={{ marginTop: 16 }}>Course Check-In</h1>

      <div style={{ marginTop: 14 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Your name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          style={{ padding: "0.6rem", width: "100%", maxWidth: 420 }}
        />
        <div style={{ marginTop: 10 }}>
          <button onClick={checkIn} disabled={!name.trim()}>
            Check In
          </button>
        </div>
      </div>

      {/* This is generic display. If your API returns different fields, we’ll tweak it. */}
      {status?.ok === false && (
        <p style={{ color: "crimson", marginTop: 14 }}>❌ {status.error || "Error"}</p>
      )}
      {status?.ok && (
        <p style={{ color: "green", marginTop: 14 }}>✅ {status.message || "Welcome!"}</p>
      )}
      {!status && (
        <p style={{ marginTop: 14, opacity: 0.8 }}>Not on the member list yet.</p>
      )}
    </main>
  );
}
