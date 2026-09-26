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
    // The same frame the builder's code field wears (23 Sep 2026): the surface
    // is --background, not --hover. With the lighter tint the block read flat
    // next to the one the teacher had just been typing in, and the two are
    // supposed to be the same object seen from two sides.
    <div className={`overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)] ${className}`}>
      <div className="flex items-center gap-1 border-b border-[var(--border)] px-1.5 py-1">
        {language && (
          // In a box, like the language control in the builder. As bare small
          // caps floating at the left edge it looked like a leftover label
          // rather than part of the bar.
          <span className="rounded-md border border-[var(--border)] px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-muted">
            {language}
          </span>
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

      {/* The builder's layout (24 Sep 2026): the numbers live in a column of
          their own, OUTSIDE the scrolling <pre>, running the whole height with
          their own tint and a border — so they stay put when a long line is
          scrolled, and the code keeps its full padding next to them. Painted
          per line, the numbers sat glued to the first character. */}
      <div className="flex font-mono text-[13px] leading-[1.6]">
        {lineNumbers && (
          <div
            aria-hidden
            className="shrink-0 select-none self-stretch border-r border-[var(--border)] bg-[color-mix(in_srgb,var(--foreground)_3.5%,transparent)] py-3 pl-3.5 pr-3 text-right text-muted/70 tabular-nums"
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        )}

        {/* The scrollbar is VISIBLE: it used to have .no-scrollbar and there
            was no way to reach a long line except with horizontal wheel
            scrolling. */}
        <pre className="code-scroll m-0 min-w-0 flex-1 overflow-x-auto">
          <code className="block min-w-max whitespace-pre px-3.5 py-3">
            {lines.map((line, i) => (
              <div key={i}>
                {line.length ? (
                  line.map((tk, j) => (
                    <span key={j} style={color && COLOR[tk.t] ? { color: COLOR[tk.t] } : undefined}>
                      {tk.v}
                    </span>
                  ))
                ) : (
                  <br />
                )}
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
