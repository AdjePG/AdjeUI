// Minimal, dependency-free syntax highlighting (14 Sep 2026).
//
// Why hand-rolled instead of highlight.js or prism: those libraries return HTML
// that has to go through dangerouslySetInnerHTML —exactly what we just locked
// down in the rich-text editor— and they weigh more than the whole rest of the
// design system combined. Here we return TOKENS and React renders them, so
// there is no HTML to inject and nothing can sneak in.
//
// The scope is deliberately small: strings, comments, numbers, keywords and
// function calls. With that a snippet of code reads far better, and whatever
// it does not recognize stays as plain text — never red or struck through. It
// does not pretend to be a language parser.

export type TokenType = "txt" | "str" | "com" | "num" | "kw" | "fn" | "pun";
export type Token = { t: TokenType; v: string };

// Comment families, because that is what varies most between languages.
const HASH_COMMENT = ["python", "py", "bash", "sh", "shell", "yaml", "yml", "ruby", "rb", "r", "perl"];
const DOUBLE_DASH_COMMENT = ["sql", "lua", "haskell"];
const NO_SLASH_COMMENT = ["python", "py", "bash", "sh", "shell", "yaml", "yml", "ruby", "rb", "sql", "html", "xml"];

const COMMON_KEYWORDS = [
  "if","else","for","while","do","switch","case","break","continue","return","function","class","new","this",
  "try","catch","finally","throw","import","export","from","as","in","of","typeof","instanceof","delete","void",
  "true","false","null","undefined","const","let","var","static","public","private","protected","extends",
  "implements","interface","enum","struct","type","async","await","yield","super","default",
];

const PER_LANGUAGE: Record<string, string[]> = {
  python: ["def","elif","lambda","None","True","False","and","or","not","is","pass","with","global","nonlocal","assert","raise","except","self","print","len","range"],
  sql: ["select","insert","update","delete","from","where","join","inner","left","right","outer","on","group","order","by","having","limit","values","into","set","create","table","alter","drop","index","and","or","not","null","as","distinct","count","sum"],
  go: ["func","package","defer","go","chan","map","range","nil","var","type"],
  rust: ["fn","let","mut","impl","trait","match","use","pub","crate","mod","Some","None","Ok","Err","self"],
  css: ["important"],
};

function keywordsFor(lang?: string): Set<string> {
  const l = (lang ?? "").toLowerCase();
  const extra = PER_LANGUAGE[l] ?? [];
  // SQL and CSS do not share the vocabulary of the curly-brace languages.
  const base = l === "sql" || l === "css" ? [] : COMMON_KEYWORDS;
  return new Set([...base, ...extra].map((p) => p.toLowerCase()));
}

export function tokenize(code: string, lang?: string): Token[] {
  const l = (lang ?? "").toLowerCase();
  const keywords = keywordsFor(l);
  const usesHash = HASH_COMMENT.includes(l);
  const usesDoubleDash = DOUBLE_DASH_COMMENT.includes(l);
  const usesSlashes = !NO_SLASH_COMMENT.includes(l);
  const output: Token[] = [];
  let buffer = "";

  const flush = () => {
    if (buffer) {
      output.push({ t: "txt", v: buffer });
      buffer = "";
    }
  };
  const push = (t: TokenType, v: string) => {
    flush();
    output.push({ t, v });
  };

  let i = 0;
  while (i < code.length) {
    const c = code[i];
    const two = code.slice(i, i + 2);

    // --- comments ---
    if (usesSlashes && two === "/*") {
      const end = code.indexOf("*/", i + 2);
      const upTo = end === -1 ? code.length : end + 2;
      push("com", code.slice(i, upTo));
      i = upTo;
      continue;
    }
    const lineComment =
      (usesSlashes && two === "//") || (usesHash && c === "#") || (usesDoubleDash && two === "--");
    if (lineComment) {
      const end = code.indexOf("\n", i);
      const upTo = end === -1 ? code.length : end;
      push("com", code.slice(i, upTo));
      i = upTo;
      continue;
    }

    // --- strings (with escapes; an unclosed string runs to the end) ---
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === "\\") {
          j += 2;
          continue;
        }
        if (code[j] === c) {
          j++;
          break;
        }
        // Single and double quotes do not span lines; template literals do.
        if (code[j] === "\n" && c !== "`") break;
        j++;
      }
      push("str", code.slice(i, j));
      i = j;
      continue;
    }

    // --- numbers ---
    if (/[0-9]/.test(c) && !/[A-Za-z_$]/.test(code[i - 1] ?? "")) {
      const m = /^(?:0[xXbBoO][0-9a-fA-F_]+|[0-9][0-9_]*(?:\.[0-9_]+)?(?:[eE][+-]?[0-9]+)?)/.exec(code.slice(i));
      if (m) {
        push("num", m[0]);
        i += m[0].length;
        continue;
      }
    }

    // --- identifiers: keyword, function call or plain text ---
    if (/[A-Za-z_$@]/.test(c)) {
      const m = /^[A-Za-z0-9_$@]+/.exec(code.slice(i))!;
      const word = m[0];
      const rest = code.slice(i + word.length);
      if (keywords.has(word.toLowerCase())) push("kw", word);
      else if (/^\s*\(/.test(rest)) push("fn", word);
      else buffer += word;
      i += word.length;
      continue;
    }

    // --- punctuation ---
    if (/[{}()[\];,.:+\-*/%=<>!&|^~?]/.test(c)) {
      push("pun", c);
      i++;
      continue;
    }

    buffer += c;
    i++;
  }
  flush();
  return output;
}

// Tokens are split on line breaks so lines can be numbered without breaking
// a comment or a string that spans several of them.
export function splitLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];
  for (const tk of tokens) {
    const parts = tk.v.split("\n");
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ t: tk.t, v: part });
    });
  }
  return lines;
}
