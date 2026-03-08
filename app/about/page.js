

"use client";


import Link from "next/link";


export const dynamic = "force-dynamic";


export default function AboutPage() {
  return (
    <main className="itp-page" style={{ position: "relative", overflow: "hidden" }}>
      <style jsx>{`
        main::before {
          opacity: 0.03 !important;
          background-position: 50% 10%;
        }
      `}</style>


      <div className="itp-card itp-cardWide">
        <div className="itp-headerRow">
          <div />
          <Link href="/" className="itp-link">
            ← Home
          </Link>
        </div>


        {/* HERO */}
        <div
          style={{
            textAlign: "center",
            padding: "6px 6px 2px",
          }}
        >
          <img
            src="/logo.png"
            alt="In The Pitts Disc Golf"
            style={{
              width: 220,
              height: 220,
              objectFit: "contain",
              display: "block",
              margin: "0 auto",
              filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.18))",
            }}
          />


          <div
            style={{
              marginTop: 10,
              fontWeight: 1000,
              letterSpacing: "0.02em",
              color: "#0f172a",
              opacity: 0.9,
            }}
          >
            18-hole course • wooded + open
          </div>
        </div>


        {/* ABOUT COURSE */}
        <div className="itp-panel">
          <h3 className="itp-sectionTitle">Course Info</h3>


          <p style={{ marginTop: 0 }}>
            In The Pitts Disc Golf began as a real course experience with drone
            videos at every tee pad, accessible by QR code.
          </p>


          <p>
            It grew into the In The Pitts App, and now into{" "}
            <b>In The Pitts Disc Golf: The Game</b> — blending real course realism
            with fun easter-eggs (yes… Hole 6 donkey is canon 😄).
          </p>


          <p style={{ marginBottom: 0 }}>
            Located in Ontario, Canada, the course mixes tight wooded lines with
            open bomber holes so beginners and pros both have fun.
          </p>
        </div>


        {/* HOLE LAYOUT */}
        <div className="itp-panel">
          <h3 className="itp-sectionTitle">Hole Layout</h3>


          <p style={{ marginTop: 0 }}>
            View hole maps, distances, OB, mandos, and sponsors.
          </p>


          <Link href="/course" className="itp-link">
            👉 View Hole Layout
          </Link>
        </div>
      </div>
    </main>
  );
}
