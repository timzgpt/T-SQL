/** A question exactly as authored (same shape as the original HTML quiz). */
export interface RawQuestion {
  topic: string;
  q: string;
  format?: QuestionFormat;
  learningStage?: LearningStage;
  context?: string;
  /** Plain T-SQL. It is syntax-highlighted automatically (SSMS colours). */
  code?: string;
  options: string[];
  /** Correct response; matching questions store a JSON array in pair order. */
  answer: string;
  acceptedAnswers?: string[];
  matchPairs?: MatchPair[];
  scenarioBranches?: ScenarioBranch[];
  hint: string;
  explain: string;
  tip?: string;
  difficulty?: Difficulty;
}

export type QuestionFormat = "multiple-choice" | "true-false" | "short-answer" | "matching" | "coding" | "scenario";

export interface MatchPair {
  left: string;
  right: string;
}

export interface ScenarioBranch {
  choice: string;
  outcome: string;
}

export type Difficulty = "easy" | "medium" | "hard";
export type LearningStage = "memorize" | "understand" | "practice" | "reflect" | "transfer";

export interface Question extends RawQuestion {
  /** Stable id: `${quizId}:${index}` */
  id: string;
  index: number;
  format: QuestionFormat;
  learningStage: LearningStage;
  difficulty: Difficulty;
}

export interface Quiz {
  id: string;
  lesson: number;
  title: string;
  description: string;
  minutes: number;
  topics: string[];
  questions: Question[];
}

export type QuizMode = "practice" | "exam" | "weak";
export type LegacyQuizPurpose = "diagnostic" | "formative" | "consolidation" | "summative";

export interface QuizConfig {
  mode: QuizMode;
  stage: LearningStage;
  topics: string[];
  count: number; // 0 = all
  shuffleQuestions: boolean;
  timed: boolean;
  secondsPerQuestion: number;
}

export interface AnswerRecord {
  questionId: string;
  chosen: string | null;
  correct: boolean;
  usedHint: boolean;
  flagged: boolean;
  ms: number;
}

export interface Attempt {
  id: string;
  quizId: string;
  mode: QuizMode;
  stage?: LearningStage;
  purpose?: LegacyQuizPurpose;
  startedAt: number;
  finishedAt: number;
  score: number;
  total: number;
  answers: AnswerRecord[];
}

export interface QuestionStat {
  seen: number;
  correct: number;
  lastCorrect: boolean;
  lastSeen: number;
  /** Self-rating from flashcards */
  known?: boolean;
}

export interface ProgressState {
  attempts: Attempt[];
  qstats: Record<string, QuestionStat>;
  bookmarks: string[];
}
