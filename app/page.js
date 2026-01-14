"use client";

import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleCheckIn() {
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.status || "error");
        return;
      }

      setStatus(data.status);
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 500, margin: "0 auto" }}>
      <h1>In The Pitts Disc Golf</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        style={{ width: "100%", padding: "0.5rem", marginTop: "1rem" }}
      />

      <button
        onClick={handleCheckIn}
        disabled={loading}
        style={{ marginTop: "1rem", width: "100%" }}
      >
        {loading ? "Checking in..." : "Check In"}
      </button>

      {status === "checked-in" && (
        <p style={{ color: "green", marginTop: "1rem" }}>
          ✅ Checked in successfully
        </p>
      )}

      {status === "expired" && (
        <p style={{ color: "red", marginTop: "1rem" }}>
          ❌ Membership expired
        </p>
      )}

      {status === "not-member" && (
        <p style={{ marginTop: "1rem" }}>
          ❌ Not on the member list
        </p>
      )}

      {status === "error" && (
        <p style={{ color: "red", marginTop: "1rem" }}>
          ❌ Something went wrong
        </p>
      )}
    </main>
  );
}

