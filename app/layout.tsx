import type { Metadata, Viewport } from "next";
import { AppHeader } from "@/components/app-header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SQL Academy — T-SQL Quiz Library", template: "%s · SQL Academy" },
  description: "Practice Microsoft SQL Server (T-SQL) lesson by lesson — quizzes, exams, flashcards and progress analytics.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1215" },
  ],
};

// Sets the theme class before first paint (no flash).
const themeScript = `(function(){try{var t=localStorage.getItem('sqlquiz:theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans">
        <div className="min-h-dvh">
          <AppHeader />
          <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6">{children}</main>
          <footer className="no-print mx-auto max-w-6xl px-6 pb-10 text-center text-xs text-slate-500">
            Built from your lesson transcripts · Microsoft SQL Server (T-SQL) · code colours match SSMS
          </footer>
        </div>
      </body>
    </html>
  );
}
