"use client";

import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBestScore } from "../../lib/records";


type Tee = "red" | "blue";

export default function InThePittsCoursePage() {
  const router = useRouter();

  // hydration-safe: only show records after client mounts
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const courseId = "in-the-pitts";

  const bestBlue = useMemo(() => {
    if (!mounted) return null;
    try {
      return getBestScore(courseId, "blue");
    } catch {
      return null;
    }
  }, [mounted]);

  const bestRed = useMemo(() => {
    if (!mounted) return null;
    try {
      return getBestScore(courseId, "red");
    } catch {
      return null;
    }
  }, [mounted]);

  return (
    <div className="game-screen">
      <div style={{ marginBottom: 18 }}>
        <Link href="/game/courses" style={{ textDecoration: "none" }}>
          ← Back to Courses
        </Link>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>
          Select Tee
        </div>

        <div style={{ fontSize: 18, fontWeight: 800, opacity: 0.92 }}>
          In The Pitts Disc Golf Course
        </div>
        <div style={{ opacity: 0.75, marginTop: 6 }}>
          In The Pitts Disc Golf, Canada
        </div>

        <div
          style={{
            margin: "18px auto 0",
            maxWidth: 520,
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16,
            padding: 14,
            textAlign: "left",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 10 }}>
            Records
          </div>

          <div style={{ fontSize: 16 }}>
            Best (BLUE):{" "}
            <b>{mounted ? (bestBlue ?? "—") : "—"}</b>{" "}
            &nbsp;&nbsp; Best (RED):{" "}
            <b>{mounted ? (bestRed ?? "—") : "—"}</b>
          </div>

          <div style={{ opacity: 0.75, fontSize: 12, marginTop: 6 }}>
            Records are tracked separately per tee.
          </div>
        </div>

        <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
          <button
            className="btn-next"
            onClick={() =>
              router.push(`/game/play?course=${courseId}&tee=blue`)
            }
          >
            PLAY 18 — BLUE TEES
          </button>

          <button
            className="btn-next"
            onClick={() =>
              router.push(`/game/play?course=${courseId}&tee=red`)
            }
          >
            PLAY 18 — RED TEES
          </button>
        </div>

        <div style={{ marginTop: 16, opacity: 0.7, fontSize: 12 }}>
          Tip: You can deep-link into a round with{" "}
          <code>?course=in-the-pitts&amp;tee=blue</code> or{" "}
          <code>?course=in-the-pitts&amp;tee=red</code>.
        </div>
      </div>
    </div>
  );
}
