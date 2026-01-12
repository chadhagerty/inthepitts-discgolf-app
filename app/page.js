
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function CheckIn() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { ok, status, member?, error? }

  async function handleCheckIn() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setResult({ ok: false, status: "error", error: data?.error || "server-error" });
        return;
      }

      setResult(data); // expected: { ok:true, status:"checked-in"|"expired"|"not-member", member? }
    } catch (err) {
      console.error("CHECK-IN CLIENT ERROR:", err);
      setResult({ ok: false, status: "error", error: "network-error" });
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

      <br />
      <br />

      <button onClick={handleCheckIn} disabled={loading || !name.trim()}>
        {loading ? "Checking..." : "Check In"}
      </button>

      {result?.ok && result?.status === "checked-in" && (
        <p style={{ color: "green", marginTop: "1rem" }}>
          ✅ Welcome back{result?.member?.name ? `, ${result.member.name}` : ""}! You’re checked in.
        </p>
      )}

      {result?.ok && result?.status === "expired" && (
        <div style={{ marginTop: "1rem" }}>
          <p style={{ color: "red" }}>❌ Membership expired. Please renew.</p>
          <p>Yearly Membership: <strong>$100</strong></p>
          <p>Pay by e-transfer: <strong>inthepittsdiscgolf@gmail.com</strong></p>
        </div>
      )}

      {result?.ok && result?.status === "not-member" && (
        <div style={{ marginTop: "1rem" }}>
          <p>Not on the member list yet.</p>
          <p>Day Pass: <strong>$10</strong></p>
          <p>Yearly Membership: <strong>$100</strong></p>
          <p>Pay by e-transfer: <strong>inthepittsdiscgolf@gmail.com</strong></p>
        </div>
      )}

      {result?.status === "error" && (
        <p style={{ color: "red", marginTop: "1rem" }}>
          ❌ Something went wrong. ({result?.error || "error"})
        </p>
      )}
    </section>
  );
}

export default function Page() {
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
