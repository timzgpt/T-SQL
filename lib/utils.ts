export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function formatDuration(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export function grade(pct: number) {
  if (pct === 100) return { title: "Perfect run", sub: "You know every component of a SQL query." };
  if (pct >= 80) return { title: "Excellent work", sub: "You have a strong grip on the building blocks of SQL." };
  if (pct >= 60) return { title: "Good job", sub: "Solid basics — review the misses and go for a perfect score." };
  if (pct >= 40) return { title: "Getting there", sub: "Review the explanations below, then try again." };
  return { title: "Keep practicing", sub: "Open the study sheet, then give it another shot." };
}
