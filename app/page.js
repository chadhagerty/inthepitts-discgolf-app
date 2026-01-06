"use client";

import { useState } from "react";
import Image from "next/image";

const holes = [
  {
    hole: 1,
    par: { red: 3, blue: 3 },
    distance: { red: "186 ft", blue: "261 ft" },
    description:
      "Open shot with a slight dogleg right from the top of a hill. Hazard at the bottom left of the hill.",
  },
  {
    hole: 2,
    par: { red: 3, blue: 3 },
    distance: { red: "169 ft", blue: "169 ft" },
    description:
      "Tight wooded fairway with a slight left fade at the end.",
  },
  {
    hole: 3,
    par: { red: 3, blue: 3 },
    distance: { red: "147 ft", blue: "147 ft" },
    description:
      "Wooded hole requiring a forehand or backhand turnover. OB left over the brush wall and OB right into the sand pit.",
  },
  {
    hole: 4,
    par: { red: 3, blue: 3 },
    distance: { red: "148 ft", blue: "190 ft" },
    description:
      "Tight wooded hole. Forehand or flex shot to a basket on top of a hill.",
  },
  {
    hole: 5,
    par: { red: 4, blue: 3 },
    distance: { red: "296 ft", blue: "296 ft" },
    description:
      "Stock flex backhand over the pine with a right fade.",
  },
  {
    hole: 6,
    par: { red: 4, blue: 4 },
    distance: { red: "343 ft", blue: "343 ft" },
    description:
      "Out-of-the-tunnel bomber. Narrow fairway with the basket behind two spruce trees.",
  },
  {
    hole: 7,
    par: { red: 3, blue: 3 },
    distance: { red: "264 ft", blue: "264 ft" },
    description:
      "Horseshoe-shaped fairway. Forehander’s dream or bold backhand turnover.",
  },
  {
    hole: 8,
    par: { red: 3, blue: 3 },
    distance: { red: "108 ft", blue: "215 ft" },
    description:
      "Tunnel shot with a consistent left fade. Basket tucked behind a pine tree.",
  },
  {
    hole: 9,
    par: { red: 3, blue: 3 },
    distance: { red: "202 ft", blue: "202 ft" },
    description:
      "Tight wooded fairway. Flex shot or backhand turnover. OB left over the fence.",
  },
  {
    hole: 10,
    par: { red: 4, blue: 3 },
    distance: { red: "175 ft", blue: "175 ft" },
    description:
      "Sharp 90-degree turn about 75 ft off the tee. Hanging basket.",
  },
  {
    hole: 11,
    par: { red: 3, blue: 3 },
    distance: { red: "136 ft", blue: "136 ft" },
    description:
      "Island hole. Clear the stream or play your next shot from the tee.",
  },
  {
    hole: 12,
    par: { red: 4, blue: 4 },
    distance: { red: "334 ft", blue: "402 ft" },
    description:
      "Left-fading shot with elevation through a narrow fairway.",
  },
  {
    hole: 13,
    par: { red: 4, blue: 3 },
    distance: { red: "377 ft", blue: "377 ft" },
    description:
      "Bomb shot with a slight left fade.",
  },
  {
    hole: 14,
    par: { red: 4, blue: 4 },
    distance: { red: "564 ft", blue: "564 ft" },
    description:
      "Downhill full-send with a slightly tucked basket.",
  },
  {
    hole: 15,
    par: { red: 4, blue: 4 },
    distance: { red: "368 ft", blue: "485 ft" },
    description:
      "Straight shot with thick rough on the left.",
  },
  {
    hole: 16,
    par: { red: 3, blue: 3 },
    distance: { red: "371 ft", blue: "371 ft" },
    description:
      "Stock backhand with a slightly buried basket.",
  },
  {
    hole: 17,
    par: { red: 3, blue: 3 },
    distance: { red: "288 ft", blue: "288 ft" },
    description:
      "Straight shot to a basket on a slanted hill.",
  },
  {
    hole: 18,
    par: { red: 5, blue: 5 },
    distance: { red: "581 ft", blue: "581 ft" },
    description:
      "Long, mostly tight wooded hole requiring one to two layup shots.",
  },
];

const MEMBERS = [
  {
    name: "Chad Hagerty",
    type: "yearly",
    expiresAt: "2026-01-01",
  },
];

export function CheckIn() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState(null);

  const today = new Date();

  function handleCheckIn() {
    const member = MEMBERS.find(
      (m) => m.name.toLowerCase() === name.toLowerCase()
    );

    if (!member) {
      setStatus("not-member");
      return;
    }

    const expires = new Date(member.expiresAt);

    if (expires >= today) {
      setStatus("checked-in");
    } else {
      setStatus("expired");
    }
  }

  return (
    <section style={{ padding: "2rem", borderTop: "1px solid #ccc" }}>
      <h2>Course Check-In</h2>

      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "0.5rem", width: "100%", maxWidth: "300px" }}
      />

      <br /><br />

      <button onClick={handleCheckIn}>Check In</button>

      {status === "checked-in" && (
        <p style={{ color: "green" }}>
          ✅ Welcome back! You’re checked in.
        </p>
      )}

      {status === "expired" && (
        <p style={{ color: "red" }}>
          ❌ Membership expired. Please renew.
        </p>
      )}

      {status === "not-member" && (
        <div style={{ marginTop: "1rem" }}>
          <p>Day Pass: $10</p>
          <p>Yearly Membership: $100</p>
          <p>
            Pay by e-transfer:<br />
            <strong>inthepittsdiscgolf@gmail.com</strong>
          </p>
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const [tee, setTee] = useState("red");

  return (
    <main>
      {/* HERO */}
      <section style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <Image src="/logo.png" alt="In The Pitts Disc Golf" width={140} height={140} />
        <h1>In The Pitts Disc Golf Course</h1>
        <p>Choose your tee to view hole info</p>

        <div style={{ marginTop: "1rem" }}>
          <button onClick={() => setTee("red")} disabled={tee === "red"}>
            Red Tees
          </button>{" "}
          <button onClick={() => setTee("blue")} disabled={tee === "blue"}>
            Blue Tees
          </button>
        </div>
      </section>
      <CheckIn />

      {/* HOLES */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem" }}>
        {holes.map((h) => (
          <div key={h.hole} style={{ marginBottom: "1.5rem" }}>
            <h3>Hole {h.hole}</h3>
            <strong>
              Par {h.par[tee]} — {h.distance[tee]}
            </strong>
            <p>{h.description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}


