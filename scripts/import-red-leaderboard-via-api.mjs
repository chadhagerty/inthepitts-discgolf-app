import fs from "node:fs";

const PAR_RED = 40;
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ADMIN_KEY = process.env.ADMIN_KEY;

if (!ADMIN_KEY) {
  console.error("❌ Missing ADMIN_KEY env var.");
  console.error("Run: ADMIN_KEY=your_key node scripts/import-red-leaderboard-via-api.mjs");
  process.exit(1);
}

const raw = fs.readFileSync("app/game-data/leaderboard-red.json", "utf8");
const rows = JSON.parse(raw);

function relativeFromStrokes(strokes) {
  return Number(strokes) - PAR_RED; // ex 33 -> -7, 44 -> +4
}

async function run() {
  console.log(`Importing ${rows.length} RED entries into DB via ${BASE_URL}/api/leaderboard ...`);

  let ok = 0;
  let bad = 0;

  for (const r of rows) {
    const name = String(r.name || "").trim();
    const strokes = Number(r.score);

    if (!name || !Number.isFinite(strokes)) {
      console.log("Skipping bad row:", r);
      bad++;
      continue;
    }

    const payload = {
      name,
      tee: "red",
      strokes,                 // raw total strokes (33, 44, etc.)
      score: relativeFromStrokes(strokes), // relative to par (-7, +4 etc.) for sorting
      aces: 0,
      date: new Date().toISOString().slice(0, 10),
      notes: "Imported from UDisc",
    };

    const res = await fetch(`${BASE_URL}/api/leaderboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ADMIN_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.ok) {
      console.log(`❌ Failed: ${name} (${strokes}) ->`, data?.error || res.statusText);
      bad++;
    } else {
      ok++;
    }
  }

  console.log(`✅ Done. Success: ${ok}, Failed: ${bad}`);
}

run();

