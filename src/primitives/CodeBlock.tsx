"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, Copy, Hash, Palette } from "lucide-react";
import { splitLines, tokenize, type TokenType } from "./highlight";

// Code block. It is an ELEMENT, not text formatting: that is why it does not
// live inside the rich-text editor but as its own piece.
//
// The READER decides how they see it (14 Sep 2026): they can turn on colors
// and line numbers with two buttons that look the same as the ones in the
// rich-text toolbar. These are reading preferences, not the author's.
//
// Colors come from our own dependency-free highlighter (highlight.ts) that
// returns tokens which React renders: no injected HTML.

const COLOR: Record<TokenType, string | undefined> = {
  txt: undefined,
  str: "var(--code-str)",
  com: "var(--code-com)",
  num: "var(--code-num)",
  kw: "var(--code-kw)",
  fn: "var(--code-fn)",
  pun: "var(--code-pun)",
};

function ReaderButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md border transition ${
        active
          ? "border-[var(--accent-blue)] bg-[var(--hover)] text-[var(--accent-blue)]"
          : "border-transparent text-muted hover:bg-[var(--hover)]"
      }`}
    >
      {children}
    </button>
  );
}

export function CodeBlock({
  code,
  language,
  copyable = true,
  defaultColor = true,
  defaultLineNumbers = false,
  className = "",
}: {
  code: string;
  /** Language label ("js", "python"...). Also picks the coloring rules. */
  language?: string;
  copyable?: boolean;
  defaultColor?: boolean;
  defaultLineNumbers?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [color, setColor] = useState(defaultColor);
  const [lineNumbers, setLineNumbers] = useState(defaultLineNumbers);

  const lines = useMemo(() => splitLines(tokenize(code, language)), [code, language]);
  const width = String(lines.length).length;

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* no clipboard is fine: the code is still selectable */
    }
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--hover)] ${className}`}>
      <div className="flex items-center gap-1 border-b border-[var(--border)] px-2 py-1">
        {language && (
          <span className="px-1.5 font-mono text-[11px] uppercase tracking-wide text-muted">{language}</span>
        )}
        <span className="flex-1" />
        <ReaderButton active={color} onClick={() => setColor(!color)} label="Syntax colors">
          <Palette size={14} />
        </ReaderButton>
        <ReaderButton active={lineNumbers} onClick={() => setLineNumbers(!lineNumbers)} label="Line numbers">
          <Hash size={14} />
        </ReaderButton>
        {copyable && (
          <button
            type="button"
            onClick={copy}
            title="Copy code"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted transition hover:bg-[var(--hover)] hover:text-[var(--foreground)]"
          >
            {copied ? <Check size={12} className="text-[var(--positive)]" /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      {/* The scrollbar is VISIBLE: it used to have .no-scrollbar and there was
          no way to reach a long line except with horizontal wheel scrolling. */}
      <pre className="code-scroll overflow-x-auto py-3 text-[13px] leading-[1.6]">
        <code className="block min-w-max font-mono">
          {lines.map((line, i) => (
            <span key={i} className="flex">
              {lineNumbers && (
                // Stuck to the left: when scrolling horizontally the number
                // stays put, which is exactly what it is for.
                <span
                  className="sticky left-0 shrink-0 select-none bg-[var(--hover)] pl-3.5 pr-3 text-right text-muted/70"
                  style={{ minWidth: `${width + 3}ch` }}
                  aria-hidden
                >
                  {i + 1}
                </span>
              )}
              <span className={lineNumbers ? "pr-3.5" : "px-3.5"}>
                {line.length ? (
                  line.map((tk, j) => (
                    <span key={j} style={color && COLOR[tk.t] ? { color: COLOR[tk.t] } : undefined}>
                      {tk.v}
                    </span>
                  ))
                ) : (
                  <br />
                )}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
