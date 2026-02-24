"use client";


import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBestScore, setBestScoreIfBetter } from "../lib/records";


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


/** Hole 1 prototype layout – applied to BOTH tees for now so you can see it everywhere */
// ===== Canvas layout types (reads hole.layoutCanvas from hole JSON) =====
type CanvasLayout = {
 lengthFt: number;
 fairwayWidthFt: number;
 basketOffsetRightFt: number;


 hazard: null | { startFt: number; lengthFt: number; biteIntoFairwayFt: number };
 trees: null | { startFt: number; lengthFt: number; rightInsetFt: number };


 hillStartFromBasketFt: number;
 hillRiseFt: number;


 // optional (blue tee)
 dogleg: null | { bendStartFt: number; bendSeverity01: number };
};


function getCanvasLayoutFromHole(hole: any, tee: Tee): CanvasLayout | null {
 const root = hole?.layoutCanvas;
 if (!root) return null;


 const perTee = root?.[tee];
 const lengthFt = perTee?.lengthFt ?? hole?.distance?.[tee] ?? 0;
 if (!lengthFt) return null;


 const fairwayWidthFt = root?.fairwayWidthFt ?? 60;
 const basketOffsetRightFt = perTee?.basketOffsetRightFt ?? 20;


 const hz = perTee?.hazardLeft;
 const hazard = hz
   ? {
       startFt: hz.startFt ?? 100,
       lengthFt: hz.lengthFt ?? 40,
       biteIntoFairwayFt: hz.bitesIntoFairwayFt ?? 18,
     }
   : null;


 const tr = perTee?.treeClumpRight;
 const trees = tr
   ? {
       startFt: tr.startFt ?? 130,
       lengthFt: tr.lengthFt ?? 45,
       rightInsetFt: tr.rightInsetIntoFairwayFt ?? 10,
     }
   : null;


 const hill = perTee?.hill ?? {};
 const hillStartFromBasketFt = hill.startsFeetFromBasketApprox ?? 30;
 const hillRiseFt = hill.riseFtApprox ?? 10;


 const dg = tee === "blue" ? perTee?.doglegFeel : null;
 const dogleg = dg
   ? {
       bendStartFt: dg.bendStartFtApprox ?? 70,
       bendSeverity01: dg.bendSeverity01 ?? 0.35,
     }
   : null;


 return {
   lengthFt,
   fairwayWidthFt,
   basketOffsetRightFt,
   hazard,
   trees,
   hillStartFromBasketFt,
   hillRiseFt,
   dogleg,
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


export default function PlayPage() {
 const router = useRouter();
 const searchParams = useSearchParams();


 const courseId = searchParams.get("course");
 const hasCourseId = !!courseId;


 // --- Tee: URL param + LocalStorage fallback (fixes iPhone refresh / missing tee param) ---
 const teeParam = searchParams.get("tee");
 const tee: Tee = useMemo(() => {
   return teeParam === "red" || teeParam === "blue" ? teeParam : "blue";
 }, [teeParam]);


 // If tee param is missing, restore from localStorage by rewriting URL (once)
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


 // Persist last tee whenever it IS present
 useEffect(() => {
   try {
     if (tee === "red" || tee === "blue") window.localStorage.setItem(LS_LAST_TEE_KEY, tee);
   } catch {}
 }, [tee]);


 // hydration-safe best score
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


 // result & trace
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


 // donkey
 const donkeyRef = useRef<HTMLAudioElement | null>(null);


 // Canvas
 const canvasRef = useRef<HTMLCanvasElement | null>(null);


 // Create audio once
 useEffect(() => {
   const a = new Audio("/game/audio/donkey.mp3");
   a.preload = "auto";
   donkeyRef.current = a;
 }, []);


 // Read localStorage once (client)
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


 const windArrow = useMemo(() => {
   const d = windDirDeg;
   if (d >= 337 || d < 22) return "→";
   if (d < 67) return "↗";
   if (d < 112) return "↑";
   if (d < 157) return "↖";
   if (d < 202) return "←";
   if (d < 247) return "↙";
   if (d < 292) return "↓";
   return "↘";
 }, [windDirDeg]);


 const totalStrokes = useMemo(() => strokesByHole.reduce((sum, s) => sum + (s || 0), 0), [strokesByHole]);
 const totalPar = useMemo(() => holes.reduce((sum, h) => sum + (h?.par?.[tee] ?? 0), 0), [holes, tee]);
 const scoreToPar = totalStrokes - totalPar;


 const sponsor = useMemo(() => resolveSponsorForHole(currentHole), [currentHole]);


 const startDroneIntro = (opts?: { playDonkeyIfHole6?: boolean }) => {
   clearTimers();
   setIntroPhase("drone");
   setDroneProgress(0);


   // lock input
   setIsAiming(false);
   startRef.current = null;
   activePointerIdRef.current = null;
   setPower(0);
   setLastDy(0);


   // donkey should feel like it starts with the drone
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


 // Sponsor: HOLD until Continue
 const openSponsor = () => {
   setSponsorOpen(true);
   setIntroPhase("sponsor");
 };
 const closeSponsorAndStartDrone = () => {
   setSponsorOpen(false);
   startDroneIntro({ playDonkeyIfHole6: true });
 };


 // hole change => sponsor HOLD => drone => play
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
   const base = usedPower * (2.4 + selectedDisc.speed * 0.42);
   const styleAdj = throwStyle === "forehand" ? -0.06 : 0.0;


   const aimRad = (aimDeg * Math.PI) / 180;
   const windRad = (windDirDeg * Math.PI) / 180;
   const along = Math.cos(windRad - aimRad);
   const windDistanceAdj = along * windKph * (1.1 - selectedDisc.stability) * 0.9;


   const jitterSeed = `${windSeed}:s${strokesThisHole + 1}:${selectedDisc.id}:${throwStyle}`;
   const jitter = (hash01(jitterSeed) - 0.5) * 18;


   return Math.max(0, base * (1 + styleAdj) + windDistanceAdj + jitter);
 };


 const puttMakeChance = (puttPower01: number) => {
   const bonus = selectedDisc.puttBonus ?? 0;
   const closeness = clamp((45 - remaining) / 45, 0, 1);
   return clamp(0.22 + closeness * 0.72 + bonus + puttPower01 * 0.12, 0.12, 0.98);
 };


 const buildCurve = (kind: "throw" | "putt", usedPower01: number, aim: number) => {
   const pts: { x: number; y: number }[] = [];
   const n = 32;


   const x0 = 50 + clamp(aim, -30, 30) * (kind === "putt" ? 0.35 : 0.65);
   const xEnd = 50 + clamp(aim, -30, 30) * (kind === "putt" ? 0.18 : 0.32);


   const stab = clamp(selectedDisc.stability, -1.2, 1.2);
   const fhFlip = throwStyle === "forehand" ? -1 : 1;


   const turn = clamp((-stab * 0.95 + 0.18) * fhFlip, -1.4, 1.4);
   const fade = clamp((stab * 1.05 + 0.25) * fhFlip, -1.4, 1.4);


   const baseMag = kind === "putt" ? 5 : 22;
   const mag = baseMag * (0.25 + usedPower01 * 0.95);


   for (let i = 0; i < n; i++) {
     const t = i / (n - 1);
     const y = 92 - t * 80;


     const early = Math.pow(1 - t, 1.35) * Math.sin(Math.PI * t);
     const late = Math.pow(t, 1.35) * Math.sin(Math.PI * t);


     const curve = early * turn * mag + late * fade * (mag * 0.92);


     const windRad = (windDirDeg * Math.PI) / 180;
     const windCross = Math.sin(windRad - (aim * Math.PI) / 180);
     const windX = windCross * (windKph * 0.14);


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


 const doThrow = (usedPower: number) => {
   if (!currentHole || holedOut) return;


   registerStroke();


   const carry = Math.round(simulateThrowCarryFeet(usedPower));
   const newRemaining = Math.max(0, Math.round(remaining - carry));
   const curve = buildCurve("throw", clamp(usedPower / 100, 0, 1), aimDeg);


   setLastResultText(`THROW: ${carry} ft • Remaining: ${newRemaining} ft`);
   setPreview("throw", carry, newRemaining, curve);


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


 // ✅ ONE canonical blocker (no duplicates)
 const laneBlocked = introPhase !== "play" || sponsorOpen || needsSoundTap;


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


   const dy = y - startRef.current.y; // DOWN throw, UP putt
   const dx = x - startRef.current.x;


   setLastDy(dy);
   setAimDeg(clamp(dx * 0.09, -30, 30));


   if (dy >= 0) setPower(clamp(dy * 0.35, 0, 100));
   else {
     if (isPuttingRange) setPower(clamp((-dy) * 0.6, 0, 100));
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


 // Touch + mouse fallbacks
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


 // Visual lane: basket fixed top, disc fixed bottom
 const basketX = 50;
 const basketY = 10;
 const discX = 50 + (aimDeg / 30) * 28;
 const discY = 90;


 const modeHint = isPuttingRange ? "DGV: drag DOWN to throw • drag UP to putt" : "DGV: drag DOWN to throw";
 const holePar = currentHole?.par?.[tee] ?? 0;
 const holeDist = currentHole?.distance?.[tee] ?? 0;
 const holeDesc = currentHole?.description ?? "No description yet.";


 const liveKind: "throw" | "putt" = isPuttingRange && lastDy < 0 ? "putt" : "throw";
 const liveCurve = isAiming && power >= 5 ? buildCurve(liveKind, clamp(power / 100, 0, 1), aimDeg) : null;


 // ===== Canvas render (Hole 1 both tees now) =====
const layout = useMemo(() => getCanvasLayoutFromHole(currentHole, tee), [currentHole, tee]);






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
       strokeText(ctx, "MAP: (no layout for this hole yet)", 14, 12);
       ctx.restore();
       return;
     }
strokeText(
 ctx,
 `DBG: len=${layout.lengthFt} fw=${layout.fairwayWidthFt} hz=${layout.hazard ? "Y" : "N"} tr=${layout.trees ? "Y" : "N"}`,
 14,
 34
);


     const cam = {
       camY: 1550,
       camZ: -10,
       fov: 950,
       horizonY: h * 0.16,
     };


     const len = layout.lengthFt;
     const halfFairway = layout.fairwayWidthFt / 2;
     const P = (xFt: number, zFt: number) => projectToCanvas(xFt, zFt, w, h, cam);
// blue tee dogleg: gently shifts the far end to the right after bendStart
const doglegShiftX = (zFt: number) => {
 if (!layout.dogleg) return 0;
 const { bendStartFt, bendSeverity01 } = layout.dogleg;
 if (zFt <= bendStartFt) return 0;


 const t = clamp((zFt - bendStartFt) / Math.max(1, layout.lengthFt - bendStartFt), 0, 1);
 // max shift ~ (fairwayWidth/2) * severity
 return (layout.fairwayWidthFt * 0.5) * bendSeverity01 * t;
};


     const basketZ = len;
     const basketXFt = layout.basketOffsetRightFt;


     const shiftNear = doglegShiftX(0);
     const shiftFar = doglegShiftX(basketZ);


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
     const hillStartZ = Math.max(0, basketZ - layout.hillStartFromBasketFt);
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


     // hazard (left bite) - optional
if (layout.hazard) {
 const hz0 = layout.hazard.startFt;
 const hz1 = layout.hazard.startFt + layout.hazard.lengthFt;
 const bite = layout.hazard.biteIntoFairwayFt;


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




     // trees right - optional
if (layout.trees) {
 const t0 = layout.trees.startFt;
 const t1 = layout.trees.startFt + layout.trees.lengthFt;


 const treeEdgeX = halfFairway;
 const treeInsetX = halfFairway - layout.trees.rightInsetFt;


 const trNearL = P(treeInsetX, t0);
 const trNearR = P(treeEdgeX + 12, t0);
 const trFarR = P(treeEdgeX + 12, t1);
 const trFarL = P(treeInsetX, t1);


 drawPoly(ctx, [
   { x: trNearL.x, y: trNearL.y },
   { x: trNearR.x, y: trNearR.y },
   { x: trFarR.x, y: trFarR.y },
   { x: trFarL.x, y: trFarL.y },
 ]);
 ctx.fillStyle = "rgba(18,45,22,0.58)";
 ctx.fill();
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


     // label
     ctx.save();
     ctx.font = `${Math.max(12, 14 * (w / 900))}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
     ctx.textAlign = "left";
     ctx.textBaseline = "top";
     strokeText(ctx, `MAP: Hole 1 (${tee.toUpperCase()})`, 14, 12);
     ctx.restore();
   };


   draw();


   const onResize = () => draw();
   window.addEventListener("resize", onResize);
   return () => window.removeEventListener("resize", onResize);
 }, [layout, currentHole?.id, tee]);


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


     {/* Sponsor popup (HOLD) */}
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
           {sponsor ? (
             <>
               <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>{sponsor.name}</div>
               <div style={{ display: "flex", justifyContent: "center" }}>
                 <img
                   src={sponsor.logo}
                   alt={sponsor.name}
                   style={{
                     maxWidth: 320,
                     width: "80%",
                     height: "auto",
                     borderRadius: 12,
                     border: "1px solid rgba(255,255,255,0.12)",
                   }}
                   onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
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


     {/* Drone overlay (skippable) */}
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
       <div style={{ opacity: 0.85, fontSize: 12 }}>
         Best: <b>{bestScore ?? "—"}</b>
       </div>
     </div>


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
               Canvas fairway prototype (Hole 1 both tees) • Lane overlay stays DGV-style
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


               <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.10)" }} />


               <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                 <circle cx={basketX} cy={basketY} r={3.2} fill="rgba(140,255,200,0.95)" />
                 <text x={basketX} y={basketY + 7} fontSize="4.3" textAnchor="middle" fill="rgba(255,255,255,0.75)">
                   BASKET
                 </text>


                 <circle cx={discX} cy={discY} r={3.0} fill="rgba(255,255,255,0.92)" />


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



