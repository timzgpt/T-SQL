# SQL Academy — T-SQL Quiz Library (Next.js)

A redesign of the single-file `sql-components-quiz.html`, rebuilt with **Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4**.
The visual design follows the **UI/UX Pro Max** design system saved in `design-system/sql-academy/MASTER.md`
(Flat Design · education teal + amber · Inter + JetBrains Mono).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export → ./out (host on IIS, Nginx, GitHub Pages, Vercel…)
```

## Features

| Area | What you get |
|---|---|
| **Library dashboard** | Mastery ring per lesson, per-topic meters, best score, stats (mastered, average, streak, weak spots), recent activity, query anatomy + SSMS colour legend |
| **Quiz setup** | Question formats: **multiple choice, true/false, short answer, matching, SQL coding, and scenario decisions**. Choose a pedagogical purpose: **diagnostic, formative, consolidation/review, or summative**. Modes: Practice (instant feedback + hints), Exam (feedback after submit), and Weak spots. Filter by topic and difficulty, shuffle, and set a time limit |
| **Quiz runner** | Format-aware answer inputs and scoring, scenario outcomes for each choice, segmented progress, question navigator with flags, countdown timer (auto-submit), bookmarks, per-question timing, full keyboard control |
| **Results** | Score ring, delta vs previous attempt, time stats, performance by topic (weakest first), filterable review (all / missed / flagged), **retry missed only** |
| **Study sheet** | Full-text search, topic filter, bookmarked-only, **self-test mode** (reveal one by one), print-friendly |
| **Flashcards** | 3D flip cards, "Still learning / I knew it" ratings that feed weak-spot practice, shuffle |
| **Progress** | Accuracy, mastery heatmap per question, score trend chart, attempt history, **export / import / reset** (JSON) |
| **Polish** | Light/dark theme (no flash), `?` shortcuts panel, SSMS-style T-SQL highlighter with line numbers, reduced-motion support, visible focus rings, 44px touch targets |

Progress is stored in `localStorage` (key `sqlquiz:progress:v2`) — no backend needed.

## Keyboard

`1–4` / `A–D` answer · `H` hint · `F` flag · `← →` navigate · `Enter` next · `Space` flip card · `Esc` exit · `?` help

## Adding the next lesson

1. Create `lib/quizzes/select.ts` exporting a `RawQuestion[]`. Questions default to multiple choice; set `format` to `true-false`, `short-answer`, `matching`, `coding`, or `scenario` for the other local formats. Typed questions can provide `acceptedAnswers`, matching questions use `matchPairs`, and scenario questions provide `context` plus a `scenarioBranches` outcome for every option. Put SQL code as plain T-SQL; highlighting is automatic. Optional `difficulty: "easy" | "medium" | "hard"`.
2. Register it in `lib/quizzes/index.ts` (`DEFS` array).

The build fails fast when answers, matching pairs, true/false options, or scenario outcomes are invalid. Video-timestamp quizzes and live competitions are not included; they need video assets or a real-time backend.

## Structure

```
app/                    routes: / · /quiz/[id] · /study/[id] · /flashcards/[id] · /progress
components/             dashboard, quiz-app (setup/runner/results), study-sheet, flashcards, progress-view, sql-code, ui
lib/quizzes/            question banks + registry
lib/progress.ts         localStorage store (useSyncExternalStore), mastery & streak logic
design-system/          UI/UX Pro Max MASTER.md
```
