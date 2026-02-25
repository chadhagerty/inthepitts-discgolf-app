"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function Stars({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star`}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: "1px solid #ddd",
            background: n <= value ? "#111" : "#fff",
            color: n <= value ? "#fff" : "#111",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          ★
        </button>
      ))}
      <span style={{ marginLeft: 6, fontWeight: 800 }}>{value}/5</span>
    </div>
  );
}

function avg(r) {
  const vals = [r.overall, r.upkeep, r.shotSelection, r.signage, r.app, r.game].map((x) => Number(x) || 0);
  const n = vals.length;
  const s = vals.reduce((a, b) => a + b, 0);
  return Math.round((s / n) * 10) / 10;
}

export default function ReviewPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");

  const [overall, setOverall] = useState(5);
  const [upkeep, setUpkeep] = useState(5);
  const [shotSelection, setShotSelection] = useState(5);
  const [signage, setSignage] = useState(5);
  const [app, setApp] = useState(5);
  const [game, setGame] = useState(5);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const canSubmit = useMemo(() => {
    return name.trim() && email.trim().toLowerCase().includes("@") && text.trim();
  }, [name, email, text]);

  async function loadReviews() {
    setLoadingList(true);
    try {
      const res = await fetch("/api/reviews", { cache: "no-store" });
      const data = await res.json();
      setReviews(data?.reviews || []);
    } catch {
      setReviews([]);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function submit() {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanText = text.trim();
    if (!cleanName || !cleanEmail || !cleanText) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          text: cleanText,
          overall,
          upkeep,
          shotSelection,
          signage,
          app,
          game,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Review failed");

      setStatus({ ok: true, msg: "Thanks! Your review is posted ✅" });

      // reset form but keep name/email for convenience
      setText("");
      setOverall(5);
      setUpkeep(5);
      setShotSelection(5);
      setSignage(5);
      setApp(5);
      setGame(5);

      await loadReviews();
    } catch (e) {
      setStatus({ ok: false, msg: e?.message || "Review failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 820, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Reviews</h1>
        <Link href="/" style={{ textDecoration: "underline" }}>← Home</Link>
      </div>

      <p style={{ marginTop: 10, color: "#555" }}>
        Leave a review for the course + the app/game. One review per email.
      </p>

      {/* FORM */}
      <div style={{ marginTop: 14, border: "1px solid #e5e5e5", borderRadius: 14, padding: 14 }}>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 800 }}>Name (required)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              style={{ padding: 12, borderRadius: 10, border: "1px solid #ccc" }}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 800 }}>Email (required)</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="johndoe@gmail.com"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              style={{ padding: 12, borderRadius: 10, border: "1px solid #ccc" }}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 800 }}>Your review</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell us what you liked (or what we should fix)."
              rows={4}
              style={{ padding: 12, borderRadius: 10, border: "1px solid #ccc", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
            <div>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Course overall</div>
              <Stars value={overall} onChange={setOverall} />
            </div>

            <div>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Upkeep</div>
              <Stars value={upkeep} onChange={setUpkeep} />
            </div>

            <div>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Shot selection</div>
              <Stars value={shotSelection} onChange={setShotSelection} />
            </div>

            <div>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Signage / navigation</div>
              <Stars value={signage} onChange={setSignage} />
            </div>

            <div>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>App experience</div>
              <Stars value={app} onChange={setApp} />
            </div>

            <div>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Game experience</div>
              <Stars value={game} onChange={setGame} />
            </div>
          </div>

          <button
            onClick={submit}
            disabled={loading || !canSubmit}
            style={{
              marginTop: 10,
              width: "100%",
              padding: 12,
              borderRadius: 12,
              border: "1px solid #111",
              background: loading ? "#eee" : "#111",
              color: loading ? "#111" : "#fff",
              fontWeight: 900,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Posting..." : "Post review"}
          </button>

          {status && (
            <div
              style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 12,
                border: "1px solid #ddd",
                background: status.ok ? "#ecfdf5" : "#fef2f2",
                color: status.ok ? "#065f46" : "#991b1b",
                fontWeight: 800,
              }}
            >
              {status.msg}
            </div>
          )}
        </div>
      </div>

      {/* LIST */}
      <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Latest reviews</h2>
        <button onClick={loadReviews} disabled={loadingList} style={{ padding: "8px 10px" }}>
          {loadingList ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loadingList ? (
        <p style={{ opacity: 0.7, marginTop: 10 }}>Loading…</p>
      ) : reviews.length === 0 ? (
        <p style={{ opacity: 0.7, marginTop: 10 }}>No reviews yet. Be the first.</p>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 10 }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ border: "1px solid #e5e5e5", borderRadius: 14, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900 }}>{r.name}</div>
                <div style={{ fontWeight: 900, opacity: 0.8 }}>Avg {avg(r)}/5</div>
              </div>

              <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{r.text}</div>

              <div style={{ marginTop: 10, display: "grid", gap: 4, fontSize: 13, opacity: 0.9 }}>
                <div>Overall: {r.overall}/5 · Upkeep: {r.upkeep}/5 · Shot selection: {r.shotSelection}/5</div>
                <div>Signage: {r.signage}/5 · App: {r.app}/5 · Game: {r.game}/5</div>
              </div>

              {r.ownerResponse && (
                <div style={{ marginTop: 12, borderTop: "1px solid #eee", paddingTop: 10 }}>
                  <div style={{ fontWeight: 900 }}>Course response</div>
                  <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{r.ownerResponse}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <Link href="/admin/reviews" style={{ textDecoration: "underline" }}>
          Admin: Manage Reviews →
        </Link>
      </div>
    </main>
  );
}
