"use client";


import { useEffect, useState } from "react";
import Link from "next/link";


function iconForType(type) {
  if (type === "round") return "🔥";
  if (type === "checkin") return "✅";
  if (type === "event_join") return "🥏";
  return "•";
}


function timeAgo(dateString) {
  const then = new Date(dateString).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - then);


  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);


  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
}


export default function FeedPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");


  async function load() {
    setLoading(true);
    setErr("");


    try {
      const res = await fetch("/api/feed?take=30", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));


      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to load activity feed");
      }


      setItems(Array.isArray(data.feed) ? data.feed : []);
    } catch (e) {
      setItems([]);
      setErr(e?.message || "Failed to load activity feed");
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    load();
  }, []);


  return (
    <main className="itp-page">
      <div className="itp-card itp-cardWide">
        <div className="itp-headerRow">
          <div>
            <h1 className="itp-title" style={{ margin: 0 }}>
              Today at In The Pitts
            </h1>
            <div className="itp-subtitle">
              Live course activity from check-ins, rounds, and events
            </div>
          </div>


          <Link href="/" className="itp-link">
            ← Home
          </Link>
        </div>


        <div className="itp-panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div className="itp-muted">
              Latest activity happening around the course.
            </div>


            <button
              type="button"
              className="itp-btnSecondary"
              onClick={load}
            >
              Refresh
            </button>
          </div>
        </div>


        {err && (
          <div className="itp-panel">
            <div className="itp-alert bad">❌ {err}</div>
          </div>
        )}


        {loading ? (
          <div className="itp-panel">
            <div className="itp-muted">Loading activity…</div>
          </div>
        ) : items.length === 0 ? (
          <div className="itp-panel">
            <div className="itp-muted">No activity yet today.</div>
          </div>
        ) : (
          <div className="itp-panel">
            <div style={{ display: "grid", gap: 12 }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.68)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                      alignItems: "start",
                    }}
                  >
                    <div style={{ display: "flex", gap: 12, alignItems: "start" }}>
                      <div style={{ fontSize: 22, lineHeight: 1 }}>
                        {iconForType(item.type)}
                      </div>


                      <div>
                        <div style={{ fontWeight: 1000, fontSize: 17 }}>
                          {item.headline}
                        </div>


                        {item.detail ? (
                          <div className="itp-muted" style={{ marginTop: 4 }}>
                            {item.detail}
                          </div>
                        ) : null}
                      </div>
                    </div>


                    <div
                      className="itp-muted"
                      style={{ fontWeight: 800, whiteSpace: "nowrap" }}
                    >
                      {timeAgo(item.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
