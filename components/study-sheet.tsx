"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Check, Eye, EyeOff, Lightbulb, Printer, Search, X } from "lucide-react";
import { getQuiz } from "@/lib/quizzes";
import { questionMastery, toggleBookmark, useProgress } from "@/lib/progress";
import { FORMAT_LABELS, formatCorrectAnswer } from "@/lib/question-utils";
import { cn } from "@/lib/utils";
import { Badge, Button, ButtonLink, Card, DIFF_TONE } from "./ui";
import { SqlCode } from "./sql-code";

export function StudySheet({ quizId }: { quizId: string }) {
  const quiz = getQuiz(quizId)!;
  const { qstats, bookmarks } = useProgress();
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return quiz.questions.filter(
      (x) =>
        (!topic || x.topic === topic) &&
        (!onlyBookmarks || bookmarks.includes(x.id)) &&
        (!q ||
          [
            x.q,
            x.answer,
            x.explain,
            x.code ?? "",
            x.context ?? "",
            ...(x.acceptedAnswers ?? []),
            ...(x.matchPairs?.flatMap((pair) => [pair.left, pair.right]) ?? []),
            ...x.options,
          ]
            .join(" ")
            .toLowerCase()
            .includes(q)),
    );
  }, [quiz, query, topic, onlyBookmarks, bookmarks]);

  return (
    <div className="animate-fade-up">
      <Link href="/" className="no-print mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
        <ArrowLeft className="size-4" /> Library
      </Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="brand">Study sheet · Lesson {quiz.lesson}</Badge>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{quiz.title}</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            All {quiz.questions.length} questions with answers and explanations. Read first, then test yourself.
          </p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => (setHidden(!hidden), setRevealed(new Set()))}>
            {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />} {hidden ? "Show answers" : "Self-test mode"}
          </Button>
          <Button variant="secondary" onClick={() => window.print()} aria-label="Print study sheet">
            <Printer className="size-4" />
          </Button>
          <ButtonLink href={`/quiz/${quiz.id}`}>
            Start quiz <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
      </div>

      {/* Filters */}
      <div className="no-print sticky top-14 z-30 -mx-4 mb-6 border-b border-slate-200/70 bg-slate-50/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 dark:border-white/5 dark:bg-[#0b1215]/90">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-56 flex-1">
            <span className="sr-only">Search questions</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions, answers, code…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-base outline-none transition-colors focus:border-brand-600 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:focus:border-brand-400"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:text-slate-700">
                <X className="size-4" />
              </button>
            )}
          </label>
          <button
            type="button"
            aria-pressed={onlyBookmarks}
            onClick={() => setOnlyBookmarks(!onlyBookmarks)}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-colors",
              onlyBookmarks ? "border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-400" : "border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300",
            )}
          >
            <Bookmark className={cn("size-4", onlyBookmarks && "fill-current")} /> Bookmarked ({bookmarks.filter((b) => b.startsWith(quiz.id + ":")).length})
          </button>
        </div>
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5">
          {[null, ...quiz.topics].map((t) => (
            <button
              key={t ?? "all"}
              type="button"
              onClick={() => setTopic(t)}
              aria-pressed={topic === t}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                topic === t ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 hover:bg-slate-900/5 dark:text-slate-400 dark:hover:bg-white/10",
              )}
            >
              {t ?? "All topics"}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-3 text-sm text-slate-500" aria-live="polite">
        Showing {list.length} of {quiz.questions.length}
      </p>

      <div className="space-y-4">
        {list.map((item) => {
          const show = !hidden || revealed.has(item.id);
          const m = questionMastery(qstats[item.id]);
          const seen = qstats[item.id]?.seen ?? 0;
          const bm = bookmarks.includes(item.id);
          return (
            <Card key={item.id} className="break-inside-avoid p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  {item.index + 1}
                </span>
                <Badge tone="cyan">{item.topic}</Badge>
                <Badge tone={DIFF_TONE[item.difficulty]} className="capitalize">{item.difficulty}</Badge>
                <Badge tone="slate">{FORMAT_LABELS[item.format]}</Badge>
                {seen > 0 && (
                  <span className="text-xs text-slate-500">
                    Mastery <b className="tabular-nums text-slate-700 dark:text-slate-300">{Math.round(m * 100)}%</b> · seen {seen}×
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => toggleBookmark(item.id)}
                  aria-pressed={bm}
                  aria-label={bm ? "Remove bookmark" : "Bookmark question"}
                  className={cn("no-print ml-auto grid size-9 place-items-center rounded-lg transition-colors", bm ? "text-brand-700 dark:text-brand-400" : "text-slate-400 hover:bg-slate-900/5 dark:hover:bg-white/10")}
                >
                  <Bookmark className={cn("size-4", bm && "fill-current")} />
                </button>
              </div>
              {item.context && (
                <p className="mb-3 rounded-xl border border-brand-100 bg-brand-50/60 p-3 text-sm leading-relaxed dark:border-brand-500/15 dark:bg-brand-500/5">
                  {item.context}
                </p>
              )}
              <h2 className="mb-4 text-base font-semibold leading-snug">{item.q}</h2>
              {item.code && <SqlCode code={item.code} className="mb-4" />}
              {item.options.length > 0 && item.format !== "matching" && (
                <ul className="mb-4 grid gap-2 sm:grid-cols-2">
                {item.options.map((o, j) => {
                  const right = show && o === item.answer;
                  return (
                    <li
                      key={o}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm",
                        right ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : "border-slate-200 dark:border-white/10",
                      )}
                    >
                      <span className={cn("grid size-6 shrink-0 place-items-center rounded-md font-mono text-[11px] font-bold", right ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500 dark:bg-white/10")}>
                        {right ? <Check className="size-3.5" /> : String.fromCharCode(65 + j)}
                      </span>
                      <span className="flex-1">{o}</span>
                      {right && <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Correct</span>}
                    </li>
                  );
                })}
                </ul>
              )}
              {show && (item.format === "short-answer" || item.format === "coding" || item.format === "matching") && (
                <div className="mb-4 rounded-lg border border-emerald-500 bg-emerald-50 p-3 text-sm dark:bg-emerald-500/10">
                  <span className="font-semibold">Answer: </span>
                  <span className={item.format === "coding" ? "font-mono" : ""}>{formatCorrectAnswer(item)}</span>
                </div>
              )}
              {show ? (
                <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-white/[0.03] dark:text-slate-300">
                  <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400">Why this is the answer</div>
                  {item.explain}
                  {item.tip && (
                    <p className="mt-3 flex gap-2 font-medium text-brand-700 dark:text-brand-400">
                      <Lightbulb className="mt-0.5 size-4 shrink-0" /> {item.tip}
                    </p>
                  )}
                </div>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setRevealed(new Set(revealed).add(item.id))}>
                  <Eye className="size-3.5" /> Reveal answer
                </Button>
              )}
            </Card>
          );
        })}
        {list.length === 0 && <Card className="p-8 text-center text-sm text-slate-500">No questions match your filters.</Card>}
      </div>
    </div>
  );
}
