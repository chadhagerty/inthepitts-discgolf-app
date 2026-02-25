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
    setErr("");
    localStorage.setItem("ADMIN_KEY", key);

    const res = await fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ ownerResponse }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data?.error || "Failed to save response");
      return;
    }
    await load();
  }

  async function del(id) {
    if (!confirm("Delete this review?")) return;
    setErr("");
    localStorage.setItem("ADMIN_KEY", key);

    const res = await fetch(`/api/reviews/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${key}` },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data?.error || "Failed to delete review");
      return;
    }
    await load();
  }

  return (
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Admin: Reviews</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/admin" style={{ textDecoration: "underline" }}>← Admin Home</Link>
          <Link href="/" style={{ textDecoration: "underline" }}>Home</Link>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: "block", marginBottom: 6, fontWeight: 800 }}>
          Admin Key (paste exactly)
        </label>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="your-admin-key"
          style={{ padding: "0.5rem", width: "100%", maxWidth: 420 }}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {err && <p style={{ color: "red", marginTop: 12 }}>❌ {err}</p>}

      <p style={{ marginTop: 12, opacity: 0.8 }}>
        Total: <b>{reviews.length}</b>
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 10 }}>
        {reviews.map((r) => (
          <ReviewCard key={r.id} r={r} onSave={saveResponse} onDelete={del} />
        ))}

        {reviews.length === 0 && <p style={{ opacity: 0.7 }}>No reviews yet.</p>}
      </div>
    </main>
  );
}

function ReviewCard({ r, onSave, onDelete }) {
  const [draft, setDraft] = useState(r.ownerResponse || "");
  const avg =
    Math.round(
      ((r.overall + r.upkeep + r.shotSelection + r.signage + r.app + r.game) / 6) * 10
    ) / 10;

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 900 }}>
          {r.name} <span style={{ opacity: 0.7, fontWeight: 700 }}>({avg}/5 avg)</span>
        </div>
        <div style={{ opacity: 0.75 }}>{fmt(r.createdAt)}</div>
      </div>

      <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{r.text}</div>

      <div style={{ marginTop: 10, fontSize: 13, opacity: 0.9 }}>
        Overall {r.overall}/5 · Upkeep {r.upkeep}/5 · Shot {r.shotSelection}/5 · Signage {r.signage}/5 · App {r.app}/5 · Game {r.game}/5
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Course response (public)</div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Write a reply (e.g., apologize + what you’ll fix + invite them back)."
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
        />
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => onSave(r.id, draft)} style={{ padding: "8px 10px" }}>
          Save response
        </button>
        <button onClick={() => onDelete(r.id)} style={{ padding: "8px 10px" }}>
          Delete review
        </button>
      </div>
    </div>
  );
}
