"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Database, Keyboard, LibraryBig, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "./ui";

const NAV = [
  { href: "/", label: "Library", icon: LibraryBig },
  { href: "/progress", label: "Progress", icon: BarChart3 },
];

const SHORTCUTS: [string, string][] = [
  ["1 – 4  /  A – D", "Choose an answer"],
  ["H", "Show / hide hint"],
  ["F", "Flag question for review"],
  ["← / →", "Previous / next question"],
  ["Enter", "Next question / submit"],
  ["Space", "Flip flashcard"],
  ["Esc", "Close dialog"],
  ["?", "Open this panel"],
];

export function AppHeader() {
  const path = usePathname();
  const [dark, setDark] = useState(false);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea")) return;
      if (e.key === "?") setHelp((h) => !h);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("sqlquiz:theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-white/5 dark:bg-[#0b1215]/75">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-brand-700 text-white dark:bg-brand-500 dark:text-slate-950">
            <Database className="size-4" strokeWidth={2.5} />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight">SQL Academy</span>
            <span className="block text-[10.5px] font-medium uppercase tracking-wider text-slate-500">
              SQL Server · T-SQL
            </span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 sm:flex">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                  active
                    ? "bg-slate-900/5 text-slate-900 dark:bg-white/10 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/progress"
            className="grid size-11 place-items-center rounded-lg text-slate-500 hover:bg-slate-900/5 sm:hidden dark:hover:bg-white/10"
            aria-label="Progress"
          >
            <BarChart3 className="size-4" />
          </Link>
          <button
            onClick={() => setHelp(true)}
            className="hidden size-11 place-items-center rounded-lg text-slate-500 hover:bg-slate-900/5 hover:text-slate-900 sm:grid dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            <Keyboard className="size-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="grid size-11 place-items-center rounded-lg text-slate-500 hover:bg-slate-900/5 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </div>

      <Modal open={help} onClose={() => setHelp(false)} title="Keyboard shortcuts">
        <ul className="divide-y divide-slate-200 dark:divide-white/10">
          {SHORTCUTS.map(([k, v]) => (
            <li key={k} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-slate-600 dark:text-slate-300">{v}</span>
              <kbd className="rounded-md border border-slate-300 border-b-2 bg-slate-50 px-2 py-0.5 font-mono text-xs dark:border-white/15 dark:bg-white/5">
                {k}
              </kbd>
            </li>
          ))}
        </ul>
      </Modal>
    </header>
  );
}
