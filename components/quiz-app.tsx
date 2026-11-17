"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  ChevronDown,
  CircleHelp,
  Clock,
  Flag,
  GraduationCap,
  Lightbulb,
  ListChecks,
  RotateCcw,
  Shuffle,
  Timer,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { getQuiz } from "@/lib/quizzes";
import { isWeak, recordAttempt, toggleBookmark, useProgress } from "@/lib/progress";
import { attemptLearningLabel, FORMAT_LABELS, LEARNING_STAGE_DESCRIPTIONS, LEARNING_STAGE_LABELS, formatCorrectAnswer, formatQuestionAnswer, isQuestionAnswered, isQuestionCorrect, matchingValues } from "@/lib/question-utils";
import type { AnswerRecord, Attempt, Difficulty, LearningStage, Question, QuestionFormat, QuizConfig, QuizMode } from "@/lib/types";
import { cn, formatDuration, grade, shuffle } from "@/lib/utils";
import { Badge, Button, ButtonLink, Card, DIFF_TONE, Kbd, Meter, Modal, Ring, Segmented, SectionTitle, Switch } from "./ui";
import { SqlCode } from "./sql-code";

type Item = { q: Question; opts: string[] };
type Ans = { chosen: string | null; usedHint: boolean; flagged: boolean; ms: number };
type RunState = { config: QuizConfig; items: Item[]; startedAt: number };

const DIFFS: Difficulty[] = ["easy", "medium", "hard"];
const LEARNING_STAGES: LearningStage[] = ["memorize", "understand", "practice", "reflect", "transfer"];

export function QuizApp({ quizId }: { quizId: string }) {
  const quiz = getQuiz(quizId)!;
  const [initialMode, setInitialMode] = useState<QuizMode>("practice");
  const [run, setRun] = useState<RunState | null>(null);
  const [result, setResult] = useState<{ attempt: Attempt; items: Item[]; config: QuizConfig } | null>(null);

  useEffect(() => {
    const mode = new URLSearchParams(window.location.search).get("mode");
    if (mode === "practice" || mode === "exam" || mode === "weak") setInitialMode(mode);
  }, []);

  const start = useCallback(
    (config: QuizConfig, pool: Question[]) => {
      const items = pool.map((q) => ({ q, opts: shuffle(q.options) }));
      setResult(null);
      setRun({ config, items, startedAt: Date.now() });
      window.scrollTo({ top: 0 });
    },
    [],
  );

  if (result)
    return (
      <Results
        quiz={quiz}
        {...result}
        onRetry={(ids) => {
          const pool = ids
            ? result.items.filter((i) => ids.includes(i.q.id)).map((i) => i.q)
            : result.config.shuffleQuestions
              ? shuffle(result.items.map((i) => i.q))
              : result.items.map((i) => i.q);
          start(
            { ...result.config, mode: ids ? "practice" : result.config.mode, stage: result.config.stage },
            pool,
          );
        }}
      />
    );
  if (run)
    return (
      <Runner
        key={run.startedAt}
        quizId={quiz.id}
        {...run}
        onExit={() => setRun(null)}
        onFinish={(attempt) => {
          recordAttempt(attempt);
          setResult({ attempt, items: run.items, config: run.config });
          setRun(null);
          window.scrollTo({ top: 0 });
        }}
      />
    );
  return <Setup quizId={quiz.id} initialMode={initialMode} onStart={start} />;
}

/* =================================================================== *
 *  SETUP
 * =================================================================== */
