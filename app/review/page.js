"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function DiscRating({ value, onChange }) {
  return (
    <div className="itp-starsRow">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= value;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} disc`}
            className={`itp-discBtn ${active ? "isActive" : ""}`}
          >
            🥏
          </button>
        );
      })}
      <span className="itp-starsValue">{value}/5</span>
    </div>
  );
}

function avgOne(r) {
  const vals = [r.overall, r.upkeep, r.shotSelection, r.signage, r.app, r.game].map(
    (x) => Number(x) || 0
  );
  const n = vals.length;
  const s = vals.reduce((a, b) => a + b, 0);
  return Math.round((s / n) * 10) / 10;
}

function avgAll(reviews) {
  if (!reviews?.length) return null;
  const s = reviews.reduce((acc, r) => acc + avgOne(r), 0);
  return Math.round((s / reviews.length) * 10) / 10;
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

  const overallAll = useMemo(() => avgAll(reviews), [reviews]);

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
    <main className="itp-page">
      <div className="itp-card itp-cardWide">
        <div className="itp-headerRow">
          <div>
            <h1 className="itp-title">Reviews</h1>
            <p className="itp-subtitle">
              Leave a review for the course + the app/game. One review per email.
            </p>

            <div className="itp-badgesRow">
              <span className="itp-badge">
                Overall rating (all reviews):{" "}
                <b>{overallAll == null ? "—" : `${overallAll}/5`}</b>
              </span>
              <span className="itp-badgeMuted">
                Total reviews: <b>{reviews.length}</b>
              </span>
            </div>
          </div>

          <Link href="/" className="itp-link">
            ← Home
          </Link>
        </div>

        <section className="itp-panel">
          <h2 className="itp-sectionTitle">Post a review</h2>

          <div className="itp-formGrid">
            <div className="itp-field">
              <label className="itp-label">Name (required)</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="itp-input"
              />
            </div>

            <div className="itp-field">
              <label className="itp-label">Email (required)</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@gmail.com"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                className="itp-input"
              />
            </div>

            <div className="itp-field">
              <label className="itp-label">Your review</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tell us what you liked (or what we should fix)."
                rows={4}
                className="itp-textarea"
              />
            </div>

            <div className="itp-ratingsGrid">
              <div className="itp-ratingRow">
                <div className="itp-ratingLabel">Course overall</div>
                <DiscRating value={overall} onChange={setOverall} />
              </div>

              <div className="itp-ratingRow">
                <div className="itp-ratingLabel">Upkeep</div>
                <DiscRating value={upkeep} onChange={setUpkeep} />
              </div>

              <div className="itp-ratingRow">
                <div className="itp-ratingLabel">Shot selection</div>
                <DiscRating value={shotSelection} onChange={setShotSelection} />
              </div>

              <div className="itp-ratingRow">
                <div className="itp-ratingLabel">Signage / navigation</div>
                <DiscRating value={signage} onChange={setSignage} />
              </div>

              <div className="itp-ratingRow">
                <div className="itp-ratingLabel">App experience</div>
                <DiscRating value={app} onChange={setApp} />
              </div>

              <div className="itp-ratingRow">
                <div className="itp-ratingLabel">Game experience</div>
                <DiscRating value={game} onChange={setGame} />
              </div>
            </div>

            <button
              onClick={submit}
              disabled={loading || !canSubmit}
              className={`itp-btn ${loading || !canSubmit ? "isDisabled" : ""}`}
            >
              {loading ? "Posting..." : "Post review"}
            </button>

            {status && (
              <div className={`itp-alert ${status.ok ? "ok" : "bad"}`}>
                {status.msg}
              </div>
            )}
          </div>
        </section>

        <section className="itp-listHeader">
          <h2 className="itp-sectionTitle" style={{ margin: 0 }}>
            Latest reviews
          </h2>

          <button
            onClick={loadReviews}
            disabled={loadingList}
            className={`itp-btnSecondary ${loadingList ? "isDisabled" : ""}`}
          >
            {loadingList ? "Loading..." : "Refresh"}
          </button>
        </section>

        {loadingList ? (
          <p className="itp-muted">Loading…</p>
        ) : reviews.length === 0 ? (
          <p className="itp-muted">No reviews yet. Be the first.</p>
        ) : (
          <div className="itp-list">
            {reviews.map((r) => (
              <article key={r.id} className="itp-reviewCard">
                <div className="itp-reviewTop">
                  <div className="itp-reviewName">{r.name}</div>
                  <div className="itp-reviewAvg">Avg {avgOne(r)}/5</div>
                </div>

                <div className="itp-reviewText">{r.text}</div>

                <div className="itp-reviewMeta">
                  <div>
                    Overall: {r.overall}/5 · Upkeep: {r.upkeep}/5 · Shot selection:{" "}
                    {r.shotSelection}/5
                  </div>
                  <div>
                    Signage: {r.signage}/5 · App: {r.app}/5 · Game: {r.game}/5
                  </div>
                </div>

                {r.ownerResponse && (
                  <div className="itp-ownerResponse">
                    <div className="itp-ownerTitle">Course response</div>
                    <div className="itp-ownerText">{r.ownerResponse}</div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        <div className="itp-footerRow">
          <Link href="/admin/reviews" className="itp-link">
            Admin: Manage Reviews →
          </Link>
        </div>
      </div>
    </main>
  );
}
