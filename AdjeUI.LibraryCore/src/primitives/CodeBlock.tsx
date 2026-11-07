"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Hash, Palette } from "lucide-react";
import { splitLines, tokenize, type TokenType } from "./highlight";
import { overlineCls } from "./Overline";
import { ToggleIconButton } from "../internal/ToggleIconButton";

// Read-only code block: an element of its own, not text formatting. The
// reader turns colours and line numbers on or off (reading preferences, not
// the author's). Colours come from highlight.ts tokens rendered by React: no
// injected HTML.

const COLOR: Record<TokenType, string | undefined> = {
  txt: undefined,
  str: "var(--code-str)",
  com: "var(--code-com)",
  num: "var(--code-num)",
  kw: "var(--code-kw)",
  fn: "var(--code-fn)",
  pun: "var(--code-pun)",
};

export function CodeBlock({
  code,
  language,
  copyable = true,
  defaultColor = true,
  defaultLineNumbers = false,
  className = "",
}: {
  code: string;
  /** Language label ("js", "python"...). Also picks the colouring rules. */
  language?: string;
  /** Show the Copy button. */
  copyable?: boolean;
  /** Syntax colours on at first. */
  defaultColor?: boolean;
  /** Line numbers on at first. */
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
      // No clipboard access: the code is still selectable by hand.
    }
  }

  return (
    // --background, like the code field that edits it: the same object seen from two sides.
    <div className={`overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)] ${className}`}>
      <div className="flex items-center gap-1 border-b border-[var(--border)] px-1.5 py-1">
        {language && (
          <span className={`${overlineCls} rounded-md border border-[var(--border)] px-2 py-0.5 font-mono text-muted`}>{language}</span>
        )}
        <span className="flex-1" />
        <ToggleIconButton active={color} onClick={() => setColor(!color)} label="Syntax colors">
          <Palette size={14} />
        </ToggleIconButton>
        <ToggleIconButton active={lineNumbers} onClick={() => setLineNumbers(!lineNumbers)} label="Line numbers">
          <Hash size={14} />
        </ToggleIconButton>
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

      {/* Numbers in a column of their own, outside the scrolling <pre>: they
          stay put when a long line scrolls sideways. */}
      <div className="flex font-mono text-[13px] leading-[1.6]">
        {lineNumbers && (
          <div
            aria-hidden
            className="shrink-0 select-none self-stretch border-r border-[var(--border)] bg-[color-mix(in_srgb,var(--foreground)_3.5%,transparent)] py-3 pl-3.5 pr-3 text-right text-[color-mix(in_srgb,var(--muted)_70%,transparent)] tabular-nums"
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        )}

        {/* A visible scrollbar: without it a long line is out of reach except with a sideways wheel. */}
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
