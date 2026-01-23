"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function Tile({ href, emoji, title, subtitle, external = false }) {
  const inner = (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 14,
        padding: "1rem",
        display: "flex",
        gap: "0.85rem",
        alignItems: "center",
        background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontSize: "1.8rem", width: 40, textAlign: "center" }}>
        {emoji}
      </div>

      <div style={{ textAlign: "left" }}>
        <div style={{ fontWeight: 700, fontSize: "1rem" }}>{title}</div>
        <div style={{ opacity: 0.75, fontSize: "0.9rem", marginTop: 2 }}>
          {subtitle}
        </div>
      </div>
    </div>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      {inner}
    </Link>
  );
}

export default function Page() {
  const tiles = [
    // Core
    {
      href: "/checkin",
      emoji: "✅",
      title: "Course Check-In",
      subtitle: "Members + day pass",
    },
    {
      href: "/memberships",
      emoji: "💳",
      title: "Become a Member",
      subtitle: "Pricing + how to pay",
    },

    // Course / community (placeholders for now)
    {
      href: "/stats",
      emoji: "📊",
      title: "Course Stats",
      subtitle: "Trends (coming soon)",
    },
    {
      href: "/leaderboard",
      emoji: "🏆",
      title: "Leaderboard",
      subtitle: "Aces + wins (coming soon)",
    },

    // External
    {
      href: "https://www.youtube.com/",
      emoji: "▶️",
      title: "YouTube",
      subtitle: "Course videos",
      external: true,
    },
    {
      href: "https://www.facebook.com/",
      emoji: "📘",
      title: "Facebook",
      subtitle: "Updates + community",
      external: true,
    },
    {
      href: "https://www.discgolfvalley.com/",
      emoji: "🥏",
      title: "Disc Golf Valley",
      subtitle: "Play the game",
      external: true,
    },
  ];

  return (
    <main>
      {/* Hero */}
      <section style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <Image src="/logo.png" alt="Logo" width={140} height={140} />
        <h1 style={{ marginTop: "1rem" }}>In The Pitts Disc Golf Course</h1>

        <p style={{ maxWidth: 800, margin: "1rem auto", opacity: 0.9 }}>
          A well-rounded 18-hole disc golf experience featuring tight wooded
          challenges, wide-open distance shots, and a fun atmosphere with wildlife
          — including a friendly donkey midway through your round.
        </p>
      </section>

      {/* App-style tiles */}
      <section style={{ padding: "0 1rem 2rem" }}>
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "12px",
          }}
        >
          {tiles.map((t) => (
            <Tile
              key={t.href}
              href={t.href}
              emoji={t.emoji}
              title={t.title}
              subtitle={t.subtitle}
              external={!!t.external}
            />
          ))}
        </div>

        <div
          style={{
            maxWidth: 980,
            margin: "0.75rem auto 0",
            opacity: 0.65,
            fontSize: "0.85rem",
            textAlign: "center",
          }}
        >
          Tip: Bookmark Admin pages if you need them (they’re not shown on the
          homepage).
        </div>
      </section>
    </main>
  );
}
