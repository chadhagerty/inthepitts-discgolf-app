"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { holes } from "@/game-data/course-holes";

export default function CoursePage() {
  const [tee, setTee] = useState("red");
  const [openHole, setOpenHole] = useState(null);

  const teeLabel = useMemo(() => (tee === "red" ? "Red Tees" : "Blue Tees"), [tee]);

  return (
    <main className="itp-page">
      <div className="itp-card itp-cardWide">
        {/* Header */}
        <div
          className="itp-headerRow"
          style={{ alignItems: "center" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src="/logo.png"
              alt="In The Pitts Disc Golf"
              style={{
                width: 54,
                height: 54,
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "white",
                objectFit: "contain",
              }}
            />
            <div>
              <h1 className="itp-title" style={{ marginBottom: 0 }}>
                Hole Layout
              </h1>
              <div className="itp-subtitle" style={{ marginTop: 6 }}>
                Showing: <b>{teeLabel}</b> • Tap a hole to expand
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/" className="itp-link">
              ← Home
            </Link>
            <Link href="/about" className="itp-link">
              Course Info
            </Link>
          </div>
        </div>

        {/* Tee toggle */}
        <div className="itp-badgesRow">
          <button
            className={`itp-btnSecondary ${tee === "red" ? "isDisabled" : ""}`}
            onClick={() => setTee("red")}
            disabled={tee === "red"}
            style={{ width: "auto" }}
          >
            Red Tees
          </button>

          <button
            className={`itp-btnSecondary ${tee === "blue" ? "isDisabled" : ""}`}
            onClick={() => setTee("blue")}
            disabled={tee === "blue"}
            style={{ width: "auto" }}
          >
            Blue Tees
          </button>
        </div>

        {/* Holes */}
        <div className="itp-panel" style={{ marginTop: 14 }}>
          <div className="itp-list" style={{ marginTop: 0 }}>
            {holes.map((h) => {
              const isOpen = openHole === h.hole;

              return (
                <div
                  key={h.hole}
                  onClick={() => setOpenHole(isOpen ? null : h.hole)}
                  className="itp-reviewCard"
                  style={{
                    cursor: "pointer",
                    userSelect: "none",
                    background: "rgba(255,255,255,0.85)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 1000, fontSize: 16 }}>
                        Hole {h.hole}
                      </div>
                      <div style={{ marginTop: 4, opacity: 0.85, fontWeight: 800 }}>
                        Par {h.par[tee]} — {h.distance[tee]}
                      </div>
                    </div>

                    <div style={{ fontWeight: 1000, opacity: 0.8, fontSize: 18, lineHeight: 1 }}>
                      {isOpen ? "▲" : "▼"}
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ marginTop: 10, opacity: 0.95, fontWeight: 700 }}>
                      {h.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Back */}
        <div className="itp-footerRow">
          <Link href="/" className="itp-link">
            ← Back
          </Link>
        </div>
      </div>
    </main>
  );
}
