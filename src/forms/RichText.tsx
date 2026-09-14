"use client";

// Texto enriquecido: editor WYSIWYG (Tiptap) + visor sanitizado (DOMPurify).
// Guarda y recibe HTML. Acotado a propósito: negrita, cursiva, subrayado,
// título/subtítulo, listas, cita, enlace y código EN LÍNEA. El bloque de
// código es un tipo de bloque de la app, no formato de texto.
// Nada de colores, fuentes ni tamaños: el diseño lo pone la app.
//
// Vive en el entrypoint aparte "adje-shared-ui/rich-text" (NO en el barrel)
// porque arrastra Tiptap y DOMPurify: solo las apps que lo usan los instalan
// (peerDependencies opcionales).
//
//   import { RichTextEditor, RichText } from "adje-shared-ui/rich-text";
//   <Field label="Teoría" as="div">      // as="div": un editor no va dentro de <label>
//     <RichTextEditor value={html} onChange={setHtml} placeholder="Escribe…" />
//   </Field>
//   <RichText html={html} />              // lo que ve el lector, ya sanitizado
//
// Errores que arrastraba la versión original (Aula Propia) y aquí quedan resueltos:
//  - Tiptap v3 ya no re-renderiza en cada transacción: la barra leía
//    editor.isActive() y se quedaba desactualizada. Ahora usa useEditorState.
//  - Un valor externo que cambiaba mientras se escribía (recarga de datos)
//    pisaba el contenido y movía el cursor. Ahora solo se sincroniza cuando el
//    editor NO tiene el foco; si llega con foco, se aplica al perder el foco.
//  - Dentro de un <label> (Field), hacer clic en el texto activaba el primer
//    botón de la barra (negrita). El raíz cancela esa activación y Field
//    admite as="div".
import { ReactNode, useEffect, useMemo, useRef } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import DOMPurify from "dompurify";
import { Bold, Code, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote, Redo2, Underline, Undo2 } from "lucide-react";
import { useFieldInvalid } from "./Field";

// ---------------- sanitizado y utilidades ----------------

const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "s", "h2", "h3", "h4", "ul", "ol", "li", "a", "blockquote", "code", "pre", "hr"];

