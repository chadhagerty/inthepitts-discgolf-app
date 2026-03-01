"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function fmt(d) {
  try {
    return new Date(d).toLocaleString("en-CA", { timeZone: "America/Toronto" });
  } catch {
    return String(d);
  }
}

export default function AdminReviewsPage() {
  const [key, setKey] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ADMIN_KEY") || "";
    if (saved) setKey(saved);
  }, []);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", { cache: "no-store" });
      const data = await res.json();
      setReviews(data?.reviews || []);
    } catch {
      setErr("Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveResponse(id, ownerResponse) {
    localStorage.setItem("ADMIN_KEY", key);

    const res = await fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ ownerResponse }),
    });

    if (!res.ok) {
      setErr("Failed to save response");
      return;
    }
    load();
  }

  async function del(id) {
    if (!confirm("Delete this review?")) return;

    localStorage.setItem("ADMIN_KEY", key);

    const res = await fetch(`/api/reviews/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${key}` },
    });

    if (!res.ok) {
      setErr("Failed to delete review");
      return;
    }
    load();
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
          maxWidth: 1000,
          margin: "0 auto",
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.06)",
          borderRadius: 18,
          padding: 18,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          color: "#eafff2",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
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
            <h1 style={{ margin: 0 }}>Admin: Reviews</h1>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/admin" style={{ textDecoration: "underline", color: "#eafff2" }}>
              ← Admin HQ
            </Link>
            <Link href="/" style={{ textDecoration: "underline", color: "#eafff2" }}>
              Home
            </Link>
          </div>
        </div>

        {/* ADMIN KEY */}
        <div style={{ marginTop: 16 }}>
          <label style={{ fontWeight: 800 }}>Admin Key</label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Paste ADMIN_KEY"
            autoComplete="new-password"
            spellCheck={false}
            style={{
              padding: 10,
              width: "100%",
              maxWidth: 400,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(0,0,0,0.2)",
              color: "#eafff2",
            }}
          />
        </div>

        {/* ACTIONS */}
        <div style={{ marginTop: 12 }}>
          <button
            onClick={load}
            disabled={loading}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.08)",
              color: "#eafff2",
              fontWeight: 900,
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {err && <p style={{ color: "salmon", marginTop: 12 }}>❌ {err}</p>}

        <p style={{ marginTop: 12, opacity: 0.8 }}>
          Total reviews: <b>{reviews.length}</b>
        </p>

        {/* REVIEWS */}
        <div style={{ display: "grid", gap: 12, marginTop: 10 }}>
          {reviews.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 14,
                padding: 14,
                background: "rgba(0,0,0,0.18)",
              }}
            >
              <div style={{ fontWeight: 900 }}>
                {r.name} ({fmt(r.createdAt)})
              </div>

              <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                {r.text}
              </div>

              <textarea
                defaultValue={r.ownerResponse || ""}
                onBlur={(e) => saveResponse(r.id, e.target.value)}
                placeholder="Course response…"
                style={{
                  width: "100%",
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(0,0,0,0.2)",
                  color: "#eafff2",
                }}
              />

              <button
                onClick={() => del(r.id)}
                style={{
                  marginTop: 8,
                  padding: "6px 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,0,0,0.25)",
                  color: "#fff",
                  fontWeight: 800,
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
