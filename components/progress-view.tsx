"use client";

import { useRef, useState } from "react";
import { Download, Flame, RotateCcw, Target, Trophy, Upload } from "lucide-react";
import { QUIZZES, getQuiz } from "@/lib/quizzes";
import { exportProgress, importProgress, questionMastery, quizMastery, resetProgress, studyStreak, useProgress } from "@/lib/progress";
import { attemptLearningLabel, isQuestionAnswered } from "@/lib/question-utils";
import type { Attempt } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";
import { Badge, Button, ButtonLink, Card, Meter, Modal, SectionTitle } from "./ui";

export function ProgressView() {
  const { attempts, qstats } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const allIds = QUIZZES.flatMap((q) => q.questions.map((x) => x.id));
  const answered = attempts.reduce((sum, attempt) => {
    const questionsById = new Map((getQuiz(attempt.quizId)?.questions ?? []).map((question) => [question.id, question]));
    return sum + attempt.answers.filter((answer) => {
      const question = questionsById.get(answer.questionId);
      return question ? isQuestionAnswered(question, answer.chosen) : Boolean(answer.chosen?.trim());
    }).length;
  }, 0);
  const correct = attempts.reduce((s, a) => s + a.score, 0);
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
  const mastered = allIds.filter((id) => questionMastery(qstats[id]) >= 0.8).length;
  const timeSpent = attempts.reduce((s, a) => s + (a.finishedAt - a.startedAt), 0);

  function download() {
    const blob = new Blob([exportProgress()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sql-academy-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function upload(f: File) {
    try {
      importProgress(await f.text());
      setMsg("Progress imported.");
    } catch {
      setMsg("That file is not a valid progress export.");
    }
  }

  return (
    <div className="animate-fade-up space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your progress</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Stored privately in this browser. Export it to move between devices.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={download}>
            <Download className="size-4" /> Export
          </Button>
          <Button variant="secondary" onClick={() => file.current?.click()}>
            <Upload className="size-4" /> Import
          </Button>
          <input ref={file} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <Button variant="danger" onClick={() => setConfirmReset(true)} disabled={!attempts.length}>
            <RotateCcw className="size-4" /> Reset
          </Button>
        </div>
      </div>
      {msg && (
        <p role="status" className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-white/5">
          {msg}
        </p>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Target, label: "Accuracy", value: `${accuracy}%`, sub: `${correct}/${answered} answers` },
          { icon: Trophy, label: "Mastered", value: `${mastered}/${allIds.length}`, sub: "questions ≥ 80%" },
          { icon: Flame, label: "Streak", value: `${studyStreak(attempts)} d`, sub: `${attempts.length} attempts` },
          { icon: RotateCcw, label: "Time studied", value: formatDuration(timeSpent), sub: "min:sec in quizzes" },
        ].map(({ icon: Icon, label, value, sub }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-2 text-[12.5px] font-medium text-slate-500">
              <Icon className="size-4 text-brand-600 dark:text-brand-400" /> {label}
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums">{value}</div>
            <div className="text-xs text-slate-500">{sub}</div>
          </Card>
        ))}
      </section>

      {attempts.length === 0 ? (
        <Card className="p-10 text-center">
          <h2 className="text-lg font-semibold">No attempts yet</h2>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Finish a quiz and your score trend and topic mastery appear here.</p>
          <ButtonLink href={`/quiz/${QUIZZES[0].id}`} className="mt-5">
            Start {QUIZZES[0].title}
          </ButtonLink>
        </Card>
      ) : (
        <>
          <section>
            <SectionTitle>Score trend</SectionTitle>
            <Card className="p-5">
              <TrendChart attempts={[...attempts].reverse().slice(-20)} />
            </Card>
          </section>

          <section>
            <SectionTitle>Topic mastery</SectionTitle>
            <div className={cn("grid gap-4", QUIZZES.length > 1 && "md:grid-cols-2")}>
              {QUIZZES.map((quiz) => (
                <Card key={quiz.id} className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">
                      L{quiz.lesson} · {quiz.title}
                    </h3>
                    <Badge tone="brand">{Math.round(quizMastery(quiz.questions.map((q) => q.id), qstats) * 100)}%</Badge>
                  </div>
                  <div className="space-y-3">
                    {quiz.topics.map((t) => {
                      const ids = quiz.questions.filter((q) => q.topic === t).map((q) => q.id);
                      const v = quizMastery(ids, qstats);
                      return (
                        <div key={t} className="grid grid-cols-[110px_1fr_40px] items-center gap-3 text-sm">
                          <span className="truncate text-slate-600 dark:text-slate-300">{t}</span>
                          <Meter value={v} tone="auto" className="h-2" />
                          <span className="text-right tabular-nums text-slate-500">{Math.round(v * 100)}%</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* per-question heatmap */}
                  <div className="mt-5 flex flex-wrap gap-1" aria-label="Mastery per question">
                    {quiz.questions.map((q) => {
                      const s = qstats[q.id];
                      const m = questionMastery(s);
                      return (
                        <span
                          key={q.id}
                          title={`Q${q.index + 1} · ${q.topic} · ${s?.seen ? Math.round(m * 100) + "%" : "not seen"}`}
                          className={cn(
                            "size-4 rounded-[4px]",
                            !s?.seen ? "bg-slate-200 dark:bg-white/10" : m >= 0.8 ? "bg-emerald-500" : m >= 0.5 ? "bg-amber-400" : "bg-red-500",
                          )}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-2 flex gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-emerald-500" /> ≥80%</span>
                    <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-amber-400" /> 50–79%</span>
                    <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-red-500" /> &lt;50%</span>
                    <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-slate-200 dark:bg-white/10" /> not seen</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>Attempt history</SectionTitle>
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-white/5">
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Quiz</th>
                    <th className="px-4 py-3 font-semibold">Learning stage / mode</th>
                    <th className="px-4 py-3 text-right font-semibold">Score</th>
                    <th className="px-4 py-3 text-right font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.slice(0, 50).map((a) => {
                    const pct = Math.round((a.score / a.total) * 100);
                    return (
                      <tr key={a.id} className="border-b border-slate-100 last:border-0 dark:border-white/5">
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                          {new Date(a.finishedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                        </td>
                        <td className="px-4 py-3 font-medium">{getQuiz(a.quizId)?.title}</td>
                        <td className="px-4 py-3">{attemptLearningLabel(a)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <span className={cn("font-semibold", pct >= 80 ? "text-emerald-700 dark:text-emerald-400" : pct >= 50 ? "text-amber-700 dark:text-amber-400" : "text-red-700 dark:text-red-400")}>
                            {pct}%
                          </span>{" "}
                          <span className="text-slate-400">({a.score}/{a.total})</span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-500">{formatDuration(a.finishedAt - a.startedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </section>
        </>
      )}

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset all progress?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => (resetProgress(), setConfirmReset(false), setMsg("Progress reset."))}>
              Reset everything
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This deletes all attempts, mastery data and bookmarks in this browser. Export first if you want a backup.
        </p>
      </Modal>
    </div>
  );
}

function TrendChart({ attempts }: { attempts: Attempt[] }) {
  const W = 960, H = 260, P = { l: 48, r: 12, t: 16, b: 30 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const pts = attempts.map((a, i) => ({
    x: P.l + (attempts.length === 1 ? iw / 2 : (i / (attempts.length - 1)) * iw),
    y: P.t + ih * (1 - a.score / a.total),
    a,
  }));
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Score trend over the last ${attempts.length} attempts`}>
      {[0, 25, 50, 75, 100].map((v) => {
        const y = P.t + ih * (1 - v / 100);
        return (
          <g key={v}>
            <line x1={P.l} x2={W - P.r} y1={y} y2={y} className="stroke-slate-200 dark:stroke-white/10" strokeDasharray={v === 80 ? "4 4" : undefined} />
            <text x={P.l - 8} y={y + 4} textAnchor="end" className="fill-slate-400 text-[11px] tabular-nums">
              {v}%
            </text>
          </g>
        );
      })}
      <line x1={P.l} x2={W - P.r} y1={P.t + ih * 0.2} y2={P.t + ih * 0.2} className="stroke-emerald-500/60" strokeDasharray="4 4" />
      <text x={W - P.r} y={P.t + ih * 0.2 - 6} textAnchor="end" className="fill-emerald-600 text-[10px] font-semibold dark:fill-emerald-400">
        80% target
      </text>
      <path d={d} fill="none" strokeWidth={2.5} className="stroke-brand-600 dark:stroke-brand-400" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={p.a.id}>
          <circle cx={p.x} cy={p.y} r={10} fill="transparent">
            <title>{`${new Date(p.a.finishedAt).toLocaleDateString()} · ${p.a.mode} · ${Math.round((p.a.score / p.a.total) * 100)}% (${p.a.score}/${p.a.total})`}</title>
          </circle>
          <circle cx={p.x} cy={p.y} r={4} className="pointer-events-none fill-white stroke-brand-600 dark:fill-[#0b1215] dark:stroke-brand-400" strokeWidth={2} />
          {(attempts.length <= 10 || i % Math.ceil(attempts.length / 10) === 0) && (
            <text x={p.x} y={H - 8} textAnchor="middle" className="fill-slate-400 text-[10.5px]">
              #{i + 1}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
