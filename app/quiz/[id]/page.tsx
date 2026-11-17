import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizApp } from "@/components/quiz-app";
import { QUIZZES, getQuiz } from "@/lib/quizzes";

export function generateStaticParams() {
  return QUIZZES.map((q) => ({ id: q.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: getQuiz(id)?.title ?? "Quiz" };
}

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getQuiz(id)) notFound();
  return <QuizApp quizId={id} />;
}
