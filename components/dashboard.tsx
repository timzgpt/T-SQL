"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Flame, Layers, Plus, Target, Trophy, Zap } from "lucide-react";
import { QUIZZES, TOTAL_QUESTIONS, getQuiz } from "@/lib/quizzes";
import { isWeak, questionMastery, quizMastery, studyStreak, useProgress } from "@/lib/progress";
import { attemptLearningLabel } from "@/lib/question-utils";
import { cn, timeAgo } from "@/lib/utils";
import { Badge, ButtonLink, Card, Meter, Ring, SectionTitle } from "./ui";
import { LEGEND, SqlCode } from "./sql-code";

const ANATOMY = `-- Get the names of customers from Italy
SELECT
    name,
    LOWER(country) AS country
FROM customers
WHERE country = 'Italy';`;

export function Dashboard() {
  const { attempts, qstats } = useProgress();
  const allIds = QUIZZES.flatMap((q) => q.questions.map((x) => x.id));
  const mastered = allIds.filter((id) => questionMastery(qstats[id]) >= 0.8).length;
  const weak = allIds.filter((id) => isWeak(qstats[id])).length;
  const avg = attempts.length ? Math.round((attempts.reduce((s, a) => s + a.score / a.total, 0) / attempts.length) * 100) : null;
  const streak = studyStreak(attempts);
  const first = QUIZZES[0];
  const lastQuiz = attempts[0] ? getQuiz(attempts[0].quizId) : undefined;
  const resume = lastQuiz ?? first;

  const stats = [
    { icon: Target, label: "Mastered", value: `${mastered}/${TOTAL_QUESTIONS}`, sub: "questions ≥ 80% mastery" },
    { icon: Trophy, label: "Average score", value: avg === null ? "—" : `${avg}%`, sub: `${attempts.length} attempts` },
    { icon: Flame, label: "Study streak", value: `${streak} day${streak === 1 ? "" : "s"}`, sub: streak ? "keep it going" : "start today" },
    { icon: Zap, label: "Weak spots", value: String(weak), sub: weak ? "ready to review" : "nothing to fix yet" },
  ];

  return (
    <div className="space-y-10">
      {/* ---------- Hero ---------- */}
      <section className="animate-fade-up rounded-3xl border border-brand-100 bg-brand-50/70 p-6 sm:p-8 dark:border-brand-500/15 dark:bg-brand-500/[0.06]">
        <Badge tone="cyan" className="mb-4 uppercase tracking-wider">
          Microsoft SQL Server · T-SQL
        </Badge>
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-[42px] sm:leading-[1.1]">
          Master SQL one lesson at a time.{" "}
          <span className="text-brand-700 dark:text-brand-400">Measure every step.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-slate-600 dark:text-slate-400">
          Practice with instant feedback, sit timed exams, drill flashcards, and let mastery tracking surface the questions you
          still miss. Code is highlighted in the same colours as SSMS.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href={`/quiz/${resume.id}`} size="lg">
            {attempts.length ? "Continue learning" : "Start first quiz"} <ArrowRight className="size-4" />
          </ButtonLink>
          {weak > 0 ? (
            <ButtonLink href={`/quiz/${resume.id}?mode=weak`} size="lg" variant="secondary">
              <Zap className="size-4 text-amber-500" /> Review {weak} weak spot{weak === 1 ? "" : "s"}
            </ButtonLink>
          ) : (
            <ButtonLink href={`/study/${first.id}`} size="lg" variant="secondary">
              <BookOpen className="size-4" /> Open study sheet
            </ButtonLink>
          )}
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, sub }, i) => (
          <Card key={label} className="animate-fade-up p-4" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-center gap-2 text-[12.5px] font-medium text-slate-500">
              <Icon className="size-4 text-brand-500" /> {label}
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums tracking-tight">{value}</div>
            <div className="text-xs text-slate-500">{sub}</div>
          </Card>
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* ---------- Library ---------- */}
        <section className="min-w-0">
          <SectionTitle>Quiz library</SectionTitle>
          <div className="space-y-4">
            {QUIZZES.map((quiz, i) => {
              const ids = quiz.questions.map((q) => q.id);
              const m = quizMastery(ids, qstats);
              const qa = attempts.filter((a) => a.quizId === quiz.id);
              const best = qa.length ? Math.max(...qa.map((a) => Math.round((a.score / a.total) * 100))) : null;
              const seen = ids.filter((id) => qstats[id]?.seen).length;
              return (
                <Card
                  key={quiz.id}
                  className="interactive-card group animate-fade-up p-5 hover:border-brand-500/40"
                  style={{ animationDelay: `${i * 45}ms` }}
                >
                  <div className="flex gap-4">
                    <Ring value={m} size={64} stroke={6}>
                      <div className="text-center leading-none">
                        <div className="text-[15px] font-bold tabular-nums">{Math.round(m * 100)}%</div>
                        <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">mastery</div>
                      </div>
                    </Ring>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="brand">Lesson {quiz.lesson}</Badge>
                        {best !== null && (
                          <Badge tone="amber">
                            <Trophy className="size-3" /> Best {best}%
                          </Badge>
                        )}
                      </div>
                      <h3 className="mt-1.5 text-lg font-semibold tracking-tight">{quiz.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{quiz.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Layers className="size-3.5" /> {quiz.questions.length} questions · {quiz.topics.length} topics
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5" /> ~{quiz.minutes} min
                        </span>
                        <span>
                          {seen}/{ids.length} answered at least once
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                    {quiz.topics.map((t) => {
                      const tids = quiz.questions.filter((q) => q.topic === t).map((q) => q.id);
                      const tm = quizMastery(tids, qstats);
                      return (
                        <div key={t}>
                          <div className="mb-1 flex justify-between text-[11.5px]">
                            <span className="font-medium text-slate-600 dark:text-slate-300">{t}</span>
                            <span className="tabular-nums text-slate-400">{Math.round(tm * 100)}%</span>
                          </div>
                          <Meter value={tm} tone="auto" />
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-white/5">
                    <ButtonLink href={`/quiz/${quiz.id}`} size="sm">
                      Start quiz <ArrowRight className="size-3.5" />
                    </ButtonLink>
                    <ButtonLink href={`/study/${quiz.id}`} size="sm" variant="secondary">
                      <BookOpen className="size-3.5" /> Study sheet
                    </ButtonLink>
                    <ButtonLink href={`/flashcards/${quiz.id}`} size="sm" variant="secondary">
                      <Layers className="size-3.5" /> Flashcards
                    </ButtonLink>
                  </div>
                </Card>
              );
            })}

            <div className="flex items-center gap-4 rounded-2xl border border-dashed border-slate-300 p-5 text-slate-500 dark:border-white/10">
              <span className="grid size-12 place-items-center rounded-xl border border-dashed border-slate-300 dark:border-white/15">
                <Plus className="size-5" />
              </span>
              <div>
                <div className="font-semibold text-slate-700 dark:text-slate-300">Lesson {QUIZZES.length + 1} — coming soon</div>
                <div className="text-sm">Upload the next lesson transcript and its quiz appears here automatically.</div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Sidebar ---------- */}
        <aside className="min-w-0 space-y-8">
          <section>
            <SectionTitle
              action={
                attempts.length > 0 && (
                  <Link href="/progress" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
                    View all
                  </Link>
                )
              }
            >
              Recent activity
            </SectionTitle>
            <Card className="divide-y divide-slate-100 dark:divide-white/5">
              {attempts.length === 0 && (
                <p className="p-4 text-sm text-slate-500">No attempts yet. Your results will show up here.</p>
              )}
              {attempts.slice(0, 5).map((a) => {
                const pct = Math.round((a.score / a.total) * 100);
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3.5">
                    <div
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-lg text-[13px] font-bold tabular-nums",
                        pct >= 80
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : pct >= 50
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                            : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
                      )}
                    >
                      {pct}%
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{getQuiz(a.quizId)?.title ?? a.quizId}</div>
                      <div className="text-xs capitalize text-slate-500">
                        {attemptLearningLabel(a)} · {a.score}/{a.total} · {timeAgo(a.finishedAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Card>
          </section>

          <section>
            <SectionTitle>Anatomy of a query</SectionTitle>
            <SqlCode code={ANATOMY} filename="one statement · three clauses" />
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {LEGEND.map((l) => (
                <li key={l.label} className="flex items-start gap-2 text-xs">
                  <span className="mt-0.5 size-2.5 shrink-0 rounded-sm ring-1 ring-black/10" style={{ background: l.color }} />
                  <span>
                    <span className="font-semibold">{l.label}</span>
                    <span className="block text-slate-500">{l.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