// Protocolos que puede llevar un enlace. Fuera de aquí: javascript:, data:,
// vbscript: y compañía.
const URI_SEGURA = /^(?:https?:\/\/|mailto:|tel:|\/|#)/i;
const PROTOCOLOS = ["http", "https", "mailto", "tel"];

// Elementos que se van CON su contenido: no basta con quitar la etiqueta. Si
// no aparece el cierre, se come hasta el final a propósito: fallar cerrando.
const PELIGROSOS = /<(script|style|iframe|object|embed|template|noscript|svg|math)\b[\s\S]*?(?:<\/\1\s*>|$)/gi;

// Marca interna para apartar las etiquetas buenas mientras se escapa el resto.
// Usa caracteres de control que se eliminan de la entrada justo antes, así que
// no pueden chocar nunca con el texto de quien escribe.
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g;
const FICHA = /\u0001(\d+)\u0002/g;

function escaparTexto(t: string): string {
  // El & solo se escapa si no forma ya una entidad, para no dejar "&amp;amp;".
  return t.replace(/&(?!#?[a-zA-Z0-9]{1,8};)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escaparAtributo(t: string): string {
  return escaparTexto(t).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Sanitizado SIN DOM (servidor). DOMPurify necesita un `window`: fuera del
// navegador el paquete ni siquiera expone .sanitize, así que esto reventaba el
// render en servidor. Y lo que hacen otras librerías —devolver el HTML tal
// cual cuando no hay DOM— es justo el agujero que hay que evitar.
//
// La táctica va al revés de lo habitual: en vez de buscar lo malo, se apartan
// las etiquetas PERMITIDAS y se escapa todo lo demás como texto. Así no
// sobrevive ni un "<" suelto ni una etiqueta a medio cerrar que el navegador
// pueda recomponer.
function sanitizarSinDom(html: string): string {
  let s = html.replace(CONTROL, "").replace(/<!--[\s\S]*?-->/g, "").replace(PELIGROSOS, "");

  const fichas: string[] = [];
  s = s.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b((?:"[^"]*"|'[^']*'|[^>"'])*)>/g, (todo, nombre: string, attrs: string) => {
    const tag = nombre.toLowerCase();
    if (!ALLOWED_TAGS.includes(tag)) return "";
    let pieza: string;
    if (todo.startsWith("</")) {
      pieza = `</${tag}>`;
    } else if (tag === "a") {
      // De todos los atributos solo sobrevive href, y solo si el protocolo pasa.
      const m = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
      const url = (m?.[1] ?? m?.[2] ?? m?.[3] ?? "").trim();
      pieza = URI_SEGURA.test(url)
        ? `<a href="${escaparAtributo(url)}" target="_blank" rel="noopener noreferrer">`
        : "<a>";
    } else {
      pieza = `<${tag}>`;
    }
    fichas.push(pieza);
    return `\u0001${fichas.length - 1}\u0002`;
  });

  s = escaparTexto(s);
  return s.replace(FICHA, (_t, i: string) => fichas[Number(i)] ?? "");
}

// ¿Tenemos el DOMPurify de verdad? En el servidor el paquete exporta la
// fábrica, no la instancia: `sanitize` no existe.
function hayDomPurify(): boolean {
  return typeof window !== "undefined" && typeof (DOMPurify as { sanitize?: unknown }).sanitize === "function";
}

// Lo que se pinta a terceros pasa SIEMPRE por aquí: quien escribe el HTML no
// debe poder colar scripts a quien lo lee. Y lo que se PEGA en el editor pasa
// por aquí antes de entrar, para que lo guardado ya nazca limpio.
export function sanitizeRichText(html: string): string {
  if (!html) return "";
  if (!hayDomPurify()) return sanitizarSinDom(html);
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOWED_URI_REGEXP: URI_SEGURA,
    // Sin esto, <p onclick=…> perdería el atributo pero DOMPurify podría
    // dejar pasar datos en atributos data-* de un pegado.
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
}

// Texto plano (resúmenes, búsquedas, contar caracteres).
export function richTextToPlain(html: string): string {
  if (!html) return "";
  if (typeof document === "undefined") return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const d = document.createElement("div");
  d.innerHTML = sanitizeRichText(html);
  return (d.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function isRichTextEmpty(html: string): boolean {
  return richTextToPlain(html) === "";
}

// ---------------- visor ----------------

// HTML enriquecido tal y como lo ve el lector. Misma clase .rich-text que el
// editor, así el resultado es idéntico dentro y fuera.
export function RichText({ html, className = "" }: { html: string; className?: string }) {
  const limpio = useMemo(() => sanitizeRichText(html), [html]);
  if (!limpio) return null;
  return <div className={`rich-text ${className}`} dangerouslySetInnerHTML={{ __html: limpio }} />;
}

// ---------------- editor ----------------

function ToolButton({
  active,
  onClick,
  label,
  children,
  disabled,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // no robar el foco al editor
      onClick={onClick}
      className={`h-7 w-7 inline-flex items-center justify-center rounded-md border text-[13px] transition disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? "border-[var(--accent-blue)] bg-[var(--hover)] text-[var(--accent-blue)]"
          : "border-transparent hover:bg-[var(--hover)] text-muted"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-4 bg-[var(--border)] mx-1" />;
}

function Toolbar({ editor }: { editor: Editor }) {
  // Tiptap v3 no re-renderiza el componente en cada transacción: hay que
  // seleccionar explícitamente lo que la barra necesita para que los botones
  // reflejen el estado real (cursor sobre negrita, deshacer disponible…).
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      code: e.isActive("code"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  function link() {
    const previo = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL del enlace", previo ?? "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const escrita = url.trim();
    // Sin protocolo se asume https. Con un protocolo que no admitimos
    // (javascript:, data:…) se rechaza y se dice por qué: antes se le pegaba
    // "https://" delante y salía un enlace absurdo que no llevaba a ninguna
    // parte, en vez de un aviso.
    const tieneProtocolo = /^[a-z][a-z0-9+.-]*:/i.test(escrita);
    const limpia = tieneProtocolo ? escrita : `https://${escrita}`;
    if (!URI_SEGURA.test(limpia)) {
      window.alert("Ese enlace no se puede usar. Solo se admiten direcciones http, https, mailto: y tel:.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: limpia, target: "_blank", rel: "noopener noreferrer" }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--border)] px-1.5 py-1">
      <ToolButton label="Negrita (Ctrl+B)" active={s.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={14} />
      </ToolButton>
      <ToolButton label="Cursiva (Ctrl+I)" active={s.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={14} />
      </ToolButton>
      <ToolButton label="Subrayado (Ctrl+U)" active={s.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <Underline size={14} />
      </ToolButton>
      <Divider />
      <ToolButton label="Título" active={s.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 size={14} />
      </ToolButton>
      <ToolButton label="Subtítulo" active={s.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 size={14} />
      </ToolButton>
      <Divider />
      <ToolButton label="Lista" active={s.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={14} />
      </ToolButton>
      <ToolButton label="Lista numerada" active={s.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={14} />
      </ToolButton>
      <ToolButton label="Cita" active={s.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote size={14} />
      </ToolButton>
      <ToolButton label="Código en línea" active={s.code} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code size={14} />
      </ToolButton>
      <ToolButton label="Enlace" active={s.link} onClick={link}>
        <Link2 size={14} />
      </ToolButton>
      <span className="flex-1" />
      <ToolButton label="Deshacer (Ctrl+Z)" disabled={!s.canUndo} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 size={14} />
      </ToolButton>
      <ToolButton label="Rehacer (Ctrl+Y)" disabled={!s.canRedo} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 size={14} />
      </ToolButton>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escribe aquí…",
  minHeight = 140,
  invalid,
  className = "",
}: {
  value: string; // HTML ("" = vacío)
  onChange: (html: string) => void; // HTML; "" cuando el editor está vacío
  placeholder?: string;
  minHeight?: number; // px del área de escritura
  invalid?: boolean; // borde rojo (dentro de <Field error> se pone solo)
  className?: string;
}) {
  const fieldInvalid = useFieldInvalid();
  const bad = invalid ?? fieldInvalid;

  // Último HTML que emitió el editor: si el valor externo coincide, no hay
  // nada que sincronizar (evita resetear el documento en cada tecla).
  const lastEmitted = useRef<string | null>(null);
  // Valor externo recibido mientras el editor tenía el foco: se aplica al soltarlo.
  const pending = useRef<string | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Extensiones estables (no recrear el array en cada render).
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          // Barrera 1: un enlace con javascript:, data: o vbscript: no llega
          // ni a existir como marca dentro del documento.
          protocols: PROTOCOLOS,
          isAllowedUri: (url, ctx) => ctx.defaultValidate(url) && URI_SEGURA.test(url),
        },
        // El bloque de código NO va aquí: en las apps es un tipo de bloque
        // propio, con su lenguaje y su caja (decisión del 14 sep 2026). Dentro
        // del texto solo queda el código EN LÍNEA, que sí es formato de texto.
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    [placeholder]
  );

  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      extensions,
      content: value,
      editorProps: {
        attributes: { class: "rich-text rich-text-editor outline-none px-3 py-2.5" },
        // Barrera 2: copiar de una web y pegar aquí es la vía más fácil de
        // colar HTML raro. Se sanea ANTES de que ProseMirror lo interprete,
        // así que lo que entra en el documento ya viene limpio.
        transformPastedHTML: (html) => sanitizeRichText(html),
      },
      onUpdate({ editor }) {
        // Barrera 3: lo que sale hacia la app —y de ahí a la base de datos— va
        // saneado. Así el contenido guardado ya nace limpio y no depende de
        // que quien lo pinte se acuerde de sanear.
        const html = editor.isEmpty ? "" : sanitizeRichText(editor.getHTML());
        lastEmitted.current = html;
        onChangeRef.current(html);
      },
      onBlur({ editor }) {
        // Si llegó un valor externo mientras se escribía, aplicarlo ahora.
        const html = pending.current;
        pending.current = null;
        if (html != null && html !== (editor.isEmpty ? "" : editor.getHTML())) {
          editor.commands.setContent(html, { emitUpdate: false });
          lastEmitted.current = html;
        }
      },
    },
    [extensions]
  );

  // Cambio externo (cargar otro registro, recargar datos): sincronizar sin
  // pisar lo que se está teclando.
  useEffect(() => {
    if (!editor) return;
    if (lastEmitted.current !== null && value === lastEmitted.current) return;
    const actual = editor.isEmpty ? "" : editor.getHTML();
    if (value === actual) return;
    if (editor.isFocused) {
      pending.current = value;
      return;
    }
    editor.commands.setContent(value, { emitUpdate: false });
    lastEmitted.current = value;
  }, [value, editor]);

  const border = bad ? "border-[var(--negative)]" : "border-[var(--border)] focus-within:border-[var(--accent-blue)]";

  if (!editor) {
    return <div className={`rounded-xl border border-[var(--border)] bg-[var(--hover)] ${className}`} style={{ minHeight: minHeight + 38 }} />;
  }

  return (
    <div
      className={`rounded-xl border bg-[var(--background)] transition ${border} ${className}`}
      // Si el editor está dentro de un <label>, el clic en el texto activaría
      // el primer botón de la barra (negrita). Cancelamos esa activación.
      onClick={(e) => e.preventDefault()}
      aria-invalid={bad || undefined}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} style={{ minHeight }} />
    </div>
  );
}
