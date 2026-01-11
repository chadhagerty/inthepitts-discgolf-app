"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function CheckIn() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleCheckIn() {
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, source: "manual" }),
      });

      const data = await res.json();
      setResult({ ok: res.ok, ...data });
    } catch {
      setResult({ ok: false, status: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ padding: "2rem", borderTop: "1px solid #ddd" }}>
      <h2>Course Check-In</h2>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        style={{ padding: "0.5rem", maxWidth: "320px", width: "100%" }}
      />

      <br /><br />

      <button onClick={handleCheckIn} disabled={loading}>
        {loading ? "Checking..." : "Check In"}
      </button>

      {result?.status === "checked-in" && (
        <p style={{ color: "green", marginTop: "1rem" }}>
          ✅ Welcome back, {result.member?.name}! You’re checked in.
        </p>
      )}

      {result?.status === "expired" && (
        <div style={{ marginTop: "1rem" }}>
          <p style={{ color: "red" }}>❌ Membership expired. Please renew.</p>
          <p>Yearly Membership: <strong>$100</strong></p>
          <p>Pay by e-transfer: <strong>inthepittsdiscgolf@gmail.com</strong></p>
        </div>
      )}

      {result?.status === "not-member" && (
        <div style={{ marginTop: "1rem" }}>
          <p>Not on the member list yet.</p>
          <p>Day Pass: <strong>$10</strong></p>
          <p>Yearly Membership: <strong>$100</strong></p>
          <p>Pay by e-transfer: <strong>inthepittsdiscgolf@gmail.com</strong></p>
        </div>
      )}

      {result?.status === "error" && (
        <p style={{ color: "red", marginTop: "1rem" }}>
          ❌ Something went wrong. Try again.
        </p>
      )}
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <section style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <Image src="/logo.png" alt="Logo" width={140} height={140} />
        <h1>In The Pitts Disc Golf Course</h1>

        <p style={{ maxWidth: 800, margin: "1rem auto" }}>
          A well-rounded 18-hole disc golf experience featuring tight wooded challenges,
          wide-open distance shots, and a fun atmosphere with wildlife — including a friendly
          donkey midway through your round.
        </p>

        <div style={{ marginTop: "1.5rem" }}>
          <Link href="/course">
            <button>Hole Layout</button>
          </Link>
        </div>
      </section>

      <CheckIn />
    </main>
  );
}

