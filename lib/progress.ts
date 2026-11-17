"use client";

import { useSyncExternalStore } from "react";
import type { Attempt, ProgressState, QuestionStat } from "./types";

const KEY = "sqlquiz:progress:v2";
const EMPTY: ProgressState = { attempts: [], qstats: {}, bookmarks: [] };

let state: ProgressState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    /* storage unavailable — stay in memory */
  }
}

function commit(next: ProgressState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      loaded = false;
      load();
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return state;
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

/* ------------------------------ actions ------------------------------ */

export function recordAttempt(attempt: Attempt) {
  load();
  const qstats = { ...state.qstats };
  for (const a of attempt.answers) {
    if (a.chosen === null) continue;
    const prev: QuestionStat = qstats[a.questionId] ?? { seen: 0, correct: 0, lastCorrect: false, lastSeen: 0 };
    qstats[a.questionId] = {
      ...prev,
      seen: prev.seen + 1,
      correct: prev.correct + (a.correct ? 1 : 0),
      lastCorrect: a.correct,
      lastSeen: attempt.finishedAt,
    };
  }
  commit({ ...state, attempts: [attempt, ...state.attempts].slice(0, 200), qstats });
}

export function rateCard(questionId: string, known: boolean) {
  load();
  const prev: QuestionStat = state.qstats[questionId] ?? { seen: 0, correct: 0, lastCorrect: false, lastSeen: 0 };
  commit({ ...state, qstats: { ...state.qstats, [questionId]: { ...prev, known, lastSeen: Date.now() } } });
}

export function toggleBookmark(questionId: string) {
  load();
  const has = state.bookmarks.includes(questionId);
  commit({
    ...state,
    bookmarks: has ? state.bookmarks.filter((b) => b !== questionId) : [...state.bookmarks, questionId],
  });
}

export function resetProgress(quizId?: string) {
  load();
  if (!quizId) return commit(EMPTY);
  const prefix = quizId + ":";
  commit({
    attempts: state.attempts.filter((a) => a.quizId !== quizId),
    qstats: Object.fromEntries(Object.entries(state.qstats).filter(([k]) => !k.startsWith(prefix))),
    bookmarks: state.bookmarks.filter((b) => !b.startsWith(prefix)),
  });
}

export function exportProgress(): string {
  load();
  return JSON.stringify(state, null, 2);
}

export function importProgress(json: string) {
  const parsed = JSON.parse(json) as ProgressState;
  if (!Array.isArray(parsed.attempts) || typeof parsed.qstats !== "object") throw new Error("Invalid file");
  commit({ ...EMPTY, ...parsed });
}

/* ------------------------------ selectors ------------------------------ */

/** 0..1 mastery for one question: blends accuracy with the most recent result. */
export function questionMastery(s?: QuestionStat): number {
  if (!s || s.seen === 0) return s?.known ? 0.5 : 0;
  const acc = s.correct / s.seen;
  const recency = s.lastCorrect ? 1 : 0;
  return Math.min(1, acc * 0.6 + recency * 0.4);
}

export function isWeak(s?: QuestionStat): boolean {
  if (!s) return false;
  if (s.known === false) return true;
  return s.seen > 0 && (!s.lastCorrect || s.correct / s.seen < 0.6);
}

export function quizMastery(ids: string[], qstats: Record<string, QuestionStat>): number {
  if (!ids.length) return 0;
  return ids.reduce((sum, id) => sum + questionMastery(qstats[id]), 0) / ids.length;
}

export function studyStreak(attempts: Attempt[]): number {
  const days = new Set(attempts.map((a) => new Date(a.finishedAt).toDateString()));
  let streak = 0;
  const d = new Date();
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1); // streak survives until end of today
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
