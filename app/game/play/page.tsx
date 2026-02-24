"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBestScore, setBestScoreIfBetter } from "../lib/records";

console.log("PLAY PAGE BUILD v10", new Date().toISOString());

type Tee = "red" | "blue";
type ThrowStyle = "backhand" | "forehand";

type Hole = {
  id: string;
  number: number;
  name?: string;
  par: Record<Tee, number>;
  distance: Record<Tee, number>;
  description?: string;

  sponsor?: string;
  sponsorName?: string;
  sponsorId?: string;
  sponsorKey?: string;

  layoutCanvas?: any;
  hazards?: any[];
  terrainNotes?: any;
};

type Disc = {
  id: string;
  name: string;
  type: "Driver" | "Mid" | "Putter";
  speed: number;
  stability: number;
  puttBonus?: number;
};

type Sponsor = { name: string; href: string; logo: string };

const SPONSORS: Sponsor[] = [
  { name: "Wicks Contracting", href: "", logo: "/sponsors/wicks_contracting.png" },
  { name: "Mundell Plumbing", href: "", logo: "/sponsors/mundell_plumbing.png" },
  { name: "Jan Kahlen Real Eastate", href: "", logo: "/sponsors/kahlen_real_estate.png" },
  { name: "Kingston Masonry Service", href: "", logo: "/sponsors/kingston_masonry_services.png" },
  { name: "Lakins Painting & Decorating", href: "", logo: "/sponsors/lakins_painting_decorating.png" },
  { name: "Kingston Billiards & Games", href: "", logo: "/sponsors/kingston_billiards_games.png" },
  { name: "Mo Brothers Inc", href: "", logo: "/sponsors/mo_brothers_inc.png" },
  { name: "REP Windows & Doors", href: "", logo: "/sponsors/rep_windows_doors.png" },
  { name: "Connie and Mel Hagerty", href: "", logo: "/sponsors/connie_mel_hagerty.png" },
  { name: "Grekos Pizzeria", href: "", logo: "/sponsors/grekos_pizzeria.png" },
  { name: "Versus Forms & Labels", href: "", logo: "/sponsors/versus_forms_labels.png" },
  { name: "Full House Roofing", href: "", logo: "/sponsors/full_house_roofing.png" },
  { name: "Jays Automotive Service", href: "", logo: "/sponsors/jayz_automotive_service.png" },
  { name: "SouthEastern Group", href: "", logo: "/sponsors/southeastern_group.png" },
  { name: "Nick Hogan Trucking (NHT Excavations)", href: "", logo: "/sponsors/nht_excavations.png" },
  { name: "In the Pitts Disc Golf (Helping Hands and Donators)", href: "", logo: "/sponsors/in_the_pitts_disc_golf.png" },
  { name: "In The Pitts Disc Golf Course", href: "", logo: "/sponsors/in_the_pitts_text.png" },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hash01(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function fmtSigned(n: number) {
  return n >= 0 ? `+${n}` : `${n}`;
}

function holeSponsorNameByNumber(holeNumber: number): string | null {
  const map: Record<number, string> = {
    1: "Wicks Contracting",
    2: "Mundell Plumbing",
    3: "Jan Kahlen Real Eastate",
    4: "Kingston Masonry Service",
    5: "Lakins Painting & Decorating",
    6: "Kingston Billiards & Games",
    7: "Mo Brothers Inc",
    8: "REP Windows & Doors",
    9: "Connie and Mel Hagerty",
    10: "Grekos Pizzeria",
    11: "Versus Forms & Labels",
    12: "Full House Roofing",
    13: "Jays Automotive Service",
    14: "SouthEastern Group",
    15: "Nick Hogan Trucking (NHT Excavations)",
    16: "In the Pitts Disc Golf (Helping Hands and Donators)",
    17: "No sponsor yet",
    18: "In The Pitts Disc Golf Course",
  };
  return map[holeNumber] ?? null;
}

function resolveSponsorForHole(hole: Hole | null): Sponsor | null {
  const holeNum = hole?.number ?? 0;
  const mapped = holeSponsorNameByNumber(holeNum);

  const raw = hole?.sponsor ?? hole?.sponsorName ?? hole?.sponsorId ?? hole?.sponsorKey ?? mapped ?? null;
  if (!raw) return null;
  if (raw.toLowerCase().includes("no sponsor")) return null;

  return SPONSORS.find((s) => s.name.toLowerCase() === raw.toLowerCase()) ?? null;
}

type IntroPhase = "sponsor" | "drone" | "play";

const LS_SOUND_UNLOCKED_KEY = "itp_sound_unlocked_v1";
const LS_LAST_TEE_KEY = "itp_last_tee_v1";

/** ✅ Layout format: hole.layoutCanvas */
type HoleCanvasLayout = {
  units?: "feet";
  fairwayWidthFt?: number;

  red?: {
    lengthFt?: number;
    basketOffsetRightFt?: number;
    hazardLeft?: { startFt?: number; lengthFt?: number; bitesIntoFairwayFt?: number };
    treeClumpRight?: { startFt?: number; lengthFt?: number; rightInsetIntoFairwayFt?: number };
    hill?: { startsFeetFromBasketApprox?: number; riseFtApprox?: number };
    forestBehindBasket?: { depthFt?: number; insetLeftFt?: number; insetRightFt?: number; density01?: number };
  };

  blue?: {
    lengthFt?: number;
    basketOffsetRightFt?: number;
    hazardLeft?: { startFt?: number; lengthFt?: number; bitesIntoFairwayFt?: number };
    treeClumpRight?: { startFt?: number; lengthFt?: number; rightInsetIntoFairwayFt?: number };
    hill?: { startsFeetFromBasketApprox?: number; riseFtApprox?: number };
    doglegFeel?: { bendStartFtApprox?: number; bendSeverity01?: number };
    forestBehindBasket?: { depthFt?: number; insetLeftFt?: number; insetRightFt?: number; density01?: number };
  };
};

function getLayoutFromHole(hole: any, tee: Tee) {
  const lc: HoleCanvasLayout | undefined = hole?.layoutCanvas;
  if (!lc) return null;

  const fairwayWidthFt = lc.fairwayWidthFt ?? 60;
  const teeBlock: any = (lc as any)?.[tee];
  if (!teeBlock) return null;

  const lengthFt = teeBlock.lengthFt ?? hole?.distance?.[tee] ?? 0;
  const basketOffsetRightFt = teeBlock.basketOffsetRightFt ?? 0;

  const hz = teeBlock.hazardLeft;
  const hazard =
    hz && (hz.startFt != null || hz.lengthFt != null || hz.bitesIntoFairwayFt != null)
      ? {
          startFt: hz.startFt ?? 100,
          lengthFt: hz.lengthFt ?? 40,
          biteIntoFairwayFt: hz.bitesIntoFairwayFt ?? 18,
        }
      : null;

  const tr = teeBlock.treeClumpRight;
  const trees =
    tr && (tr.startFt != null || tr.lengthFt != null || tr.rightInsetIntoFairwayFt != null)
      ? {
          startFt: tr.startFt ?? 130,
          lengthFt: tr.lengthFt ?? 45,
          rightInsetFt: tr.rightInsetIntoFairwayFt ?? 10,
        }
      : null;

  const hillStartFromBasketFt =
    teeBlock?.hill?.startsFeetFromBasketApprox ??
    hole?.terrainNotes?.elevation?.hillStartsFeetFromBasketApprox ??
    30;

  const hillRiseFt =
    teeBlock?.hill?.riseFtApprox ??
    hole?.terrainNotes?.elevation?.riseFeetApprox ??
    10;

  // ✅ Forest: allow explicit config, otherwise auto-default for holes that mention tree line / wooded basket
  const explicitForest = teeBlock?.forestBehindBasket ?? null;
  const desc = String(hole?.description ?? "").toLowerCase();
  const mentionsForest =
    desc.includes("tree line") ||
    desc.includes("treeline") ||
    desc.includes("forest") ||
    desc.includes("wood") ||
    desc.includes("tucked") ||
    desc.includes("basket") && desc.includes("trees");

  // Default is subtle but obvious: makes Hole 1 immediately “feel right”
  const forestBehindBasket =
    explicitForest ??
    (mentionsForest
      ? { depthFt: 26, insetLeftFt: 6, insetRightFt: 6, density01: 0.88 }
      : null);

  return {
    lengthFt,
    fairwayWidthFt,
    basketOffsetRightFt,
    hazard,
    trees,
    hillStartFromBasketFt,
    hillRiseFt,
    doglegFeel: teeBlock?.doglegFeel ?? null,
    forestBehindBasket,
  };
}

/**
 * Canvas pseudo-3D projection:
 * world X: left(-)/right(+), feet
 * world Z: distance from tee, feet
 */
function projectToCanvas(
  xFt: number,
  zFt: number,
  canvasW: number,
  canvasH: number,
  opts: { camY: number; camZ: number; fov: number; horizonY: number }
) {
  const dz = Math.max(1, zFt - opts.camZ);
  const scale = opts.fov / dz;
  const cx = canvasW * 0.5;
  const x = cx + xFt * scale;
  const y = opts.horizonY + opts.camY * scale;
  return { x, y, scale };
}

function drawPoly(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]) {
  if (pts.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
}

function strokeText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(0,0,0,0.60)";
  ctx.strokeText(text, x, y);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** Convert lane X (0..100) to world feet X (-half..+half) */
function laneXToFt(laneX: number, halfFairway: number) {
  const pct = clamp((laneX - 50) / 50, -1, 1);
  return pct * halfFairway;
}

/** Lane Y mapping: tee at 90, basket end at 10 (matches your svg) */
function zToLaneY(zFt: number, lenFt: number) {
  if (!lenFt || lenFt <= 0) return 90;
  const t = clamp(zFt / lenFt, 0, 1);
  return 90 - t * 80; // 90..10
}

/** Approx collision checks in world space */
function inSand(layout: any, xFt: number, zFt: number) {
  if (!layout?.hazard) return false;

  const h0 = layout.hazard.startFt;
  const h1 = h0 + layout.hazard.lengthFt;

  if (zFt < h0 || zFt > h1) return false;

  const half = layout.fairwayWidthFt / 2;
  const bite = layout.hazard.biteIntoFairwayFt ?? 18;

  return xFt < (-half + bite);
}

function inTrees(layout: any, xFt: number, zFt: number) {
  if (!layout?.trees) return false;

  const t0 = layout.trees.startFt;
  const t1 = t0 + layout.trees.lengthFt;

  if (zFt < t0 || zFt > t1) return false;

  const half = layout.fairwayWidthFt / 2;
  const inset = layout.trees.rightInsetFt ?? 10;

  return xFt > half - inset;
}


export default function PlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseId = searchParams.get("course");
  const hasCourseId = !!courseId;

  const teeParam = searchParams.get("tee");
  const tee: Tee = useMemo(() => {
    return teeParam === "red" || teeParam === "blue" ? teeParam : "blue";
  }, [teeParam]);

  // restore tee if missing
  useEffect(() => {
    if (!hasCourseId) return;
    if (teeParam === "red" || teeParam === "blue") return;

    try {
      const saved = window.localStorage.getItem(LS_LAST_TEE_KEY);
      if (saved === "red" || saved === "blue") {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tee", saved);
        router.replace(`/game/play?${params.toString()}`);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCourseId, teeParam]);

  useEffect(() => {
    try {
      if (tee === "red" || tee === "blue") window.localStorage.setItem(LS_LAST_TEE_KEY, tee);
    } catch {}
  }, [tee]);

  const [bestScore, setBestScore] = useState<number | null>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [discMenuOpen, setDiscMenuOpen] = useState(false);
  const [throwStyle, setThrowStyle] = useState<ThrowStyle>("backhand");

  const [holeIndex, setHoleIndex] = useState(0);
  const [strokesByHole, setStrokesByHole] = useState<number[]>([]);
  const [distanceRemainingByHole, setDistanceRemainingByHole] = useState<number[]>([]);
  const [holedOutByHole, setHoledOutByHole] = useState<boolean[]>([]);

  // aiming
  const [power, setPower] = useState(0);
  const [aimDeg, setAimDeg] = useState(0);
  const [isAiming, setIsAiming] = useState(false);
  const [lastDy, setLastDy] = useState(0);

  const [lastResultText, setLastResultText] = useState<string | null>(null);
  const [shotPreview, setShotPreview] = useState<{
    carry: number;
    newRemaining: number;
    aimDeg: number;
    kind: "throw" | "putt";
    curve: { x: number; y: number }[];
  } | null>(null);

  // sponsor/drone
  const [introPhase, setIntroPhase] = useState<IntroPhase>("play");
  const [sponsorOpen, setSponsorOpen] = useState(false);
  const [sponsorSeenKey, setSponsorSeenKey] = useState<string>("");

  const droneTimerRef = useRef<number | null>(null);
  const [droneProgress, setDroneProgress] = useState(0);

  // sound unlock
  const [soundUnlocked, setSoundUnlocked] = useState<boolean>(true);
  const [needsSoundTap, setNeedsSoundTap] = useState<boolean>(false);

  // refs for gestures
  const laneRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const activePointerIdRef = useRef<number | null>(null);

  const donkeyRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const a = new Audio("/game/audio/donkey.mp3");
    a.preload = "auto";
    donkeyRef.current = a;
  }, []);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(LS_SOUND_UNLOCKED_KEY);
      const ok = v === "1";
      setSoundUnlocked(ok);
      setNeedsSoundTap(!ok);
    } catch {
      setSoundUnlocked(false);
      setNeedsSoundTap(true);
    }
  }, []);

  const unlockSoundNow = async () => {
    try {
      const a = donkeyRef.current;
      if (a) {
        a.currentTime = 0;
        const p = a.play();
        if (p && typeof (p as any).then === "function") await p;
        a.pause();
        a.currentTime = 0;
      }
      window.localStorage.setItem(LS_SOUND_UNLOCKED_KEY, "1");
      setSoundUnlocked(true);
      setNeedsSoundTap(false);
    } catch {
      setSoundUnlocked(false);
      setNeedsSoundTap(true);
    }
  };

  // discs
  const discs: Disc[] = useMemo(
    () => [
      { id: "driver-1", name: "Workhorse Driver", type: "Driver", speed: 12, stability: 0.5 },
      { id: "mid-1", name: "Straight Mid", type: "Mid", speed: 5, stability: 0.0 },
      { id: "putter-1", name: "Putter", type: "Putter", speed: 2, stability: -0.1, puttBonus: 0.25 },
    ],
    []
  );
  const [discId, setDiscId] = useState(discs[0].id);
  const selectedDisc = useMemo(() => discs.find((d) => d.id === discId) ?? discs[0], [discId, discs]);

  // DGV sensitivity
  const POWER_SENSITIVITY = 0.35;
  const AIM_SENSITIVITY = 0.09;
  const PUTT_SENSITIVITY = 0.6;

  const clearTimers = () => {
    if (droneTimerRef.current) window.clearTimeout(droneTimerRef.current);
    droneTimerRef.current = null;
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  // best score
  useEffect(() => {
    if (!hasCourseId) {
      setBestScore(null);
      return;
    }
    try {
      setBestScore(getBestScore(courseId as string, tee));
    } catch {
      setBestScore(null);
    }
  }, [hasCourseId, courseId, tee]);

  // load course
  useEffect(() => {
    if (!hasCourseId) return;

    setLoadError(null);
    setCourseData(null);

    fetch(`/api/game/courses/${courseId}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        setCourseData(data);

        const holes: Hole[] = Array.isArray(data?.holes) ? data.holes : [];
        const holeCount = holes.length || 18;

        setHoleIndex(0);
        setStrokesByHole(Array(holeCount).fill(0));

        const initialRemaining = holes.length ? holes.map((h) => h?.distance?.[tee] ?? 0) : Array(holeCount).fill(0);
        setDistanceRemainingByHole(initialRemaining);
        setHoledOutByHole(Array(holeCount).fill(false));

        setPower(0);
        setAimDeg(0);
        setIsAiming(false);
        setLastDy(0);
        startRef.current = null;
        activePointerIdRef.current = null;

        setLastResultText(null);
        setShotPreview(null);

        setDiscId(discs[0].id);
        setThrowStyle("backhand");
        setDiscMenuOpen(false);

        setIntroPhase("play");
        setSponsorOpen(false);
        setSponsorSeenKey("");
        setDroneProgress(0);
        clearTimers();
      })
      .catch((e) => setLoadError(e?.message ?? "Failed to load course data"));
  }, [hasCourseId, courseId, tee, discs]);

  const holes: Hole[] = useMemo(() => (Array.isArray(courseData?.holes) ? (courseData.holes as Hole[]) : []), [courseData]);
  const course = courseData?.course ?? null;

  const holeCount = holes.length;
  const currentHole: Hole | null = holeCount ? holes[clamp(holeIndex, 0, holeCount - 1)] : null;

  const strokesThisHole = strokesByHole[holeIndex] ?? 0;
  const baseDist = currentHole?.distance?.[tee] ?? 0;
  const remaining = distanceRemainingByHole[holeIndex] ?? baseDist;
  const holedOut = holedOutByHole[holeIndex] ?? false;

  const isPuttingRange = remaining <= 45;
  const puttThreshold = 15;

  const windSeed = `${courseId ?? "no-course"}:${tee}:${currentHole?.id ?? `hole-${holeIndex + 1}`}`;
  const windDirDeg = Math.round(hash01(windSeed + ":dir") * 359);
  const windKph = Math.round(4 + hash01(windSeed + ":spd") * 14);

  const totalStrokes = useMemo(() => strokesByHole.reduce((sum, s) => sum + (s || 0), 0), [strokesByHole]);
  const totalPar = useMemo(() => holes.reduce((sum, h) => sum + (h?.par?.[tee] ?? 0), 0), [holes, tee]);
  const scoreToPar = totalStrokes - totalPar;

  const sponsor = useMemo(() => resolveSponsorForHole(currentHole), [currentHole]);

  const startDroneIntro = (opts?: { playDonkeyIfHole6?: boolean }) => {
    clearTimers();
    setIntroPhase("drone");
    setDroneProgress(0);

    setIsAiming(false);
    startRef.current = null;
    activePointerIdRef.current = null;
    setPower(0);
    setLastDy(0);

    if (opts?.playDonkeyIfHole6 && soundUnlocked && currentHole?.number === 6 && strokesThisHole === 0) {
      try {
        if (donkeyRef.current) donkeyRef.current.currentTime = 0;
        donkeyRef.current?.play().catch(() => {});
      } catch {}
    }

    const start = performance.now();
    const duration = 1650;

    const tick = () => {
      const t = clamp((performance.now() - start) / duration, 0, 1);
      setDroneProgress(t);
      if (t < 1) {
        droneTimerRef.current = window.setTimeout(tick, 33);
      } else {
        droneTimerRef.current = null;
        setIntroPhase("play");
      }
    };

    tick();
  };

  const openSponsor = () => {
    setSponsorOpen(true);
    setIntroPhase("sponsor");
  };
  const closeSponsorAndStartDrone = () => {
    setSponsorOpen(false);
    startDroneIntro({ playDonkeyIfHole6: true });
  };

  useEffect(() => {
    if (!currentHole) return;

    const key = `${courseId ?? "no-course"}:${tee}:h${currentHole.number}`;
    if (sponsorSeenKey === key) return;

    setSponsorSeenKey(key);
    setShotPreview(null);
    setLastResultText(null);
    setDiscMenuOpen(false);
    setPower(0);
    setIsAiming(false);
    startRef.current = null;
    activePointerIdRef.current = null;

    if (sponsor) openSponsor();
    else startDroneIntro({ playDonkeyIfHole6: true });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHole?.id, currentHole?.number, sponsor, tee, courseId]);

  const addPenaltyStrokes = (n: number) => {
    if (n <= 0) return;
    setStrokesByHole((prev) => {
      const copy = [...prev];
      copy[holeIndex] = (copy[holeIndex] ?? 0) + n;
      return copy;
    });
  };

  const registerStroke = () => {
    setStrokesByHole((prev) => {
      const copy = [...prev];
      copy[holeIndex] = (copy[holeIndex] ?? 0) + 1;
      return copy;
    });
  };

  const holeOut = () => {
    setHoledOutByHole((prev) => {
      const copy = [...prev];
      copy[holeIndex] = true;
      return copy;
    });
    setDistanceRemainingByHole((prev) => {
      const copy = [...prev];
      copy[holeIndex] = 0;
      return copy;
    });
  };

  const advanceHoleOrFinish = () => {
    if (!holes.length) return;

    if (holeIndex < holes.length - 1) {
      clearTimers();
      setHoleIndex(holeIndex + 1);
      setPower(0);
      setAimDeg(0);
      setIsAiming(false);
      setLastDy(0);
      startRef.current = null;
      activePointerIdRef.current = null;
      setLastResultText(null);
      setShotPreview(null);
      setDiscMenuOpen(false);
      setSponsorOpen(false);
      setIntroPhase("play");
      return;
    }

    if (!hasCourseId) return;

    const finalTotal = strokesByHole.reduce((sum, s) => sum + (s || 0), 0);
    const result = setBestScoreIfBetter(courseId as string, tee, finalTotal);
    setBestScore(result.best);

    alert(
      `Round Complete!\n` +
        `Tee: ${tee.toUpperCase()}\n` +
        `Total: ${finalTotal}\n` +
        `To Par: ${fmtSigned(finalTotal - totalPar)}\n` +
        `Best (${tee.toUpperCase()}): ${result.best}` +
        (result.updated ? " ✅ NEW BEST!" : "")
    );

    router.push(`/game/courses/in-the-pitts`);
  };

const simulateThrowCarryFeet = (usedPower: number) => {
  if (!layout || layout.lengthFt <= 0) return 0;

  const max = layout.lengthFt * 0.92;

  // realistic curve: low power small, high power big
  const power01 = clamp(usedPower / 100, 0, 1);

  const discFactor = 0.75 + selectedDisc.speed * 0.08;

  let carry = max * power01 * discFactor;

  // small randomness
  carry += (hash01(`${windSeed}:jitter:${strokesThisHole}`) - 0.5) * 8;

  return clamp(carry, 0, layout.lengthFt);
};


  const buildCurve = (kind: "throw" | "putt", usedPower01: number, aim: number) => {
  const pts: { x: number; y: number }[] = [];
  const n = 32;

  // Aim still bends the line, but power controls how far "up" the path goes.
  const aimClamped = clamp(aim, -35, 35);

  // Path length: short at low power, long at high power
  const maxSpan = kind === "putt" ? 55 : 82; // percent of lane height
  const span = clamp(maxSpan * (0.22 + usedPower01 * 0.92), 18, maxSpan);

  const y0 = 92;
  const yEnd = y0 - span;

  const x0 = 50 + aimClamped * (kind === "putt" ? 0.40 : 0.70);
  const xEnd = 50 + aimClamped * (kind === "putt" ? 0.22 : 0.35);

  const stab = clamp(selectedDisc.stability, -1.2, 1.2);
  const fhFlip = throwStyle === "forehand" ? -1 : 1;

  const turn = clamp((-stab * 0.95 + 0.18) * fhFlip, -1.4, 1.4);
  const fade = clamp((stab * 1.05 + 0.25) * fhFlip, -1.4, 1.4);

  const baseMag = kind === "putt" ? 4 : 20;
  const mag = baseMag * (0.25 + usedPower01 * 0.95);

  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);

    // y now ends early if power is low
    const y = y0 - t * span;

    const early = Math.pow(1 - t, 1.35) * Math.sin(Math.PI * t);
    const late = Math.pow(t, 1.35) * Math.sin(Math.PI * t);

    const curve = early * turn * mag + late * fade * (mag * 0.92);

    const windRad = (windDirDeg * Math.PI) / 180;
    const windCross = Math.sin(windRad - (aimClamped * Math.PI) / 180);
    const windX = windCross * (windKph * 0.12);

    const x = x0 + (xEnd - x0) * t + curve + windX;
    pts.push({ x: clamp(x, 6, 94), y: clamp(y, 7, 94) });
  }

  return pts;
};


  const setPreview = (kind: "throw" | "putt", carry: number, newRemaining: number, curve: { x: number; y: number }[]) => {
    setShotPreview({
      kind,
      carry: Math.round(carry),
      newRemaining: Math.round(newRemaining),
      aimDeg: Math.round(aimDeg),
      curve,
    });
    window.setTimeout(() => setShotPreview(null), 1100);
  };

  // ✅ ONE canonical blocker
  const laneBlocked = introPhase !== "play" || sponsorOpen || needsSoundTap;

  // ===== Layout + lane overlay basket position =====
  const layout = useMemo(() => getLayoutFromHole(currentHole, tee), [currentHole, tee]);

  const basketY = 10;
  const basketX = useMemo(() => {
    if (!layout) return 50;
    const half = (layout.fairwayWidthFt ?? 60) / 2;
    const xFt = layout.basketOffsetRightFt ?? 0;
    const pct = xFt / Math.max(1, half);
    const x = 50 + pct * 38;
    return clamp(x, 8, 92);
  }, [layout]);

  const discX = 50 + (aimDeg / 30) * 28;
  const discY = 90;

  const modeHint = isPuttingRange ? "DGV: drag DOWN to throw • drag UP to putt" : "DGV: drag DOWN to throw";
  const holePar = currentHole?.par?.[tee] ?? 0;
  const holeDist = currentHole?.distance?.[tee] ?? 0;
  const holeDesc = currentHole?.description ?? "No description yet.";

  const liveKind: "throw" | "putt" = isPuttingRange && lastDy < 0 ? "putt" : "throw";
  const liveCurve = isAiming && power >= 5 ? buildCurve(liveKind, clamp(power / 100, 0, 1), aimDeg) : null;

  const getHazardPenalty = () => {
    const hz = Array.isArray(currentHole?.hazards) ? currentHole?.hazards?.[0] : null;
    const p = hz?.rule?.penaltyStrokes;
    return typeof p === "number" ? p : 1;
  };

  const puttMakeChance = (puttPower01: number): number => {
    // Putt success chance: low power (0.0) = 15%, full power (1.0) = 85%
    // Disc puttBonus adds extra ~25% boost to the chance
    const baseChance = 0.15 + puttPower01 * 0.7;
    const discBonus = selectedDisc.puttBonus ?? 0;
    return Math.min(0.95, baseChance + discBonus);
  };

  const estimateLandingXFtFromCurve = (curve: { x: number; y: number }[] | null, halfFairway: number) => {
  // Use aimDeg directly as the primary driver (so player can actually aim left/right),
  // and curve end only as a light modifier.
  const aimPct = clamp(aimDeg / 35, -1, 1);
  let laneX = 50 + aimPct * 42; // stronger left/right reach than before

  if (curve?.length) {
    const end = curve[curve.length - 1];
    laneX = laneX * 0.75 + end.x * 0.25; // blend in a bit of curve "shape"
  }

  return laneXToFt(clamp(laneX, 6, 94), halfFairway);
};


  const doThrow = (usedPower: number) => {
    if (!currentHole || holedOut) return;

    registerStroke();

    let carry = Math.round(simulateThrowCarryFeet(usedPower));
    let newRemaining = Math.max(0, Math.round(remaining - carry));

    const curve = buildCurve("throw", clamp(usedPower / 100, 0, 1), aimDeg);
    setPreview("throw", carry, newRemaining, curve);

    // --- interaction (trees + sand) ---
if (layout && layout.lengthFt > 0) {
  const half = (layout.fairwayWidthFt ?? 60) / 2;

  // ✅ IMPORTANT: carry is from current lie, not from tee.
  // Convert to absolute "z from tee" using progress along the hole.
  const prevProgressZ = clamp(layout.lengthFt - remaining, 0, layout.lengthFt);
  const newProgressZ = clamp(prevProgressZ + carry, 0, layout.lengthFt);

  const zLand = newProgressZ;
  const xLand = estimateLandingXFtFromCurve(curve, half);

  let extra = "";

  if (inTrees(layout, xLand, zLand)) {
    const loss = 25 + Math.round(hash01(`${windSeed}:tree:${strokesThisHole + 1}`) * 55);
    carry = Math.max(0, carry - loss);

    // recompute newRemaining based on adjusted carry
    newRemaining = Math.max(0, Math.round(remaining - carry));

    extra += ` • 🌲 TREE HIT (-${loss}ft)`;
  }

  if (inSand(layout, xLand, zLand)) {
    const pen = getHazardPenalty();
    addPenaltyStrokes(pen);
    extra += ` • 🟨 SAND +${pen}`;
  }

  setLastResultText(`THROW: ${carry} ft • Remaining: ${newRemaining} ft${extra}`);
} else {
  setLastResultText(`THROW: ${carry} ft • Remaining: ${newRemaining} ft`);
}


    setDistanceRemainingByHole((prev) => {
      const copy = [...prev];
      copy[holeIndex] = newRemaining;
      return copy;
    });

    setDiscMenuOpen(false);
  };

  const doPutt = (puttPower01: number) => {
    if (!currentHole || holedOut) return;

    registerStroke();

    const seed = `${windSeed}:putt:${strokesThisHole + 1}:${selectedDisc.id}`;
    const roll = hash01(seed);
    const chance = puttMakeChance(puttPower01);
    const curve = buildCurve("putt", clamp(puttPower01, 0, 1), aimDeg * 0.45);

    if (remaining <= puttThreshold || roll < chance) {
      setLastResultText("PUTT: ✅ Chains!");
      setPreview("putt", remaining, 0, curve);
      holeOut();
      setDiscMenuOpen(false);
      setTimeout(() => advanceHoleOrFinish(), 650);
      return;
    }

    const missLeft = 6 + Math.round(hash01(seed + ":miss") * 12);
    setLastResultText(`PUTT: ❌ Missed • ${missLeft} ft left`);
    setPreview("putt", remaining - missLeft, missLeft, curve);

    setDistanceRemainingByHole((prev) => {
      const copy = [...prev];
      copy[holeIndex] = missLeft;
      return copy;
    });

    setDiscMenuOpen(false);
  };

  // ===== INPUT (DGV) =====
  const beginAim = (x: number, y: number) => {
    if (laneBlocked || holedOut) return;
    startRef.current = { x, y };
    setIsAiming(true);
    setPower(0);
    setLastDy(0);
  };

  const moveAim = (x: number, y: number) => {
    if (laneBlocked) return;
    if (!isAiming || !startRef.current) return;

    const dy = y - startRef.current.y;
    const dx = x - startRef.current.x;

    setLastDy(dy);
    setAimDeg(clamp(dx * AIM_SENSITIVITY, -30, 30));

    if (dy >= 0) setPower(clamp(dy * POWER_SENSITIVITY, 0, 100));
    else {
      if (isPuttingRange) setPower(clamp((-dy) * PUTT_SENSITIVITY, 0, 100));
      else setPower(0);
    }
  };

  const endAim = () => {
    if (laneBlocked) return;
    if (!isAiming) return;

    const dy = lastDy;
    const usedPower = power;

    setIsAiming(false);
    startRef.current = null;
    activePointerIdRef.current = null;
    setLastDy(0);

    if (usedPower < 5) {
      setPower(0);
      return;
    }

    if (dy < 0 && isPuttingRange) doPutt(clamp(usedPower / 100, 0, 1));
    else doThrow(usedPower);

    setPower(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (laneBlocked) return;
    e.preventDefault();
    const t = e.touches[0];
    beginAim(t.clientX, t.clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (laneBlocked) return;
    if (!isAiming) return;
    e.preventDefault();
    const t = e.touches[0];
    moveAim(t.clientX, t.clientY);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (laneBlocked) return;
    e.preventDefault();
    endAim();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (laneBlocked) return;
    e.preventDefault();
    beginAim(e.clientX, e.clientY);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (laneBlocked) return;
    if (!isAiming) return;
    moveAim(e.clientX, e.clientY);
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (laneBlocked) return;
    e.preventDefault();
    endAim();
  };

  // ===== CANVAS DRAW =====
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const cssW = parent.clientWidth;
      const cssH = parent.clientHeight;
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

      const w = Math.max(1, Math.floor(cssW * dpr));
      const h = Math.max(1, Math.floor(cssH * dpr));

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = `${cssW}px`;
        canvas.style.height = `${cssH}px`;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, w, h);

      // background
      ctx.fillStyle = "rgba(12,14,16,0.34)";
      ctx.fillRect(0, 0, w, h);

      // subtle vignette
      ctx.save();
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.65, 10, w * 0.5, h * 0.65, Math.max(w, h) * 0.7);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.28)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      if (!layout) {
        ctx.save();
        ctx.font = `${Math.max(12, 14 * (w / 900))}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        strokeText(ctx, "MAP: (no layoutCanvas for this hole yet)", 14, 12);
        ctx.restore();
        return;
      }

      // ✅ Slightly tweaked camera so the basket-end gets more screen space (less “everything is far away”)
      const cam = { camY: 860, camZ: -25, fov: 760, horizonY: h * 0.16 };

      const len = Number(layout.lengthFt ?? 0);
      const fairW = Number(layout.fairwayWidthFt ?? 60);
      const halfFairway = fairW / 2;

      if (!Number.isFinite(len) || len <= 0) {
        ctx.save();
        ctx.font = `${Math.max(12, 14 * (w / 900))}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        strokeText(ctx, "MAP: layout length invalid", 14, 12);
        ctx.restore();
        return;
      }

      const P = (xFt: number, zFt: number) => projectToCanvas(xFt, zFt, w, h, cam);

      const basketZ = len;
      const basketXFt = Number(layout.basketOffsetRightFt ?? 0);

  // ===== FOREST BEHIND BASKET =====
if (layout.forestBehindBasket?.depthFt) {

  const depth = layout.forestBehindBasket.depthFt;
  const z0 = basketZ + 4;
  const z1 = basketZ + depth + 4;

  const left = -halfFairway;
  const right = halfFairway;

  const p1 = P(left, z0);
  const p2 = P(right, z0);
  const p3 = P(right, z1);
  const p4 = P(left, z1);

  drawPoly(ctx,[p1,p2,p3,p4]);
  ctx.fillStyle="rgba(15,40,18,0.45)";
  ctx.fill();

  // tree trunks
  for(let i=0;i<12;i++){
    const r=hash01(`forest:${i}`);
    const x=left+(right-left)*r;
    const z=z0+(z1-z0)*hash01(`forestz:${i}`);
    const p=P(x,z);

    const s=60*p.scale;
    ctx.fillStyle="rgba(20,60,30,0.9)";
    ctx.fillRect(p.x-s/2,p.y-s,s,s);
  }
}



      const far = P(halfFairway, basketZ);
      const farL = P(-halfFairway, basketZ);
      const near = P(halfFairway, 0);
      const nearL = P(-halfFairway, 0);

      // fairway
      drawPoly(ctx, [
        { x: nearL.x, y: nearL.y },
        { x: near.x, y: near.y },
        { x: far.x, y: far.y },
        { x: farL.x, y: farL.y },
      ]);
      ctx.fillStyle = "rgba(90,220,135,0.26)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = Math.max(2, 2.4 * (w / 900));
      ctx.stroke();

      // hill area
      const hillStartFromBasketFt = Number(layout.hillStartFromBasketFt ?? 30);
      const hillStartZ = Math.max(0, basketZ - hillStartFromBasketFt);
      const hillNearR = P(halfFairway, hillStartZ);
      const hillNearL = P(-halfFairway, hillStartZ);

      drawPoly(ctx, [
        { x: hillNearL.x, y: hillNearL.y },
        { x: hillNearR.x, y: hillNearR.y },
        { x: far.x, y: far.y },
        { x: farL.x, y: farL.y },
      ]);
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fill();


      // hazard (left bite)
      if (layout.hazard && (layout.hazard.lengthFt ?? 0) > 0 && (layout.hazard.biteIntoFairwayFt ?? 0) > 0) {
        const hz0 = Number(layout.hazard.startFt ?? 0);
        const hz1 = hz0 + Number(layout.hazard.lengthFt ?? 0);
        const bite = Number(layout.hazard.biteIntoFairwayFt ?? 0);

        const hzNearL = P(-halfFairway, hz0);
        const hzNearR = P(-halfFairway + bite, hz0);
        const hzFarR = P(-halfFairway + bite, hz1);
        const hzFarL = P(-halfFairway, hz1);

        drawPoly(ctx, [
          { x: hzNearL.x, y: hzNearL.y },
          { x: hzNearR.x, y: hzNearR.y },
          { x: hzFarR.x, y: hzFarR.y },
          { x: hzFarL.x, y: hzFarL.y },
        ]);
        ctx.fillStyle = "rgba(235,195,110,0.34)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.stroke();
      }

      // ===== TREES (clump near basket end) — draw as a visible tree line wall =====
if (layout.trees && layout.trees.lengthFt > 0) {
  const t0 = Number(layout.trees.startFt ?? 0);
  const t1 = t0 + Number(layout.trees.lengthFt ?? 0);
  const inset = Number(layout.trees.rightInsetFt ?? 10);

  const leftEdge = -halfFairway;
  const rightEdge = halfFairway;
  const treeLeftEdge = rightEdge - inset; // trees bite in from the right side

  // ground slab for the tree region
  const aL = P(treeLeftEdge, t0);
  const aR = P(rightEdge, t0);
  const bR = P(rightEdge, t1);
  const bL = P(treeLeftEdge, t1);

  drawPoly(ctx, [{ x: aL.x, y: aL.y }, { x: aR.x, y: aR.y }, { x: bR.x, y: bR.y }, { x: bL.x, y: bL.y }]);
  ctx.fillStyle = "rgba(18,45,22,0.22)";
  ctx.fill();

  // tree "wall" sprites
  const count = 18;
  for (let i = 0; i < count; i++) {
    const r = hash01(`${windSeed}:treesWall:${currentHole?.id}:${tee}:${i}`);
    const rr = hash01(`${windSeed}:treesWall2:${currentHole?.id}:${tee}:${i}`);

    const xFt = treeLeftEdge + (rightEdge - treeLeftEdge) * r;
    const zFt = t0 + (t1 - t0) * rr;

    const p = P(xFt, zFt);
    const size = Math.max(10, 110 * p.scale);

    ctx.fillStyle = "rgba(18,45,22,0.95)";
    ctx.fillRect(p.x - size / 2, p.y - size, size, size);

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.strokeRect(p.x - size / 2, p.y - size, size, size);
  }
}


      // basket marker
      const b = P(basketXFt, basketZ);
      ctx.save();
      ctx.fillStyle = "rgba(140,255,200,0.90)";
      ctx.beginPath();
      ctx.arc(b.x, b.y, Math.max(7, 9 * (w / 900)), 0, Math.PI * 2);
      ctx.fill();

      ctx.font = `${Math.max(12, 14 * (w / 900))}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      strokeText(ctx, "BASKET", b.x, b.y + 10);
      ctx.restore();

      // debug label
      ctx.save();
      ctx.font = `${Math.max(12, 14 * (w / 900))}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      strokeText(ctx, `MAP: Hole ${currentHole?.number ?? holeIndex + 1} (${tee.toUpperCase()})`, 14, 12);

      const hz = layout.hazard
        ? `HZ start:${layout.hazard.startFt} len:${layout.hazard.lengthFt} bite:${layout.hazard.biteIntoFairwayFt}`
        : "HZ: none";
      const tr = layout.trees
        ? `TREES start:${layout.trees.startFt} len:${layout.trees.lengthFt} inset:${layout.trees.rightInsetFt}`
        : "TREES: none";
      const fw = layout.forestBehindBasket ? `FOREST depth:${layout.forestBehindBasket.depthFt ?? 26}` : "FOREST: none";
      strokeText(ctx, `${hz} • ${tr} • ${fw}`, 14, 34);
      ctx.restore();
    };

    draw();

    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [layout, currentHole?.id, currentHole?.number, holeIndex, tee, windSeed]);

  // ===== UI values =====
  const sponsorUi = useMemo(() => resolveSponsorForHole(currentHole), [currentHole]);

  // ===== Lane overlay “true” hazard/trees/forest Y positions (NOT hard-coded) =====
  const laneZones = useMemo(() => {
    if (!layout || !layout.lengthFt || layout.lengthFt <= 0) return null;

    const len = Number(layout.lengthFt);
    const half = Number(layout.fairwayWidthFt ?? 60) / 2;

    // hazard zone in lane coordinates
    const hazard = layout.hazard
      ? (() => {
          const z0 = Number(layout.hazard.startFt ?? 0);
          const z1 = z0 + Number(layout.hazard.lengthFt ?? 0);
          const yTop = zToLaneY(z1, len);
          const yBot = zToLaneY(z0, len);
          // left bite width in lane % (fairway half => ~50% to edge; we use a sane cap)
          const biteFt = Number(layout.hazard.biteIntoFairwayFt ?? 0);
          const bitePct = clamp((biteFt / Math.max(1, half)) * 50, 8, 30);
          return { yTop, yBot, bitePct };
        })()
      : null;

    const trees = layout.trees
      ? (() => {
          const t0 = Number(layout.trees.startFt ?? 0);
          const t1 = t0 + Number(layout.trees.lengthFt ?? 0);
          // visually bias to basket end
          const z0 = Math.max(0, t0);
          const z1 = Math.min(len, Math.max(t1, len - 12));
          const yTop = zToLaneY(z1, len);
          const yBot = zToLaneY(z0, len);
          const insetFt = Number(layout.trees.rightInsetFt ?? 10);
          const insetPct = clamp((insetFt / Math.max(1, half)) * 50, 8, 30);
          return { yTop, yBot, insetPct };
        })()
      : null;

    const forest = layout.forestBehindBasket
      ? (() => {
          const depth = Number(layout.forestBehindBasket.depthFt ?? 26);
          const z0 = len + 6;
          const z1 = len + 6 + depth;
          const yTop = zToLaneY(z1, len); // clamps to 10
          const yBot = zToLaneY(z0, len); // clamps to 10
          // Instead of relying on clamped y (both become 10), we render a fixed “band” above basket:
          const bandTop = 2;
          const bandBot = 12;
          return { bandTop, bandBot };
        })()
      : null;

    return { hazard, trees, forest };
  }, [layout]);

  return (
    <div className="game-screen">
      {/* ONE-TIME SOUND UNLOCK */}
      {needsSoundTap && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(0,0,0,0.78)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
          }}
        >
          <div
            style={{
              width: "min(560px, 92vw)",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(18,18,22,0.95)",
              padding: 18,
              textAlign: "center",
              boxShadow: "0 12px 36px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ opacity: 0.85, fontSize: 12, marginBottom: 8 }}>AUDIO</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>Tap to enable sound</div>
            <div style={{ opacity: 0.8, fontSize: 13, marginBottom: 14 }}>
              iPhone blocks game audio until you tap once. This unlocks the donkey + future sounds.
            </div>
            <button className="btn-next" style={{ padding: "12px 16px" }} onClick={unlockSoundNow} type="button">
              ENABLE SOUND
            </button>
            <div style={{ marginTop: 10, opacity: 0.6, fontSize: 12 }}>(This is saved — you won’t see it again.)</div>
          </div>
        </div>
      )}

      {/* Sponsor popup */}
      {sponsorOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "min(560px, 92vw)",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(18,18,22,0.95)",
              padding: 18,
              textAlign: "center",
              boxShadow: "0 12px 36px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ opacity: 0.8, fontSize: 12, marginBottom: 8 }}>HOLE SPONSOR</div>
            {sponsorUi ? (
              <>
                <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>{sponsorUi.name}</div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <img
                    src={sponsorUi.logo}
                    alt={sponsorUi.name}
                    style={{
                      maxWidth: 320,
                      width: "80%",
                      height: "auto",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                    onError={(e) => (((e.currentTarget as HTMLImageElement).style.display = "none"), undefined)}
                  />
                </div>
              </>
            ) : (
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>No Sponsor Yet</div>
            )}

            <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="btn-next" style={{ padding: "10px 14px" }} onClick={closeSponsorAndStartDrone} type="button">
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drone overlay */}
      {introPhase === "drone" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
          }}
          onClick={() => {
            clearTimers();
            setIntroPhase("play");
          }}
        >
          <div
            style={{
              width: "min(640px, 96vw)",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(18,18,22,0.95)",
              padding: 16,
              textAlign: "center",
              boxShadow: "0 12px 36px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ opacity: 0.8, fontSize: 12, marginBottom: 8 }}>DRONE FLYOVER</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>
              Hole {currentHole?.number ?? holeIndex + 1} • Par {holePar} • {holeDist} ft
            </div>
            <div style={{ opacity: 0.85, marginBottom: 12 }}>{holeDesc}</div>

            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: "rgba(255,255,255,0.10)",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div style={{ height: "100%", width: `${Math.round(droneProgress * 100)}%`, background: "rgba(120,180,255,0.65)" }} />
            </div>

            <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>Tap anywhere to skip</div>
          </div>
        </div>
      )}

      {/* HUD */}
      <div className="hud-top">
        <div>
          Hole {holes.length ? holeIndex + 1 : 0}/{holes.length || 18}
        </div>
        <div>Par {holePar}</div>
        <div>{holeDist} ft</div>
        <div style={{ opacity: 0.85, fontSize: 12 }}>
          Tees: <b>{tee.toUpperCase()}</b>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn-next" style={{ padding: "6px 10px", fontSize: 12 }} type="button" onClick={() => setDiscMenuOpen((v) => !v)}>
            DISC: {selectedDisc.name}
          </button>

          <button className="btn-next" style={{ padding: "6px 10px", fontSize: 12 }} type="button" onClick={() => setThrowStyle((s) => (s === "backhand" ? "forehand" : "backhand"))}>
            {throwStyle === "backhand" ? "BH" : "FH"}
          </button>
        </div>

        <div style={{ opacity: 0.85, fontSize: 12 }}>
          Best: <b>{bestScore ?? "—"}</b>
        </div>
      </div>

      {/* Disc menu */}
      {discMenuOpen && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "center",
            padding: "0 12px",
          }}
        >
          {discs.map((d) => (
            <button
              key={d.id}
              className="btn-next"
              style={{
                padding: "8px 10px",
                fontSize: 12,
                opacity: d.id === discId ? 1 : 0.75,
                border: d.id === discId ? "1px solid rgba(255,255,255,0.35)" : undefined,
              }}
              type="button"
              onClick={() => {
                setDiscId(d.id);
                setDiscMenuOpen(false);
              }}
            >
              {d.name} ({d.type})
            </button>
          ))}
        </div>
      )}

      <div className="play-area">
        {!hasCourseId && <div style={{ padding: 18 }}>Missing course id.</div>}
        {loadError && <div style={{ padding: 18 }}>Error: {loadError}</div>}
        {hasCourseId && !loadError && !courseData && <div style={{ padding: 18 }}>Loading...</div>}

        {holes.length > 0 && currentHole && (
          <>
            <div style={{ opacity: 0.85, marginBottom: 8 }}>{course?.displayName ?? course?.name ?? "Course"}</div>

            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>{currentHole.name ?? `Hole ${currentHole.number}`}</div>
            <div style={{ opacity: 0.9, maxWidth: 760, textAlign: "center" }}>{holeDesc}</div>

            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                width: "100%",
                maxWidth: 820,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(0,0,0,0.22)",
                textAlign: "center",
                fontWeight: 900,
                letterSpacing: 0.2,
              }}
            >
              {lastResultText ? lastResultText : "Take a shot ✅ (result shows here)"}
            </div>

            <div style={{ marginTop: 10, opacity: 0.95, fontSize: 14 }}>
              Total: <b>{totalStrokes}</b> | To Par: <b>{fmtSigned(scoreToPar)}</b>
            </div>

            <div style={{ marginTop: 14, width: "100%", maxWidth: 820 }}>
              <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>
                Canvas fairway map (from hole JSON layoutCanvas) • Lane overlay stays DGV-style
              </div>

              <div
                ref={laneRef}
                style={{
                  height: 220,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  position: "relative",
                  overflow: "hidden",
                  userSelect: "none",
                  touchAction: "none",
                  cursor: isAiming ? "grabbing" : "grab",
                }}
                onPointerDown={(e) => {
                  if (laneBlocked || holedOut) return;
                  e.preventDefault();
                  activePointerIdRef.current = e.pointerId;
                  try {
                    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                  } catch {}
                  beginAim(e.clientX, e.clientY);
                }}
                onPointerMove={(e) => {
                  if (laneBlocked) return;
                  if (activePointerIdRef.current !== e.pointerId) return;
                  e.preventDefault();
                  moveAim(e.clientX, e.clientY);
                }}
                onPointerUp={(e) => {
                  if (laneBlocked) return;
                  if (activePointerIdRef.current !== e.pointerId) return;
                  e.preventDefault();
                  try {
                    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
                  } catch {}
                  endAim();
                }}
                onPointerCancel={() => endAim()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  if (isAiming) endAim();
                }}
              >
                <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

                {/* center line */}
                <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.10)" }} />

                {/* ✅ Lane overlay zones are now DATA-DRIVEN (NOT hard-coded %) */}
                {laneZones?.hazard && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: `${laneZones.hazard.yTop}%`,
                      height: `${Math.max(2, laneZones.hazard.yBot - laneZones.hazard.yTop)}%`,
                      width: `${laneZones.hazard.bitePct}%`,
                      background: "rgba(235,195,110,0.12)",
                      border: "1px solid rgba(235,195,110,0.22)",
                      borderLeft: "none",
                      borderRadius: 10,
                      pointerEvents: "none",
                    }}
                    title="Sand hazard (from layoutCanvas feet)"
                  />
                )}

                {laneZones?.trees && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: `${laneZones.trees.yTop}%`,
                      height: `${Math.max(2, laneZones.trees.yBot - laneZones.trees.yTop)}%`,
                      width: `${laneZones.trees.insetPct}%`,
                      background: "rgba(18,45,22,0.14)",
                      border: "1px solid rgba(18,45,22,0.22)",
                      borderRight: "none",
                      borderRadius: 10,
                      pointerEvents: "none",
                    }}
                    title="Tree clump (from layoutCanvas feet)"
                  />
                )}

                {/* Forest wall band behind basket */}
                {laneZones?.forest && (
                  <div
                    style={{
                      position: "absolute",
                      left: "6%",
                      right: "6%",
                      top: `${laneZones.forest.bandTop}%`,
                      height: `${laneZones.forest.bandBot - laneZones.forest.bandTop}%`,
                      background: "rgba(12,40,18,0.20)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 10,
                      pointerEvents: "none",
                    }}
                    title="Forest wall behind basket"
                  />
                )}

                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  <circle cx={basketX} cy={10} r={3.2} fill="rgba(140,255,200,0.95)" />
                  <text x={basketX} y={17} fontSize="4.3" textAnchor="middle" fill="rgba(255,255,255,0.75)">
                    BASKET
                  </text>

                  <circle cx={discX} cy={90} r={3.0} fill="rgba(255,255,255,0.92)" />

                  {liveCurve && (
                    <path
                      d={liveCurve.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ")}
                      fill="none"
                      stroke={liveKind === "putt" ? "rgba(120,255,180,0.65)" : "rgba(140,200,255,0.65)"}
                      strokeWidth="1.8"
                      strokeDasharray="2.5 2.5"
                    />
                  )}

                  {shotPreview?.curve?.length ? (
                    <path
                      d={shotPreview.curve.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ")}
                      fill="none"
                      stroke={shotPreview.kind === "putt" ? "rgba(120,255,180,0.55)" : "rgba(120,180,255,0.55)"}
                      strokeWidth="2.0"
                    />
                  ) : null}
                </svg>

                <div style={{ position: "absolute", left: 12, bottom: 10, opacity: 0.88, fontSize: 12 }}>
                  Power: <b>{Math.round(power)}</b>% • Aim: <b>{Math.round(aimDeg)}°</b>
                </div>
                <div style={{ position: "absolute", right: 12, bottom: 10, opacity: 0.88, fontSize: 12 }}>
                  {modeHint}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <button className="btn-next" onClick={advanceHoleOrFinish} disabled={!holedOut} title={!holedOut ? "Hole not finished yet" : ""} type="button">
                {holeIndex < holes.length - 1 ? "NEXT HOLE" : "FINISH ROUND"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
