"use client";

import { useState } from "react";

export default function CheckInPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleCheckIn() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ ok: false, status: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "3rem 1rem" }}>
      <h1 style={{ textAlign: "center" }}>In The Pitts Disc Golf</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        style={{ width: "100%", padding: "0.75rem", marginTop: "1rem" }}
      />

      <button
        onClick={handleCheckIn}
        disabled={loading}
        style={{ marginTop: "1rem", width: "100%", padding: "0.75rem" }}
      >
        {loading ? "Checking in..." : "Check In"}
      </button>

      {result?.status === "checked-in" && (
        <p style={{ color: "green", marginTop: "1rem" }}>
          ✅ Checked in: {result.member?.name}
        </p>
      )}

      {result?.status === "expired" && (
        <p style={{ color: "red", marginTop: "1rem" }}>❌ Membership expired.</p>
      )}

      {result?.status === "not-member" && (
        <p style={{ marginTop: "1rem" }}>❌ Not on the member list.</p>
      )}

      {result?.status === "error" && (
        <p style={{ color: "red", marginTop: "1rem" }}>❌ Something went wrong.</p>
      )}
    </main>
  );
}
