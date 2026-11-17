import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Flashcards } from "@/components/flashcards";
import { QUIZZES, getQuiz } from "@/lib/quizzes";

export function generateStaticParams() {
  return QUIZZES.map((q) => ({ id: q.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Flashcards · ${getQuiz(id)?.title ?? ""}` };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getQuiz(id)) notFound();
  return <Flashcards quizId={id} />;
}
