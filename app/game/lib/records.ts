export type Tee = "red" | "blue";

function recordKey(courseId: string, tee: Tee) {
  return `records:${courseId}:${tee}`;
}

export function getBestScore(courseId: string, tee: Tee): number | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(recordKey(courseId, tee));
  if (!raw) return null;

  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function setBestScoreIfBetter(
  courseId: string,
  tee: Tee,
  totalStrokes: number
): { updated: boolean; best: number } {
  if (typeof window === "undefined") {
    return { updated: false, best: totalStrokes };
  }

  const current = getBestScore(courseId, tee);

  if (current === null || totalStrokes < current) {
    localStorage.setItem(recordKey(courseId, tee), String(totalStrokes));
    return { updated: true, best: totalStrokes };
  }

  return { updated: false, best: current };
}
