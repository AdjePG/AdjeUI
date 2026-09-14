// Resaltado de sintaxis mínimo y sin dependencias (14 sep 2026).
//
// Por qué a mano y no con highlight.js o prism: esas librerías devuelven HTML
// que hay que meter con dangerouslySetInnerHTML —justo lo que acabamos de
// blindar en el texto enriquecido— y pesan más que todo el resto del sistema
// de diseño junto. Aquí se devuelven TOKENS y los pinta React, así que no hay
// HTML que inyectar y no puede colarse nada.
//
// El alcance es deliberadamente corto: cadenas, comentarios, números, palabras
// clave y llamadas a función. Con eso un trozo de código se lee muchísimo
// mejor, y lo que no reconoce se queda en texto normal — nunca en rojo ni
// tachado. No pretende ser un analizador del lenguaje.

export type TipoToken = "txt" | "str" | "com" | "num" | "kw" | "fn" | "pun";
export type Token = { t: TipoToken; v: string };

// Familias de comentario, porque es lo que más cambia entre lenguajes.
const ALMOHADILLA = ["python", "py", "bash", "sh", "shell", "yaml", "yml", "ruby", "rb", "r", "perl"];
const GUION_DOBLE = ["sql", "lua", "haskell"];
const SIN_BARRAS = ["python", "py", "bash", "sh", "shell", "yaml", "yml", "ruby", "rb", "sql", "html", "xml"];

const COMUNES = [
  "if","else","for","while","do","switch","case","break","continue","return","function","class","new","this",
  "try","catch","finally","throw","import","export","from","as","in","of","typeof","instanceof","delete","void",
  "true","false","null","undefined","const","let","var","static","public","private","protected","extends",
  "implements","interface","enum","struct","type","async","await","yield","super","default",
];

const POR_LENGUAJE: Record<string, string[]> = {
  python: ["def","elif","lambda","None","True","False","and","or","not","is","pass","with","global","nonlocal","assert","raise","except","self","print","len","range"],
  sql: ["select","insert","update","delete","from","where","join","inner","left","right","outer","on","group","order","by","having","limit","values","into","set","create","table","alter","drop","index","and","or","not","null","as","distinct","count","sum"],
  go: ["func","package","defer","go","chan","map","range","nil","var","type"],
  rust: ["fn","let","mut","impl","trait","match","use","pub","crate","mod","Some","None","Ok","Err","self"],
  css: ["important"],
};

function palabrasDe(lang?: string): Set<string> {
  const l = (lang ?? "").toLowerCase();
  const extra = POR_LENGUAJE[l] ?? [];
  // SQL y CSS no comparten el vocabulario de los lenguajes de llaves.
  const base = l === "sql" || l === "css" ? [] : COMUNES;
  return new Set([...base, ...extra].map((p) => p.toLowerCase()));
}

export function tokenizar(code: string, lang?: string): Token[] {
  const l = (lang ?? "").toLowerCase();
  const claves = palabrasDe(l);
  const usaAlmohadilla = ALMOHADILLA.includes(l);
  const usaGuion = GUION_DOBLE.includes(l);
  const usaBarras = !SIN_BARRAS.includes(l);
  const salida: Token[] = [];
  let buffer = "";

  const soltar = () => {
    if (buffer) {
      salida.push({ t: "txt", v: buffer });
      buffer = "";
    }
  };
  const push = (t: TipoToken, v: string) => {
    soltar();
    salida.push({ t, v });
  };

  let i = 0;
  while (i < code.length) {
    const c = code[i];
    const dos = code.slice(i, i + 2);

    // --- comentarios ---
    if (usaBarras && dos === "/*") {
      const fin = code.indexOf("*/", i + 2);
      const hasta = fin === -1 ? code.length : fin + 2;
      push("com", code.slice(i, hasta));
      i = hasta;
      continue;
    }
    const lineaComentada =
      (usaBarras && dos === "//") || (usaAlmohadilla && c === "#") || (usaGuion && dos === "--");
    if (lineaComentada) {
      const fin = code.indexOf("\n", i);
      const hasta = fin === -1 ? code.length : fin;
      push("com", code.slice(i, hasta));
      i = hasta;
      continue;
    }

    // --- cadenas (con escapes; una cadena sin cerrar llega hasta el final) ---
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
        // Las comillas simples y dobles no cruzan de línea; las plantillas sí.
        if (code[j] === "\n" && c !== "`") break;
        j++;
      }
      push("str", code.slice(i, j));
      i = j;
      continue;
    }

    // --- números ---
    if (/[0-9]/.test(c) && !/[A-Za-z_$]/.test(code[i - 1] ?? "")) {
      const m = /^(?:0[xXbBoO][0-9a-fA-F_]+|[0-9][0-9_]*(?:\.[0-9_]+)?(?:[eE][+-]?[0-9]+)?)/.exec(code.slice(i));
      if (m) {
        push("num", m[0]);
        i += m[0].length;
        continue;
      }
    }

    // --- identificadores: palabra clave, llamada a función o texto ---
    if (/[A-Za-z_$@]/.test(c)) {
      const m = /^[A-Za-z0-9_$@]+/.exec(code.slice(i))!;
      const palabra = m[0];
      const resto = code.slice(i + palabra.length);
      if (claves.has(palabra.toLowerCase())) push("kw", palabra);
      else if (/^\s*\(/.test(resto)) push("fn", palabra);
      else buffer += palabra;
      i += palabra.length;
      continue;
    }

    // --- puntuación ---
    if (/[{}()[\];,.:+\-*/%=<>!&|^~?]/.test(c)) {
      push("pun", c);
      i++;
      continue;
    }

    buffer += c;
    i++;
  }
  soltar();
  return salida;
}

// Los tokens se parten por saltos de línea para poder numerar las líneas sin
// romper un comentario o una cadena que ocupe varias.
export function porLineas(tokens: Token[]): Token[][] {
  const lineas: Token[][] = [[]];
  for (const tk of tokens) {
    const partes = tk.v.split("\n");
    partes.forEach((parte, i) => {
      if (i > 0) lineas.push([]);
      if (parte) lineas[lineas.length - 1].push({ t: tk.t, v: parte });
    });
  }
  return lineas;
}
