import { cn } from "@/lib/utils";

const KEYWORDS = new Set(
  "SELECT FROM WHERE AS AND OR NOT IN IS NULL LIKE BETWEEN ORDER BY GROUP HAVING INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE ALTER DROP JOIN INNER LEFT RIGHT FULL OUTER ON TOP DISTINCT UNION ALL CASE WHEN THEN ELSE END ASC DESC EXISTS PRIMARY KEY FOREIGN REFERENCES DEFAULT VIEW INDEX DATABASE USE GO WITH".split(
    " ",
  ),
);
const FUNCTIONS = new Set(
  "LOWER UPPER LEN TRIM LTRIM RTRIM SUBSTRING REPLACE CONCAT COUNT SUM AVG MIN MAX GETDATE DATEADD DATEDIFF YEAR MONTH DAY ROUND ABS CAST CONVERT ISNULL COALESCE".split(
    " ",
  ),
);

type Tok = { t: "c" | "k" | "f" | "i" | "o" | "v" | "n" | "p" | "w"; s: string };

/** Tiny T-SQL tokenizer → SSMS colour classes. */
export function tokenize(sql: string): Tok[] {
  const out: Tok[] = [];
  const re =
    /(--[^\n]*|\/\*[\s\S]*?\*\/)|('(?:''|[^'])*')|(\[[^\]]*\])|(\d+(?:\.\d+)?)|([A-Za-z_@#][\w@#$]*)|(<>|!=|<=|>=|[=<>+\-*/%])|(\s+)|(.)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql))) {
    if (m[1]) out.push({ t: "c", s: m[1] });
    else if (m[2]) out.push({ t: "v", s: m[2] });
    else if (m[3]) out.push({ t: "i", s: m[3] });
    else if (m[4]) out.push({ t: "n", s: m[4] });
    else if (m[5]) {
      const up = m[5].toUpperCase();
      const nextChar = sql.slice(re.lastIndex).match(/^\s*\(/);
      out.push({ t: FUNCTIONS.has(up) && nextChar ? "f" : KEYWORDS.has(up) ? "k" : "i", s: m[5] });
    } else if (m[6]) out.push({ t: "o", s: m[6] });
    else if (m[7]) out.push({ t: "w", s: m[7] });
    else out.push({ t: "p", s: m[8] });
  }
  return out;
}

const CLS: Record<Tok["t"], string> = {
  c: "text-[#16a34a] italic",
  k: "text-[#2563eb] font-semibold",
  f: "text-[#c026d3] font-semibold",
  i: "text-slate-900",
  o: "text-slate-500 font-semibold",
  v: "text-[#dc2626]",
  n: "text-[#0d9488]",
  p: "text-slate-500",
  w: "",
};

export function SqlCode({
  code,
  filename = "SQLQuery1.sql",
  className,
  lineNumbers = true,
}: {
  code: string;
  filename?: string;
  className?: string;
  lineNumbers?: boolean;
}) {
  // Tokenize the whole snippet (so /* … */ can span lines), then split into lines.
  const tokensByLine: Tok[][] = [[]];
  for (const tk of tokenize(code)) {
    tk.s.split("\n").forEach((part, i) => {
      if (i > 0) tokensByLine.push([]);
      if (part) tokensByLine[tokensByLine.length - 1].push({ t: tk.t, s: part });
    });
  }
  const lines = tokensByLine;
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/60",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <span className="size-2.5 rounded-full bg-[#f87171]" />
        <span className="size-2.5 rounded-full bg-[#fbbf24]" />
        <span className="size-2.5 rounded-full bg-[#34d399]" />
        <span className="ml-2 font-mono text-[11px] font-medium text-slate-500">{filename}</span>
        <span className="ml-auto rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600">
          T-SQL
        </span>
      </div>
      <pre className="overflow-x-auto py-3 font-mono text-[13px] leading-[1.7]">
        {tokensByLine.map((toks, i) => (
          <div key={i} className="flex px-4">
            {lineNumbers && lines.length > 1 && (
              <span className="mr-4 w-4 shrink-0 select-none text-right text-slate-300">{i + 1}</span>
            )}
            <code className="whitespace-pre">
              {toks.length === 0 ? " " : toks.map((tk, j) => (
                <span key={j} className={CLS[tk.t]}>
                  {tk.s}
                </span>
              ))}
            </code>
          </div>
        ))}
      </pre>
    </div>
  );
}

export const LEGEND = [
  { color: "#16a34a", label: "Comment", note: "never executed" },
  { color: "#2563eb", label: "Keyword", note: "reserved, UPPERCASE" },
  { color: "#c026d3", label: "Function", note: "input → output" },
  { color: "#0f172a", label: "Identifier", note: "table / column name" },
  { color: "#64748b", label: "Operator", note: "compares values" },
  { color: "#dc2626", label: "Static value", note: "fixed in the query" },
];
