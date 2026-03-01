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
          hole: hole || null,
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
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background:
          "radial-gradient(1200px 600px at 20% 0%, rgba(34,197,94,0.22), transparent 60%), radial-gradient(900px 500px at 90% 20%, rgba(16,185,129,0.18), transparent 55%), linear-gradient(180deg, #0b1b13, #0b1220)",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.06)",
          borderRadius: 18,
          padding: 20,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Bigger logo */}
            <img
              src="/logo.png"
              alt="In The Pitts"
              draggable={false}
              style={{
                width: 70,
                height: 70,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.2)",
              }}
            />

            {/* Disc icon + title */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 26 }}>🥏</span>
              <div>
                <h1 style={{ margin: 0, color: "#eafff2" }}>Check In</h1>
                <div style={{ color: "rgba(234,255,242,0.75)", fontWeight: 700 }}>
                  {hole ? `You’re tapping in for Hole ${hole}.` : "You’re tapping in for the course."}
                </div>
              </div>
            </div>
          </div>

          <Link href="/" style={{ textDecoration: "underline", color: "#eafff2", fontWeight: 800 }}>
            ← Home
          </Link>
        </div>

        {/* BODY */}
        <div
          style={{
            marginTop: 16,
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 14,
            background: "rgba(0,0,0,0.18)",
            padding: 16,
          }}
        >
          <label style={{ display: "block", fontWeight: 900, color: "#eafff2" }}>
            Email used when you registered or paid
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
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              marginTop: 8,
              background: "rgba(255,255,255,0.06)",
              color: "#eafff2",
              outline: "none",
            }}
          />

          <button
            onClick={submit}
            disabled={loading || !email.trim()}
            style={{
              marginTop: 14,
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: loading || !email.trim()
                ? "rgba(255,255,255,0.10)"
                : "rgba(34,197,94,0.25)",
              color: "#eafff2",
              fontWeight: 900,
              fontSize: 18,
              cursor: loading || !email.trim() ? "default" : "pointer",
            }}
          >
            {loading ? "Tapping..." : "Tap In 🥏"}
          </button>

          {status && (
            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: status.ok
                  ? "rgba(34,197,94,0.16)"
                  : "rgba(239,68,68,0.16)",
                color: status.ok ? "#d1fae5" : "#fee2e2",
                fontWeight: 800,
              }}
            >
              <div>{status.msg}</div>
              {status.ok && status.member?.name && (
                <div style={{ marginTop: 6 }}>
                  {status.member.name} ({status.member.membership})
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
