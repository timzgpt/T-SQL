import type { Quiz, RawQuestion } from "../types";
import { COMPONENTS_QUESTIONS } from "./components";

interface QuizDef {
  id: string;
  lesson: number;
  title: string;
  description: string;
  minutes: number;
  questions: RawQuestion[];
}

/* ------------------------------------------------------------------ *
 *  QUIZ LIBRARY — add a new lesson by creating lib/quizzes/<name>.ts
 *  (same question shape as components.ts) and registering it here.
 * ------------------------------------------------------------------ */
const DEFS: QuizDef[] = [
  {
    id: "components",
    lesson: 1,
    title: "Components of SQL",
    description:
      "Statements, clauses, keywords, functions, identifiers, operators and static values — the building blocks of every T-SQL query.",
    minutes: 15,
    questions: COMPONENTS_QUESTIONS,
  },
  // { id: "select", lesson: 2, title: "The SELECT Statement", ... questions: SELECT_QUESTIONS },
];

function build(def: QuizDef): Quiz {
  const topics: string[] = [];
  const questions = def.questions.map((q, index) => {
    const format = q.format ?? "multiple-choice";
    if (format === "matching") {
      if (!q.matchPairs?.length || !q.options.length) {
        throw new Error(`[quiz ${def.id}] Q${index + 1}: matching questions need pairs and answer options`);
      }
      if (q.matchPairs.some((pair) => !q.options.includes(pair.right))) {
        throw new Error(`[quiz ${def.id}] Q${index + 1}: every matching answer must be an option`);
      }
      if (q.answer !== JSON.stringify(q.matchPairs.map((pair) => pair.right))) {
        throw new Error(`[quiz ${def.id}] Q${index + 1}: matching answer must list pair answers in order`);
      }
    } else if (format === "short-answer" || format === "coding") {
      if (!q.answer.trim()) throw new Error(`[quiz ${def.id}] Q${index + 1}: typed-answer questions need an answer`);
    } else if (!q.options.includes(q.answer)) {
      throw new Error(`[quiz ${def.id}] Q${index + 1}: answer is not one of the options`);
    }
    if (format === "true-false" && (!q.options.includes("True") || !q.options.includes("False"))) {
      throw new Error(`[quiz ${def.id}] Q${index + 1}: true/false questions need both options`);
    }
    if (
      format === "scenario" &&
      (!q.context || q.options.some((option) => !q.scenarioBranches?.some((branch) => branch.choice === option)))
    ) {
      throw new Error(`[quiz ${def.id}] Q${index + 1}: scenario questions need context and an outcome for each option`);
    }
    if (!topics.includes(q.topic)) topics.push(q.topic);
    return { ...q, format, id: `${def.id}:${index}`, index, difficulty: q.difficulty ?? "easy" };
  });
  return { ...def, topics, questions };
}

export const QUIZZES: Quiz[] = DEFS.map(build);

export function getQuiz(id: string): Quiz | undefined {
  return QUIZZES.find((q) => q.id === id);
}

export const TOTAL_QUESTIONS = QUIZZES.reduce((s, q) => s + q.questions.length, 0);
