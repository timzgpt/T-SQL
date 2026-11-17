"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Lightbulb, RotateCcw, Shuffle, Undo2 } from "lucide-react";
import { getQuiz } from "@/lib/quizzes";
import { rateCard, useProgress } from "@/lib/progress";
import { FORMAT_LABELS, formatCorrectAnswer } from "@/lib/question-utils";
import { cn, shuffle } from "@/lib/utils";
import { Badge, Button, Card, Kbd, Meter, Segmented } from "./ui";
import { SqlCode } from "./sql-code";

type Deck = "all" | "learning";

export function Flashcards({ quizId }: { quizId: string }) {
  const quiz = getQuiz(quizId)!;
  const { qstats } = useProgress();
  const [deck, setDeck] = useState<Deck>("all");
  const [order, setOrder] = useState<string[]>(() => quiz.questions.map((q) => q.id));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const cards = useMemo(() => {
    const byId = new Map(quiz.questions.map((q) => [q.id, q]));
    return order
      .map((id) => byId.get(id)!)
      .filter((q) => deck === "all" || qstats[q.id]?.known !== true);
  }, [order, deck, quiz, qstats]);

  const known = quiz.questions.filter((q) => qstats[q.id]?.known === true).length;
  const card = cards[Math.min(i, cards.length - 1)];
  const done = cards.length === 0;

  const move = useCallback(
    (d: number) => {
      setFlipped(false);
      setI((x) => Math.max(0, Math.min(cards.length - 1, x + d)));
    },
    [cards.length],
  );

  const rate = useCallback(
    (k: boolean) => {
      if (!card) return;
      rateCard(card.id, k);
      setFlipped(false);
      // In the "learning" deck a known card drops out, so the index already points at the next one.
      if (!(deck === "learning" && k)) setI((x) => Math.min(cards.length - 1, x + 1));
    },
    [card, deck, cards.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea")) return;
      if (e.key === " ") return e.preventDefault(), setFlipped((f) => !f);
      if (e.key === "ArrowRight") return move(1);
      if (e.key === "ArrowLeft") return move(-1);
      if (flipped && e.key === "1") return rate(false);
      if (flipped && e.key === "2") return rate(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, rate, flipped]);

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <Link href="/" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
        <ArrowLeft className="size-4" /> Library
      </Link>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="brand">Flashcards · Lesson {quiz.lesson}</Badge>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{quiz.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Segmented
            value={deck}
            onChange={(d) => (setDeck(d), setI(0), setFlipped(false))}
            options={[
              { value: "all", label: `All ${quiz.questions.length}` },
              { value: "learning", label: `Still learning ${quiz.questions.length - known}` },
            ]}
          />
          <Button variant="secondary" aria-label="Shuffle deck" onClick={() => (setOrder(shuffle(order)), setI(0), setFlipped(false))}>
            <Shuffle className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mb-5 flex items-center gap-3 text-sm">
        <Meter value={known / quiz.questions.length} className="h-2" />
        <span className="shrink-0 tabular-nums text-slate-500">
          {known}/{quiz.questions.length} known
        </span>
      </div>

      {done ? (
        <Card className="p-10 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-500 text-white">
            <Check className="size-6" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Deck complete</h2>
          <p className="mt-1 text-slate-600 dark:text-slate-400">You marked every card as known. Lock it in with a timed exam.</p>
          <div className="mt-5 flex justify-center gap-2">
            <Button variant="secondary" onClick={() => setDeck("all")}>
              <RotateCcw className="size-4" /> Review all
            </Button>
            <Link href={`/quiz/${quiz.id}?mode=exam`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-600 dark:bg-brand-500 dark:text-slate-950">
              Take the exam <ArrowRight className="size-4" />
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <div className={cn("flip", flipped && "flipped")}>
            <div className="flip-inner relative grid min-h-[380px]">
              {/* Front */}
              <button
                type="button"
                onClick={() => setFlipped(true)}
                aria-label="Show answer"
                className="flip-face col-start-1 row-start-1 flex flex-col rounded-2xl border border-slate-200 bg-white p-6 text-left dark:border-white/10 dark:bg-[#111a1e] sm:p-8"
                tabIndex={flipped ? -1 : 0}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Badge tone="cyan">{card.topic}</Badge>
                  <Badge tone="slate">{FORMAT_LABELS[card.format]}</Badge>
                  <span className="ml-auto text-sm tabular-nums text-slate-500">
                    {Math.min(i, cards.length - 1) + 1} / {cards.length}
                  </span>
                </div>
                <h2 className="text-xl font-semibold leading-snug sm:text-2xl">{card.q}</h2>
                {card.code && <SqlCode code={card.code} className="mt-5" />}
                <span className="mt-auto pt-6 text-center text-sm text-slate-400">
                  Click or press <Kbd>Space</Kbd> to reveal
                </span>
              </button>
              {/* Back */}
              <div
                className="flip-face flip-back col-start-1 row-start-1 flex flex-col rounded-2xl border border-brand-600 bg-brand-50 p-6 dark:border-brand-400 dark:bg-[#0f2523] sm:p-8"
                aria-hidden={!flipped}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400">Answer</div>
                <p className="mt-1 text-xl font-semibold leading-snug sm:text-2xl">{formatCorrectAnswer(card)}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{card.explain}</p>
                {card.tip && (
                  <p className="mt-4 flex gap-2 text-sm font-medium text-brand-700 dark:text-brand-400">
                    <Lightbulb className="mt-0.5 size-4 shrink-0" /> {card.tip}
                  </p>
                )}
                <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
                  <Button variant="secondary" size="lg" onClick={() => rate(false)} tabIndex={flipped ? 0 : -1}>
                    <Undo2 className="size-4 text-amber-600" /> Still learning <Kbd>1</Kbd>
                  </Button>
                  <Button size="lg" onClick={() => rate(true)} tabIndex={flipped ? 0 : -1}>
                    <Check className="size-4" /> I knew it <Kbd>2</Kbd>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <Button variant="ghost" onClick={() => move(-1)} disabled={i === 0}>
              <ArrowLeft className="size-4" /> Prev
            </Button>
            <span className="hidden text-xs text-slate-400 sm:block">
              <Kbd>←</Kbd> <Kbd>→</Kbd> navigate · <Kbd>Space</Kbd> flip · <Kbd>1</Kbd>/<Kbd>2</Kbd> rate
            </span>
            <Button variant="ghost" onClick={() => move(1)} disabled={i >= cards.length - 1}>
              Next <ArrowRight className="size-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
