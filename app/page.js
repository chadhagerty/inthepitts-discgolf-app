"use client";


import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";


export const dynamic = "force-dynamic";


const tiles = [
  { type: "internal", href: "/checkin", icon: "/tile-icons/checkin.png", label: "Tap In" },
  { type: "internal", href: "/memberships", icon: "/tile-icons/membership.png", label: "Membership" },
  { type: "internal", href: "/events", icon: "/tile-icons/events.png", label: "Events" },
  { type: "internal", href: "/chat", icon: "/tile-icons/chat.png", label: "Chat" },


  { type: "internal", href: "/stats", icon: "/tile-icons/stats.png", label: "Stats" },
  { type: "internal", href: "/round-tracker", icon: "/tile-icons/leaderboard.png", label: "Round Tracker" },
  { type: "internal", href: "/review", icon: "/tile-icons/reviews.png", label: "Reviews" },
  { type: "internal", href: "/sponsors", icon: "/tile-icons/sponsors.png", label: "Sponsors" },


  { type: "external", href: "https://www.youtube.com/@InThePittsDiscGolfCourse", icon: "/tile-icons/youtube.png", label: "YouTube" },
  { type: "external", href: "https://www.facebook.com/share/1D8MpvLLtv/", icon: "/tile-icons/facebook.png", label: "Facebook" },


  { type: "internal", href: "/about", icon: "/tile-icons/course-info.png", label: "About" },


  { type: "internal", href: "/the-game", icon: "/tile-icons/ITP_Game.png", label: "In The Pitts - The Game" },
];


function Tile({ t }) {
  const content = (
    <div className="tileFrame">
      <Image
        src={t.icon}
        alt={t.label}
        fill
        sizes="160px"
        draggable={false}
        className="tileImg"
      />
    </div>
  );


  if (t.type === "external") {
    return (
      <a
        href={t.href}
        target="_blank"
        rel="noreferrer"
        className="tileLink"
        aria-label={t.label}
      >
        {content}
      </a>
    );
  }


  return (
    <Link href={t.href} className="tileLink" aria-label={t.label}>
      {content}
    </Link>
  );
}


function previewIcon(type) {
  if (type === "round") return "🔥";
  if (type === "checkin") return "✅";
  if (type === "event_join") return "🥏";
  return "•";
}


export default function Page() {
  const [feedItems, setFeedItems] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);


  useEffect(() => {
    let active = true;


    async function loadFeed() {
      setFeedLoading(true);


      try {
        const res = await fetch("/api/feed?take=5", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));


        if (!active) return;


        if (!res.ok || !data?.ok) {
          setFeedItems([]);
        } else {
          setFeedItems(Array.isArray(data.feed) ? data.feed : []);
        }
      } catch {
        if (active) setFeedItems([]);
      } finally {
        if (active) setFeedLoading(false);
      }
    }


    loadFeed();
    return () => {
      active = false;
    };
  }, []);


  return (
    <main className="homePage">
      <section className="homeHero">
        <Image
          src="/logo.png"
          alt="In The Pitts Disc Golf"
          width={300}
          height={300}
          priority
          className="homeLogo"
        />


        <p className="homeDesc" style={{ marginTop: 10, fontWeight: 800 }}>
          18-hole course • wooded + open
        </p>
      </section>


      <section className="homeGridWrap">
        <div className="tileGrid">
          {tiles.map((t) => (
            <Tile key={`${t.type}-${t.href}-${t.icon}`} t={t} />
          ))}
        </div>
      </section>


      <section
        style={{
          width: "min(1000px, 92vw)",
          margin: "22px auto 0",
        }}
      >
        <div
          className="itp-panel"
          style={{
            background: "rgba(255,255,255,0.82)",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div>
              <h3 className="itp-sectionTitle" style={{ margin: 0 }}>
                Today at In The Pitts
              </h3>
              <div className="itp-muted" style={{ marginTop: 4 }}>
                Live check-ins, rounds, and event activity
              </div>
            </div>


            <Link href="/feed" className="itp-link">
              View Live Feed →
            </Link>
          </div>


          <div style={{ marginTop: 12 }}>
            {feedLoading ? (
              <div className="itp-muted">Loading activity…</div>
            ) : feedItems.length === 0 ? (
              <div className="itp-muted">No activity yet.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {feedItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.72)",
                      border: "1px solid rgba(0,0,0,0.06)",
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ marginRight: 8 }}>{previewIcon(item.type)}</span>
                    {item.headline}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