function Setup({
  quizId,
  initialMode,
  onStart,
}: {
  quizId: string;
  initialMode: QuizMode;
  onStart: (c: QuizConfig, pool: Question[]) => void;
}) {
  const quiz = getQuiz(quizId)!;
  const { qstats } = useProgress();
  const [mode, setMode] = useState<QuizMode>(initialMode);
  const [stage, setStage] = useState<LearningStage>("memorize");
  const [topics, setTopics] = useState<string[]>(quiz.topics);
  const [diffs, setDiffs] = useState<Difficulty[]>(DIFFS);
  const [formats, setFormats] = useState<QuestionFormat[]>(() => [...new Set(quiz.questions.map((q) => q.format))]);
  const [count, setCount] = useState(0);
  const [shuffleQ, setShuffleQ] = useState(false);
  const [timed, setTimed] = useState(initialMode === "exam");

  const weakCount = quiz.questions.filter((q) => isWeak(qstats[q.id])).length;
  const availableFormats = [...new Set(quiz.questions.map((q) => q.format))];
  const availableStages = LEARNING_STAGES.filter((learningStage) => quiz.questions.some((q) => q.learningStage === learningStage));

  const pool = useMemo(() => {
    let p = quiz.questions.filter(
      (q) => q.learningStage === stage && topics.includes(q.topic) && diffs.includes(q.difficulty) && formats.includes(q.format),
    );
    if (mode === "weak") p = p.filter((q) => isWeak(qstats[q.id]));
    if (shuffleQ || mode === "exam") p = shuffle(p);
    return count ? p.slice(0, count) : p;
  }, [quiz, stage, topics, diffs, formats, mode, qstats, shuffleQ, count]);

  const MODES: { id: QuizMode; icon: typeof GraduationCap; title: string; desc: string; disabled?: boolean }[] = [
    { id: "practice", icon: GraduationCap, title: "Practice", desc: "Instant feedback, hints and explanations after every answer." },
    { id: "exam", icon: ListChecks, title: "Exam", desc: "No feedback until you submit. Change answers, flag and navigate freely." },
    {
      id: "weak",
      icon: Zap,
      title: "Weak spots",
      desc: weakCount ? `Only the ${weakCount} question${weakCount === 1 ? "" : "s"} you missed or marked “still learning”.` : "Answer some questions first — misses will collect here.",
      disabled: weakCount === 0,
    },
  ];

  const secs = 45;
  const est = Math.max(1, Math.round((pool.length * (mode === "exam" ? secs : 25)) / 60));

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <Link href="/" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
        <ArrowLeft className="size-4" /> Library
      </Link>
      <div className="mb-6">
        <Badge tone="brand">Lesson {quiz.lesson}</Badge>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{quiz.title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{quiz.description}</p>
      </div>

      <Card className="divide-y divide-slate-100 dark:divide-white/5">
        {/* Mode */}
        <div className="p-5">
          <h2 className="mb-3 text-sm font-semibold">Mode</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {MODES.map(({ id, icon: Icon, title, desc, disabled }) => (
              <button
                key={id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setMode(id);
                  if (id === "exam") setTimed(true);
                }}
                aria-pressed={mode === id}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
                  mode === id
                    ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600 dark:border-brand-400 dark:bg-brand-500/10 dark:ring-brand-400"
                    : "border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20",
                )}
              >
                <Icon className={cn("size-5", mode === id ? "text-brand-700 dark:text-brand-400" : "text-slate-400")} />
                <div className="mt-2 text-sm font-semibold">{title}</div>
                <div className="mt-1 text-xs leading-relaxed text-slate-500">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          <h2 className="mb-3 text-sm font-semibold">Learning stage</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {availableStages.map((id) => {
              const stageCount = quiz.questions.filter((q) => q.learningStage === id).length;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setStage(id)}
                  aria-pressed={stage === id}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors duration-150",
                    stage === id
                      ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600 dark:border-brand-400 dark:bg-brand-500/10 dark:ring-brand-400"
                      : "border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20",
                  )}
                >
                  <span className="text-sm font-semibold">{LEARNING_STAGE_LABELS[id]}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-500">{LEARNING_STAGE_DESCRIPTIONS[id]}</span>
                  <span className="mt-2 block text-xs font-medium text-slate-400">{stageCount} questions</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topics */}
        <div className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Topics</h2>
            <button
              type="button"
              className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400"
              onClick={() => setTopics(topics.length === quiz.topics.length ? [] : quiz.topics)}
            >
              {topics.length === quiz.topics.length ? "Clear all" : "Select all"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {quiz.topics.map((t) => {
              const on = topics.includes(t);
              const n = quiz.questions.filter((q) => q.topic === t).length;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTopics(on ? topics.filter((x) => x !== t) : [...topics, t])}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition-colors duration-150",
                    on
                      ? "border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-400"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-white/10",
                  )}
                >
                  {on && <Check className="size-3.5" />} {t}
                  <span className="tabular-nums opacity-60">{n}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-slate-500">Difficulty</span>
            {DIFFS.map((d) => {
              const on = diffs.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setDiffs(on ? diffs.filter((x) => x !== d) : [...diffs, d])}
                  className={cn(
                    "min-h-8 rounded-lg border px-3 text-xs font-semibold capitalize transition-colors duration-150",
                    on ? "border-slate-800 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900" : "border-slate-200 text-slate-500 dark:border-white/10",
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>
          <div className="mt-4">
            <h3 className="mb-2 text-xs font-medium text-slate-500">Question formats</h3>
            <div className="flex flex-wrap gap-2">
              {availableFormats.map((format) => {
                const on = formats.includes(format);
                return (
                  <button
                    key={format}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setFormats(on ? formats.filter((value) => value !== format) : [...formats, format])}
                    className={cn(
                      "min-h-8 rounded-lg border px-3 text-xs font-semibold transition-colors duration-150",
                      on
                        ? "border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-400"
                        : "border-slate-200 text-slate-500 dark:border-white/10",
                    )}
                  >
                    {FORMAT_LABELS[format]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <div>
            <h2 className="mb-2 text-sm font-semibold">Questions</h2>
            <Segmented
              value={count}
              onChange={setCount}
              options={[
                { value: 10, label: "10" },
                { value: 20, label: "20" },
                { value: 0, label: "All" },
              ]}
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm">
                <Shuffle className="size-4 text-slate-400" /> Shuffle questions
                {mode === "exam" && <span className="text-xs text-slate-400">(always on in exams)</span>}
              </span>
              <Switch checked={shuffleQ || mode === "exam"} onChange={setShuffleQ} label="Shuffle questions" />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm">
                <Timer className="size-4 text-slate-400" /> Time limit <span className="text-xs text-slate-400">({secs}s / question)</span>
              </span>
              <Switch checked={timed} onChange={setTimed} label="Time limit" />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-5 dark:bg-white/[0.02]">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{pool.length}</span> questions · ~{est} min
            {timed && <> · {formatDuration(pool.length * secs * 1000)} limit</>}
          </div>
          <Button
            size="lg"
            disabled={pool.length === 0}
            onClick={() =>
              onStart(
                { mode, stage, topics, count, shuffleQuestions: shuffleQ || mode === "exam", timed, secondsPerQuestion: secs },
                pool,
              )
            }
          >
            Start {mode === "exam" ? "exam" : "quiz"} <ArrowRight className="size-4" />
          </Button>
        </div>
      </Card>
      {pool.length === 0 && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          No questions match these filters — select at least one topic, difficulty and format.
        </p>
      )}
    </div>
  );
}

/* =================================================================== *
 *  RUNNER
 * =================================================================== */
function Runner({
  quizId,
  config,
  items,
  startedAt,
  onExit,
  onFinish,
}: RunState & { quizId: string; onExit: () => void; onFinish: (a: Attempt) => void }) {
  const { bookmarks } = useProgress();
  const exam = config.mode === "exam";
  const total = items.length;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Ans[]>(() =>
    items.map(() => ({ chosen: null, usedHint: false, flagged: false, ms: 0 })),
  );
  const [hint, setHint] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const enteredAt = useRef(Date.now());
  const finished = useRef(false);

  const item = items[idx];
  const a = answers[idx];
  const currentAnswered = isQuestionAnswered(item.q, a.chosen);
  const currentMatches = item.q.format === "matching" ? matchingValues(item.q, a.chosen) : [];
  const locked = !exam && currentAnswered;
  const score = answers.filter((x, i) => isQuestionCorrect(items[i].q, x.chosen)).length;
  const answeredCount = answers.filter((x, i) => isQuestionAnswered(items[i].q, x.chosen)).length;
  const firstUnanswered = answers.findIndex((answer, answerIndex) => !isQuestionAnswered(items[answerIndex].q, answer.chosen));
  const deadline = config.timed ? startedAt + total * config.secondsPerQuestion * 1000 : null;
  const remaining = deadline ? deadline - now : null;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const patch = useCallback((i: number, p: Partial<Ans>) => {
    setAnswers((prev) => prev.map((x, j) => (j === i ? { ...x, ...p } : x)));
  }, []);

  const go = useCallback(
    (next: number) => {
      if (next < 0 || next >= total) return;
      const spent = Date.now() - enteredAt.current;
      enteredAt.current = Date.now();
      setAnswers((prev) => prev.map((x, j) => (j === idx ? { ...x, ms: x.ms + spent } : x)));
      setIdx(next);
      setHint(false);
    },
    [idx, total],
  );

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    const spent = Date.now() - enteredAt.current;
    const final = answers.map((x, j) => (j === idx ? { ...x, ms: x.ms + spent } : x));
    const records: AnswerRecord[] = final.map((x, i) => ({
      questionId: items[i].q.id,
      chosen: x.chosen,
      correct: isQuestionCorrect(items[i].q, x.chosen),
      usedHint: x.usedHint,
      flagged: x.flagged,
      ms: x.ms,
    }));
    onFinish({
      id: `${startedAt}-${Math.random().toString(36).slice(2, 7)}`,
      quizId,
      mode: config.mode,
      stage: config.stage,
      startedAt,
      finishedAt: Date.now(),
      score: records.filter((r) => r.correct).length,
      total,
      answers: records,
    });
  }, [answers, idx, items, onFinish, quizId, config.mode, config.stage, startedAt, total]);

  // Time limit reached → auto-submit
  useEffect(() => {
    if (remaining !== null && remaining <= 0) finish();
  }, [remaining, finish]);

  const choose = useCallback(
    (i: number) => {
      if (locked || i < 0 || i >= item.opts.length) return;
      patch(idx, { chosen: item.opts[i] });
      setHint(false);
    },
    [locked, item, idx, patch],
  );

  const next = useCallback(() => {
    if (idx === total - 1) {
      if (exam) setConfirmSubmit(true);
      else if (currentAnswered) finish();
    } else if (exam || currentAnswered) go(idx + 1);
  }, [idx, total, exam, currentAnswered, finish, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || confirmSubmit || confirmExit || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;
      const k = e.key.toLowerCase();
      const map: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
      if (item.q.format !== "matching" && (k in map)) return e.preventDefault(), choose(map[k]);
      if (k === "h" && !exam && !locked) {
        setHint((h) => !h);
        return patch(idx, { usedHint: true });
      }
      if (k === "f") return patch(idx, { flagged: !a.flagged });
      if (e.key === "ArrowRight" && (exam || locked)) return go(idx + 1);
      if (e.key === "ArrowLeft") return go(idx - 1);
      if (e.key === "Enter" && !(e.target as HTMLElement).closest("button")) return e.preventDefault(), next();
      if (e.key === "Escape") return setConfirmExit(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, exam, locked, idx, a.flagged, patch, go, next, confirmSubmit, confirmExit, item.q.format]);

  const bookmarked = bookmarks.includes(item.q.id);
  const isCorrect = isQuestionCorrect(item.q, a.chosen);
  const branchOutcome = item.q.scenarioBranches?.find((branch) => branch.choice === a.chosen)?.outcome;
  const lowTime = remaining !== null && remaining < 60_000;

  return (
    <div className="animate-fade-up">
      {/* ---------- Top bar ---------- */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setConfirmExit(true)}>
          <X className="size-4" /> Exit
        </Button>
        <Badge tone={exam ? "amber" : config.mode === "weak" ? "red" : "brand"} className="capitalize">
          {config.mode === "weak" ? "Weak spots" : config.mode}
        </Badge>
        <Badge tone="slate">{LEARNING_STAGE_LABELS[config.stage]}</Badge>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span
            className={cn(
              "inline-flex min-w-20 items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[13px] font-semibold tabular-nums",
              lowTime
                ? "border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
                : "border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300",
            )}
            aria-label={remaining !== null ? "Time remaining" : "Time elapsed"}
          >
            <Clock className="size-3.5" />
            {remaining !== null ? formatDuration(remaining) : formatDuration(now - startedAt)}
          </span>
          {!exam && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-[13px] font-semibold tabular-nums text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              <Trophy className="size-3.5" /> {score}
            </span>
          )}
        </div>
      </div>

      {/* segmented progress */}
      <div className="mb-6 flex gap-[3px]" aria-hidden>
        {items.map((it, i) => {
          const x = answers[i];
          const done = isQuestionAnswered(it.q, x.chosen);
          return (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-200",
                i === idx
                  ? "bg-slate-900 dark:bg-white"
                  : !done
                    ? "bg-slate-200 dark:bg-white/10"
                    : exam
                      ? "bg-brand-500"
                      : isQuestionCorrect(it.q, x.chosen)
                        ? "bg-emerald-500"
                        : "bg-red-500",
              )}
            />
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        {/* ---------- Question ---------- */}
        <div key={idx} className="min-w-0 animate-fade-up">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold tabular-nums text-slate-500">
              Question {idx + 1} <span className="font-normal">of {total}</span>
            </span>
            <Badge tone="cyan">{item.q.topic}</Badge>
            <Badge tone={DIFF_TONE[item.q.difficulty]} className="capitalize">
              {item.q.difficulty}
            </Badge>
            <Badge tone="slate">{FORMAT_LABELS[item.q.format]}</Badge>
            <div className="ml-auto flex gap-1">
              <button
                type="button"
                onClick={() => patch(idx, { flagged: !a.flagged })}
                aria-pressed={a.flagged}
                title="Flag for review (F)"
                className={cn(
                  "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors duration-150",
                  a.flagged ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" : "text-slate-500 hover:bg-slate-900/5 dark:hover:bg-white/10",
                )}
              >
                <Flag className={cn("size-3.5", a.flagged && "fill-current")} /> {a.flagged ? "Flagged" : "Flag"}
              </button>
              <button
                type="button"
                onClick={() => toggleBookmark(item.q.id)}
                aria-pressed={bookmarked}
                title="Bookmark for the study sheet"
                aria-label={bookmarked ? "Remove bookmark" : "Bookmark question"}
                className={cn(
                  "grid size-9 place-items-center rounded-lg transition-colors duration-150",
                  bookmarked ? "text-brand-700 dark:text-brand-400" : "text-slate-500 hover:bg-slate-900/5 dark:hover:bg-white/10",
                )}
              >
                <Bookmark className={cn("size-4", bookmarked && "fill-current")} />
              </button>
            </div>
          </div>

          {item.q.context && (
            <p className="mb-4 rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-sm leading-relaxed text-slate-700 dark:border-brand-500/15 dark:bg-brand-500/5 dark:text-slate-300">
              {item.q.context}
            </p>
          )}
          <h1 className="mb-5 text-xl font-semibold leading-snug tracking-tight sm:text-[22px]">{item.q.q}</h1>
          {item.q.code && <SqlCode code={item.q.code} className="mb-5" />}

          {!exam && !locked && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  setHint(!hint);
                  patch(idx, { usedHint: true });
                }}
                aria-expanded={hint}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 text-[13px] font-semibold text-amber-800 transition-colors duration-150 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
              >
                <Lightbulb className="size-4" /> {hint ? "Hide hint" : "Show hint"}
              </button>
              {hint && (
                <p className="mt-3 animate-fade-up rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-sm leading-relaxed text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-200">
                  {item.q.hint}
                </p>
              )}
            </div>
          )}

          {item.q.format === "matching" ? (
            <div className="space-y-3">
              {(item.q.matchPairs ?? []).map((pair, pairIndex) => (
                <label key={pair.left} className="grid items-center gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_1.2fr] dark:border-white/10">
                  <span className="text-sm font-semibold">{pair.left}</span>
                  <select
                    value={currentMatches[pairIndex] ?? ""}
                    disabled={locked}
                    onChange={(e) => {
                      const values = (item.q.matchPairs ?? []).map((_, index) => currentMatches[index] ?? "");
                      values[pairIndex] = e.currentTarget.value;
                      patch(idx, { chosen: JSON.stringify(values) });
                    }}
                    className="h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#111a1e]"
                  >
                    <option value="">Choose a match…</option>
                    {item.opts.map((option) => (
                      <option
                        key={option}
                        value={option}
                        disabled={currentMatches.includes(option) && currentMatches[pairIndex] !== option}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          ) : item.q.format === "short-answer" || item.q.format === "coding" ? (
            item.q.format === "coding" ? (
              <label className="block">
                <span className="sr-only">Write your T-SQL answer</span>
                <textarea
                  value={a.chosen ?? ""}
                  disabled={locked}
                  onChange={(e) => patch(idx, { chosen: e.currentTarget.value })}
                  placeholder="Write your T-SQL here…"
                  rows={5}
                  spellCheck={false}
                  className="w-full rounded-xl border border-slate-200 bg-white p-4 font-mono text-sm leading-relaxed outline-none transition-colors focus:border-brand-600 dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-brand-400"
                />
              </label>
            ) : (
              <label className="block">
                <span className="sr-only">Type your answer</span>
                <input
                  value={a.chosen ?? ""}
                  disabled={locked}
                  onChange={(e) => patch(idx, { chosen: e.currentTarget.value })}
                  placeholder="Type your answer…"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base outline-none transition-colors focus:border-brand-600 dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-brand-400"
                />
              </label>
            )
          ) : (
            <div className="grid gap-2.5" role="radiogroup" aria-label="Answer options">
              {item.opts.map((opt, i) => {
                const chosen = a.chosen === opt;
                const right = opt === item.q.answer;
                const state = locked ? (right ? "correct" : chosen ? "wrong" : "dim") : chosen ? "selected" : "idle";
                return (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={chosen}
                    disabled={locked}
                    onClick={() => choose(i)}
                    className={cn(
                      "group flex min-h-14 w-full items-center gap-3.5 rounded-xl border-[1.5px] px-4 py-3 text-left text-[15px] transition-colors duration-150",
                      state === "idle" && "border-slate-200 bg-white hover:border-brand-500 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-brand-400",
                      state === "selected" && "border-brand-600 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/10",
                      state === "correct" && "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
                      state === "wrong" && "animate-shake border-red-500 bg-red-50 dark:bg-red-500/10",
                      state === "dim" && "border-slate-200 opacity-50 dark:border-white/10",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-lg border font-mono text-[13px] font-semibold",
                        state === "correct"
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : state === "wrong"
                            ? "border-red-500 bg-red-500 text-white"
                            : state === "selected"
                              ? "border-brand-600 bg-brand-700 text-white dark:border-brand-400 dark:bg-brand-500 dark:text-slate-950"
                              : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5",
                      )}
                    >
                      {state === "correct" ? <Check className="size-4" /> : state === "wrong" ? <X className="size-4" /> : String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {state === "correct" && <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Correct answer</span>}
                    {state === "wrong" && <span className="text-xs font-semibold text-red-700 dark:text-red-300">Your answer</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Practice feedback */}
          {locked && (
            <div
              aria-live="polite"
              className={cn(
                "mt-5 animate-fade-up rounded-xl border p-4",
                isCorrect ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/5" : "border-red-300 bg-red-50/60 dark:border-red-500/30 dark:bg-red-500/5",
              )}
            >
              <div className={cn("mb-1.5 flex items-center gap-2 font-semibold", isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300")}>
                <span className={cn("grid size-5 place-items-center rounded-full text-white", isCorrect ? "bg-emerald-500" : "bg-red-500")}>
                  {isCorrect ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" strokeWidth={3} />}
                </span>
                {isCorrect ? "Correct" : "Not quite"}
              </div>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{item.q.explain}</p>
              {branchOutcome && (
                <p className="mt-3 rounded-lg bg-white/70 p-3 text-sm text-slate-700 dark:bg-black/10 dark:text-slate-300">
                  <span className="font-semibold">Scenario outcome: </span>{branchOutcome}
                </p>
              )}
              {item.q.tip && (
                <p className="mt-3 flex gap-2 border-t border-dashed border-slate-300 pt-3 text-sm font-medium text-brand-700 dark:border-white/10 dark:text-brand-400">
                  <Lightbulb className="mt-0.5 size-4 shrink-0" /> {item.q.tip}
                </p>
              )}
            </div>
          )}

          {/* Footer nav */}
          <div className="mt-6 flex items-center gap-3">
            <Button variant="secondary" onClick={() => go(idx - 1)} disabled={idx === 0} aria-label="Previous question">
              <ArrowLeft className="size-4" /> <span className="hidden sm:inline">Previous</span>
            </Button>
            <div className="hidden flex-1 justify-center gap-3 text-xs text-slate-400 md:flex">
              <span><Kbd>1</Kbd>–<Kbd>4</Kbd> answer</span>
              {!exam && <span><Kbd>H</Kbd> hint</span>}
              <span><Kbd>F</Kbd> flag</span>
              <span><Kbd>Enter</Kbd> next</span>
            </div>
            <div className="ml-auto">
              {idx === total - 1 ? (
                <Button onClick={() => (exam ? setConfirmSubmit(true) : finish())} disabled={!exam && !currentAnswered}>
                  {exam ? "Submit exam" : "See results"} <Check className="size-4" />
                </Button>
              ) : (
                <Button onClick={() => go(idx + 1)} disabled={!exam && !currentAnswered}>
                  Next <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ---------- Navigator ---------- */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-semibold">Navigator</span>
              <span className="tabular-nums text-slate-500">
                {answeredCount}/{total}
              </span>
            </div>
            <Meter value={answeredCount / total} className="mb-4" />
            <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-10 lg:grid-cols-5">
              {items.map((it, i) => {
                const x = answers[i];
                const done = isQuestionAnswered(it.q, x.chosen);
                const canJump = exam || done || i <= (firstUnanswered < 0 ? total - 1 : firstUnanswered);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!canJump}
                    onClick={() => go(i)}
                    aria-label={`Question ${i + 1}${x.flagged ? ", flagged" : ""}${done ? ", answered" : ""}`}
                    aria-current={i === idx}
                    className={cn(
                      "relative grid aspect-square min-h-9 place-items-center rounded-lg border text-xs font-semibold tabular-nums transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40",
                      i === idx && "ring-2 ring-slate-900 ring-offset-1 dark:ring-white dark:ring-offset-[#0b1215]",
                      !done
                        ? "border-slate-200 text-slate-500 hover:border-slate-400 dark:border-white/10"
                        : exam
                          ? "border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-500/15 dark:text-brand-400"
                          : isQuestionCorrect(it.q, x.chosen)
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "border-red-500 bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
                    )}
                  >
                    {i + 1}
                    {x.flagged && <Flag className="absolute -right-1 -top-1 size-3 fill-amber-500 text-amber-500" />}
                  </button>
                );
              })}
            </div>
            <ul className="mt-4 space-y-1.5 text-xs text-slate-500">
              {exam ? (
                <li className="flex items-center gap-2"><span className="size-2.5 rounded-sm bg-brand-500" /> Answered</li>
              ) : (
                <>
                  <li className="flex items-center gap-2"><Check className="size-3 text-emerald-600" /> Correct</li>
                  <li className="flex items-center gap-2"><X className="size-3 text-red-600" /> Incorrect</li>
                </>
              )}
              <li className="flex items-center gap-2"><Flag className="size-3 fill-amber-500 text-amber-500" /> Flagged for review</li>
            </ul>
            {exam && (
              <Button className="mt-4 w-full" variant="secondary" onClick={() => setConfirmSubmit(true)}>
                Submit exam
              </Button>
            )}
          </Card>
        </aside>
      </div>

      <Modal
        open={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        title="Submit exam?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmSubmit(false)}>Keep working</Button>
            <Button onClick={finish}>Submit</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          You answered <b className="text-slate-900 dark:text-white">{answeredCount}</b> of {total} questions.
          {total - answeredCount > 0 && <> {total - answeredCount} unanswered question{total - answeredCount === 1 ? "" : "s"} will count as incorrect.</>}
          {answers.some((x) => x.flagged) && <> You still have {answers.filter((x) => x.flagged).length} flagged.</>}
        </p>
      </Modal>
      <Modal
        open={confirmExit}
        onClose={() => setConfirmExit(false)}
        title="Leave this quiz?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmExit(false)}>Stay</Button>
            <Button variant="danger" onClick={onExit}>Leave without saving</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">Your progress in this attempt will not be saved.</p>
      </Modal>
    </div>
  );
}

/* =================================================================== *
 *  RESULTS
 * =================================================================== */
function Results({
  quiz,
  attempt,
  items,
  onRetry,
}: {
  quiz: NonNullable<ReturnType<typeof getQuiz>>;
  attempt: Attempt;
  items: Item[];
  config: QuizConfig;
  onRetry: (ids?: string[]) => void;
}) {
  const router = useRouter();
  const { attempts } = useProgress();
  const [filter, setFilter] = useState<"all" | "wrong" | "flagged">("all");
  const [open, setOpen] = useState<string | null>(null);
  const pct = Math.round((attempt.score / attempt.total) * 100);
  const g = grade(pct);
  const duration = attempt.finishedAt - attempt.startedAt;
  const wrong = attempt.answers.filter((a) => !a.correct);
  const hints = attempt.answers.filter((a) => a.usedHint).length;
  const prev = attempts.filter((a) => a.quizId === quiz.id && a.id !== attempt.id);
  const best = Math.max(pct, ...prev.map((a) => Math.round((a.score / a.total) * 100)));
  const delta = prev[0] ? pct - Math.round((prev[0].score / prev[0].total) * 100) : null;

  const byTopic = useMemo(() => {
    const m = new Map<string, { c: number; t: number }>();
    attempt.answers.forEach((a, i) => {
      const t = items[i].q.topic;
      const v = m.get(t) ?? { c: 0, t: 0 };
      v.t++;
      if (a.correct) v.c++;
      m.set(t, v);
    });
    return [...m.entries()].sort((a, b) => a[1].c / a[1].t - b[1].c / b[1].t);
  }, [attempt, items]);

  const rows = attempt.answers
    .map((a, i) => ({ a, item: items[i], n: i + 1 }))
    .filter(({ a }) => (filter === "wrong" ? !a.correct : filter === "flagged" ? a.flagged : true));

  return (
    <div className="mx-auto max-w-4xl animate-fade-up space-y-8">
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <Ring value={attempt.score / attempt.total} size={140} stroke={11}>
            <div className="text-center">
              <div className="text-3xl font-bold tabular-nums tracking-tight">{pct}%</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">score</div>
            </div>
          </Ring>
          <div className="flex-1">
            <Badge tone="brand" className="capitalize">
              {quiz.title} · {attemptLearningLabel(attempt)}
            </Badge>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{g.title}</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              You got <b className="text-slate-900 dark:text-white">{attempt.score} of {attempt.total}</b> correct. {g.sub}
            </p>
            {delta !== null && (
              <p className={cn("mt-2 text-sm font-semibold", delta >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400")}>
                {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} points vs your previous attempt
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Correct", value: attempt.score, icon: Check, cls: "text-emerald-600" },
            { label: "Missed", value: attempt.total - attempt.score, icon: X, cls: "text-red-600" },
            { label: "Time", value: formatDuration(duration), icon: Clock, cls: "text-brand-600" },
            { label: "Best score", value: `${best}%`, icon: Trophy, cls: "text-amber-600" },
          ].map(({ label, value, icon: Icon, cls }) => (
            <div key={label} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Icon className={cn("size-3.5", cls)} /> {label}
              </div>
              <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Average {formatDuration(duration / attempt.total)} per question · {hints} hint{hints === 1 ? "" : "s"} used
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={() => onRetry()}>
            <RotateCcw className="size-4" /> Try again
          </Button>
          {wrong.length > 0 && (
            <Button variant="secondary" onClick={() => onRetry(wrong.map((w) => w.questionId))}>
              <Zap className="size-4 text-amber-500" /> Retry {wrong.length} missed
            </Button>
          )}
          <ButtonLink variant="secondary" href={`/study/${quiz.id}`}>
            <BookOpen className="size-4" /> Study sheet
          </ButtonLink>
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft className="size-4" /> Library
          </Button>
        </div>
      </Card>

      <section>
        <SectionTitle>Performance by topic</SectionTitle>
        <Card className="space-y-3.5 p-5">
          {byTopic.map(([t, v]) => (
            <div key={t} className="grid grid-cols-[120px_1fr_56px] items-center gap-3 text-sm sm:grid-cols-[160px_1fr_64px]">
              <span className="truncate font-medium">{t}</span>
              <Meter value={v.c / v.t} tone="auto" className="h-2" />
              <span className="text-right tabular-nums text-slate-500">
                {v.c}/{v.t}
              </span>
            </div>
          ))}
          {byTopic[0] && byTopic[0][1].c < byTopic[0][1].t && (
            <p className="flex items-center gap-2 border-t border-slate-100 pt-3 text-sm text-slate-600 dark:border-white/5 dark:text-slate-400">
              <CircleHelp className="size-4 text-amber-500" /> Focus next on <b className="text-slate-900 dark:text-white">{byTopic[0][0]}</b>.
            </p>
          )}
        </Card>
      </section>

      <section>
        <SectionTitle
          action={
            <Segmented
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: `All ${attempt.total}` },
                { value: "wrong", label: `Missed ${wrong.length}` },
                { value: "flagged", label: `Flagged ${attempt.answers.filter((a) => a.flagged).length}` },
              ]}
            />
          }
        >
          Review answers
        </SectionTitle>
        <div className="space-y-2">
          {rows.length === 0 && <Card className="p-5 text-sm text-slate-500">Nothing to show for this filter.</Card>}
          {rows.map(({ a, item, n }) => {
            const isOpen = open === item.q.id;
            const branchOutcome = item.q.scenarioBranches?.find((branch) => branch.choice === a.chosen)?.outcome;
            return (
              <Card key={item.q.id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : item.q.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                >
                  <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-white", a.correct ? "bg-emerald-500" : "bg-red-500")}>
                    {a.correct ? <Check className="size-3.5" strokeWidth={3} /> : <X className="size-3.5" strokeWidth={3} />}
                    <span className="sr-only">{a.correct ? "Correct" : "Incorrect"}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-snug">
                      {n}. {item.q.q}
                    </span>
                    {!a.correct && (
                      <span className="mt-1.5 block text-xs leading-relaxed">
                        <span className="text-red-700 dark:text-red-400">Your answer: {formatQuestionAnswer(item.q, a.chosen)}</span>
                        <br />
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">Correct: {formatCorrectAnswer(item.q)}</span>
                      </span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-slate-400">
                    {a.flagged && <Flag className="size-3.5 fill-amber-500 text-amber-500" />}
                    <span className="tabular-nums">{formatDuration(a.ms)}</span>
                    <ChevronDown className={cn("size-4 transition-transform duration-200", isOpen && "rotate-180")} />
                  </span>
                </button>
                {isOpen && (
                  <div className="space-y-3 border-t border-slate-100 p-4 pl-13 text-sm dark:border-white/5">
                    {item.q.code && <SqlCode code={item.q.code} />}
                    <p className="leading-relaxed text-slate-700 dark:text-slate-300">{item.q.explain}</p>
                    {branchOutcome && (
                      <p className="rounded-lg bg-slate-50 p-3 text-slate-700 dark:bg-white/[0.03] dark:text-slate-300">
                        <span className="font-semibold">Scenario outcome: </span>
                        {branchOutcome}
                      </p>
                    )}
                    {item.q.tip && <p className="font-medium text-brand-700 dark:text-brand-400">Remember: {item.q.tip}</p>}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
