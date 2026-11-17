import type { Attempt, Question } from "./types";

export const FORMAT_LABELS = {
  "multiple-choice": "Multiple choice",
  "true-false": "True / false",
  "short-answer": "Short answer",
  matching: "Matching",
  coding: "SQL coding",
  scenario: "Scenario",
} as const;

export const LEARNING_STAGE_LABELS = {
  memorize: "Memorize",
  understand: "Understand",
  practice: "Practice",
  reflect: "Reflect",
  transfer: "Transfer",
} as const;

export const LEARNING_STAGE_DESCRIPTIONS = {
  memorize: "Recall SQL terms, syntax, and key facts.",
  understand: "Explain what SQL components do and why they work.",
  practice: "Apply concepts by reading and writing SQL.",
  reflect: "Review your reasoning, errors, and what you learned.",
  transfer: "Apply SQL knowledge to new and unfamiliar situations.",
} as const;

const LEGACY_PURPOSE_LABELS = {
  diagnostic: "Diagnostic",
  formative: "Formative · low stakes",
  consolidation: "Consolidation · review",
  summative: "Summative",
} as const;

export function attemptLearningLabel(attempt: Pick<Attempt, "stage" | "purpose" | "mode">): string {
  const stage = attempt.stage ? LEARNING_STAGE_LABELS[attempt.stage] : undefined;
  if (stage) return stage;
  const legacyPurpose = attempt.purpose ? LEGACY_PURPOSE_LABELS[attempt.purpose] : undefined;
  if (legacyPurpose) return `${legacyPurpose} · legacy`;
  return attempt.mode === "weak" ? "Weak spots" : attempt.mode;
}

export function matchingValues(question: Question, response: string | null): string[] {
  if (!response) return [];
  try {
    const parsed: unknown = JSON.parse(response);
    if (!Array.isArray(parsed) || !parsed.every((value) => typeof value === "string")) return [];
    return question.matchPairs?.map((_, index) => parsed[index] ?? "") ?? [];
  } catch (error) {
    if (error instanceof SyntaxError) return [];
    throw error;
  }
}

export function isQuestionAnswered(question: Question, response: string | null): boolean {
  if (response === null) return false;
  if (question.format === "matching") {
    const values = matchingValues(question, response);
    return values.length === question.matchPairs?.length && values.every((value) => value.trim().length > 0);
  }
  return response.trim().length > 0;
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function isQuestionCorrect(question: Question, response: string | null): boolean {
  if (response === null || !isQuestionAnswered(question, response)) return false;
  if (question.format === "matching") return response === question.answer;
  if (question.format === "short-answer" || question.format === "coding") {
    return [question.answer, ...(question.acceptedAnswers ?? [])].some((answer) => normalizeText(answer) === normalizeText(response));
  }
  return response === question.answer;
}

export function formatQuestionAnswer(question: Question, response: string | null): string {
  if (response === null || !response.trim()) return "— not answered";
  if (question.format !== "matching") return response;
  const values = matchingValues(question, response);
  if (!values.length) return "— not answered";
  return question.matchPairs?.map((pair, index) => `${pair.left} → ${values[index] || "—"}`).join(" · ") ?? response;
}

export function formatCorrectAnswer(question: Question): string {
  return formatQuestionAnswer(question, question.answer);
}
