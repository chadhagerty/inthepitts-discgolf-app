"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CheckInClient() {
  const sp = useSearchParams();
  const hole = sp.get("hole") || "";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const holeLabel = useMemo(() => (hole ? `Hole ${hole}` : "Course"), [hole]);

  async function submit() {
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          source: hole ? "qr" : "manual",
          hole: hole || null, // accepted by API (not stored yet)
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Check-in failed");
      }

      setStatus({
        ok: true,
        msg: data?.message || "Checked in!",
        member: data?.member || null,
      });
    } catch (e) {
      setStatus({ ok: false, msg: e?.message || "Check-in failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Check In</h1>

      <p style={{ color: "#555" }}>
        You’re checking in for <b>{holeLabel}</b>.
      </p>

      <label style={{ display: "block", marginTop: 16, fontWeight: 700 }}>
        Email used for membership / day pass
      </label>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="johndoe@gmail.com"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ccc",
          marginTop: 8,
        }}
      />

      <button
        onClick={submit}
        disabled={loading || !email.trim()}
        style={{
          marginTop: 14,
          width: "100%",
          padding: 12,
          borderRadius: 12,
          border: "1px solid #111",
          background: loading ? "#eee" : "#111",
          color: loading ? "#111" : "#fff",
          fontWeight: 800,
          cursor: loading ? "default" : "pointer",
        }}
      >
        {loading ? "Checking..." : "Check In"}
      </button>

      {status && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            border: "1px solid #ddd",
            background: status.ok ? "#ecfdf5" : "#fef2f2",
            color: status.ok ? "#065f46" : "#991b1b",
            fontWeight: 700,
          }}
        >
          <div>{status.msg}</div>

          {status.ok && status.member?.name && (
            <div style={{ marginTop: 6, fontWeight: 600, opacity: 0.9 }}>
              {status.member.name} ({status.member.membership})
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <Link href="/" style={{ textDecoration: "underline" }}>
          ← Home
        </Link>
      </div>
    </main>
  );
}
