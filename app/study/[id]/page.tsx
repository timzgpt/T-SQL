import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudySheet } from "@/components/study-sheet";
import { QUIZZES, getQuiz } from "@/lib/quizzes";

export function generateStaticParams() {
  return QUIZZES.map((q) => ({ id: q.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Study sheet · ${getQuiz(id)?.title ?? ""}` };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getQuiz(id)) notFound();
  return <StudySheet quizId={id} />;
}
