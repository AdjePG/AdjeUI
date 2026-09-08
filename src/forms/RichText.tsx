"use client";

// Texto enriquecido: editor WYSIWYG (Tiptap) + visor sanitizado (DOMPurify).
// Guarda y recibe HTML. Acotado a propósito: negrita, cursiva, subrayado,
// título/subtítulo, listas, cita y enlace. Nada de colores, fuentes ni
// tamaños: el diseño lo pone la app.
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
import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote, Redo2, Underline, Undo2 } from "lucide-react";
import { useFieldInvalid } from "./Field";

// ---------------- sanitizado y utilidades ----------------

const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "s", "h2", "h3", "h4", "ul", "ol", "li", "a", "blockquote", "code", "pre", "hr"];

// Lo que se pinta a terceros pasa SIEMPRE por aquí: quien escribe el HTML no
// debe poder colar scripts a quien lo lee.
export function sanitizeRichText(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:)/i,
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
    const limpia = /^(https?:\/\/|mailto:|tel:)/i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
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
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
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
      },
      onUpdate({ editor }) {
        const html = editor.isEmpty ? "" : editor.getHTML();
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
