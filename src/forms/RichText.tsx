"use client";

// Rich text: WYSIWYG editor (Tiptap) + sanitized viewer (DOMPurify).
// Stores and receives HTML. Deliberately limited: bold, italic, underline,
// heading/subheading, lists, quote, link and INLINE code. The code block is
// an app-level block type, not text formatting.
// No colors, fonts or sizes: the design is set by the app.
//
// Lives in the separate entrypoint "adje-shared-ui/rich-text" (NOT in the
// barrel) because it drags in Tiptap and DOMPurify: only the apps that use it
// install them (optional peerDependencies).
//
//   import { RichTextEditor, RichText } from "adje-shared-ui/rich-text";
//   <Field label="Theory" as="div">      // as="div": an editor does not go inside a <label>
//     <RichTextEditor value={html} onChange={setHtml} placeholder="Write…" />
//   </Field>
//   <RichText html={html} />              // what the reader sees, already sanitized
//
// Bugs the original version (Aulora, then called Aula Propia) carried and that are fixed here:
//  - Tiptap v3 no longer re-renders on every transaction: the toolbar read
//    editor.isActive() and went stale. Now it uses useEditorState.
//  - An external value that changed while typing (data reload) overwrote the
//    content and moved the cursor. Now it only syncs when the editor does NOT
//    have focus; if it arrives while focused, it is applied on blur.
//  - Inside a <label> (Field), clicking the text activated the first toolbar
//    button (bold). The root cancels that activation and Field accepts
//    as="div".
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import DOMPurify from "dompurify";
import { Bold, Code, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote, Redo2, Underline, Undo2 } from "lucide-react";
import { useFieldInvalid } from "./Field";

// ---------------- sanitizing and utilities ----------------

const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "s", "h2", "h3", "h4", "ul", "ol", "li", "a", "blockquote", "code", "pre", "hr"];

// Protocols a link may carry. Everything else is out: javascript:, data:,
// vbscript: and friends.
const SAFE_URI = /^(?:https?:\/\/|mailto:|tel:|\/|#)/i;
const PROTOCOLS = ["http", "https", "mailto", "tel"];

// Elements that go away WITH their content: removing the tag is not enough. If
// the closing tag never shows up, it eats through to the end on purpose: fail closed.
const DANGEROUS = /<(script|style|iframe|object|embed|template|noscript|svg|math)\b[\s\S]*?(?:<\/\1\s*>|$)/gi;

// Internal marker to set the good tags aside while the rest is escaped.
// Uses control characters that are stripped from the input right before, so
// they can never collide with the writer's text.
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g;
const TOKEN = /\u0001(\d+)\u0002/g;

// Editor tools. Removing one is not hiding the button: the capability leaves
// the document (15 Sep 2026). If in some app headings are provided by
// something else —in Aulora, the Section block—, keeping them here only lets
// two ways of doing the same thing coexist, and lets a hand-written h2 sneak
// into a table of contents that does not expect it.
export type TextTool =
  | "bold"
  | "italic"
  | "underline"
  | "h2"
  | "h3"
  | "list"
  | "ordered"
  | "quote"
  | "code"
  | "link"
  | "history";

export const TEXT_TOOLS: TextTool[] = [
  "bold",
  "italic",
  "underline",
  "h2",
  "h3",
  "list",
  "ordered",
  "quote",
  "code",
  "link",
  "history",
];

function escapeText(t: string): string {
  // The & is only escaped if it does not already form an entity, to avoid leaving "&amp;amp;".
  return t.replace(/&(?!#?[a-zA-Z0-9]{1,8};)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttribute(t: string): string {
  return escapeText(t).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// DOM-less sanitizing (server). DOMPurify needs a `window`: outside the
// browser the package does not even expose .sanitize, so this blew up the
// server render. And what other libraries do —return the HTML as is when
// there is no DOM— is exactly the hole to avoid.
//
// The tactic is the reverse of the usual: instead of looking for the bad, the
// ALLOWED tags are set aside and everything else is escaped as text. That way
// not a single stray "<" nor a half-closed tag the browser could reassemble
// survives.
function sanitizeWithoutDom(html: string): string {
  let s = html.replace(CONTROL, "").replace(/<!--[\s\S]*?-->/g, "").replace(DANGEROUS, "");

  const tokens: string[] = [];
  s = s.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b((?:"[^"]*"|'[^']*'|[^>"'])*)>/g, (whole, name: string, attrs: string) => {
    const tag = name.toLowerCase();
    if (!ALLOWED_TAGS.includes(tag)) return "";
    let piece: string;
    if (whole.startsWith("</")) {
      piece = `</${tag}>`;
    } else if (tag === "a") {
      // Of all the attributes only href survives, and only if the protocol passes.
      const m = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
      const url = (m?.[1] ?? m?.[2] ?? m?.[3] ?? "").trim();
      piece = SAFE_URI.test(url)
        ? `<a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">`
        : "<a>";
    } else {
      piece = `<${tag}>`;
    }
    tokens.push(piece);
    return `\u0001${tokens.length - 1}\u0002`;
  });

  s = escapeText(s);
  return s.replace(TOKEN, (_t, i: string) => tokens[Number(i)] ?? "");
}

// Do we have the real DOMPurify? On the server the package exports the
// factory, not the instance: `sanitize` does not exist.
function hasDomPurify(): boolean {
  return typeof window !== "undefined" && typeof (DOMPurify as { sanitize?: unknown }).sanitize === "function";
}

// Whatever is rendered to third parties ALWAYS goes through here: whoever
// writes the HTML must not be able to slip scripts to whoever reads it. And
// whatever is PASTED into the editor goes through here before entering, so
// what gets stored is born clean.
export function sanitizeRichText(html: string): string {
  if (!html) return "";
  if (!hasDomPurify()) return sanitizeWithoutDom(html);
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOWED_URI_REGEXP: SAFE_URI,
    // Without this, <p onclick=…> would lose the attribute but DOMPurify could
    // let data through in data-* attributes from a paste.
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
}

// Plain text (summaries, searches, character counting).
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

// ---------------- viewer ----------------

// Rich HTML as the reader sees it. Same .rich-text class as the editor, so
// the result is identical inside and outside.
export function RichText({ html, className = "" }: { html: string; className?: string }) {
  const clean = useMemo(() => sanitizeRichText(html), [html]);
  if (!clean) return null;
  return <div className={`rich-text ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />;
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
      onMouseDown={(e) => e.preventDefault()} // do not steal focus from the editor
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

function Toolbar({ editor, floating = false, has }: { editor: Editor; floating?: boolean; has: (h: TextTool) => boolean }) {
  // Tiptap v3 does not re-render the component on every transaction: what the
  // toolbar needs has to be selected explicitly so the buttons reflect the
  // real state (cursor on bold, undo available…).
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
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const typed = url.trim();
    // Without a protocol, https is assumed. With a protocol we do not accept
    // (javascript:, data:…) it is rejected and the reason is given: before,
    // "https://" was glued in front and an absurd link came out that led
    // nowhere, instead of a warning.
    const hasProtocol = /^[a-z][a-z0-9+.-]*:/i.test(typed);
    const clean = hasProtocol ? typed : `https://${typed}`;
    if (!SAFE_URI.test(clean)) {
      window.alert("That link cannot be used. Only http, https, mailto: and tel: addresses are allowed.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: clean, target: "_blank", rel: "noopener noreferrer" }).run();
  }

  return (
    <div className={floating ? "flex flex-wrap items-center gap-0.5 px-1 py-0.5" : "flex flex-wrap items-center gap-0.5 border-b border-[var(--border)] px-1.5 py-1"}>
      {has("bold") && (
        <ToolButton label="Bold (Ctrl+B)" active={s.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={14} />
        </ToolButton>
      )}
      {has("italic") && (
        <ToolButton label="Italic (Ctrl+I)" active={s.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={14} />
        </ToolButton>
      )}
      {has("underline") && (
        <ToolButton label="Underline (Ctrl+U)" active={s.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <Underline size={14} />
        </ToolButton>
      )}
      {(has("h2") || has("h3")) && <Divider />}
      {has("h2") && (
        <ToolButton label="Heading" active={s.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={14} />
        </ToolButton>
      )}
      {has("h3") && (
        <ToolButton label="Subheading" active={s.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={14} />
        </ToolButton>
      )}
      <Divider />
      {has("list") && (
        <ToolButton label="Bullet list" active={s.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={14} />
        </ToolButton>
      )}
      {has("ordered") && (
        <ToolButton label="Numbered list" active={s.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={14} />
        </ToolButton>
      )}
      {has("quote") && (
        <ToolButton label="Quote" active={s.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={14} />
        </ToolButton>
      )}
      {has("code") && (
        <ToolButton label="Inline code" active={s.code} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code size={14} />
        </ToolButton>
      )}
      {has("link") && (
        <ToolButton label="Link" active={s.link} onClick={link}>
          <Link2 size={14} />
        </ToolButton>
      )}
      {has("history") && (
        <>
          <span className="flex-1" />
          <ToolButton label="Undo (Ctrl+Z)" disabled={!s.canUndo} onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 size={14} />
          </ToolButton>
          <ToolButton label="Redo (Ctrl+Y)" disabled={!s.canRedo} onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 size={14} />
          </ToolButton>
        </>
      )}
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write here…",
  minHeight = 140,
  invalid,
  className = "",
  variant = "box",
  tools = TEXT_TOOLS,
}: {
  value: string; // HTML ("" = empty)
  onChange: (html: string) => void; // HTML; "" when the editor is empty
  placeholder?: string;
  minHeight?: number; // px of the writing area
  invalid?: boolean; // red border (inside <Field error> it is set automatically)
  className?: string;
  /**
   * "box": frame and toolbar always visible (forms).
   * "plain": no frame or padding, and the toolbar ONLY appears —floating
   * above— while typing. For document-like editors, where a box per paragraph
   * turns the page into a form (15 Sep 2026).
   */
  variant?: "box" | "plain";
  /**
   * What can be used. Whatever is not here does not show in the toolbar AND
   * DOES NOT EXIST in the document either: not via shortcut, nor by pasting
   * HTML that carries it. By default, everything.
   */
  tools?: TextTool[];
}) {
  const fieldInvalid = useFieldInvalid();
  const bad = invalid ?? fieldInvalid;
  const plain = variant === "plain";
  const [focused, setFocused] = useState(false);
  // The list is compared by content: that way an array literal in the
  // parent's JSX does not recreate the editor on every render.
  const key = tools.join(",");
  const has = useMemo(() => {
    const set = new Set(key.split(","));
    return (h: TextTool) => set.has(h);
  }, [key]);

  // Last HTML the editor emitted: if the external value matches, there is
  // nothing to sync (avoids resetting the document on every keystroke).
  const lastEmitted = useRef<string | null>(null);
  // External value received while the editor had focus: applied on release.
  const pending = useRef<string | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Stable extensions (do not recreate the array on every render). A disabled
  // tool is disabled in the SCHEMA, not in the toolbar: if we only hid the
  // button, the keyboard shortcut and pasting would keep inserting that tag.
  const extensions = useMemo(
    () => {
      const have = (h: string) => key.split(",").includes(h);
      const levels = ([2, 3] as const).filter((n) => have(n === 2 ? "h2" : "h3"));
      const lists = have("list") || have("ordered");
      return [
        StarterKit.configure({
          bold: have("bold") ? undefined : false,
          italic: have("italic") ? undefined : false,
          underline: have("underline") ? undefined : false,
          heading: levels.length ? { levels: [...levels] } : false,
          bulletList: have("list") ? undefined : false,
          orderedList: have("ordered") ? undefined : false,
          listItem: lists ? undefined : false,
          blockquote: have("quote") ? undefined : false,
          code: have("code") ? undefined : false,
          undoRedo: have("history") ? undefined : false,
          link: have("link")
            ? {
                openOnClick: false,
                autolink: true,
                defaultProtocol: "https",
                // Barrier 1: a link with javascript:, data: or vbscript: never
                // even comes to exist as a mark inside the document.
                protocols: PROTOCOLS,
                isAllowedUri: (url: string, ctx: { defaultValidate: (u: string) => boolean }) =>
                  ctx.defaultValidate(url) && SAFE_URI.test(url),
              }
            : false,
          // The code block does NOT go here: in the apps it is its own block
          // type, with its language and its box (decision of 14 Sep 2026).
          // Inside the text only INLINE code remains, which is text formatting.
          codeBlock: false,
        }),
        Placeholder.configure({ placeholder }),
      ];
    },
    [placeholder, key]
  );

  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      extensions,
      content: value,
      editorProps: {
        attributes: { class: `rich-text rich-text-editor outline-none ${plain ? "py-1" : "px-3 py-2.5"}` },
        // Barrier 2: copying from a web page and pasting here is the easiest
        // way to slip in odd HTML. It is sanitized BEFORE ProseMirror
        // interprets it, so what enters the document is already clean.
        transformPastedHTML: (html) => sanitizeRichText(html),
        // Pasting text from a .md file, or from any editor that wraps lines at
        // 80 characters, glued the words at the break: a text with "an" at the
        // end of one line and "interpreter" at the start of the next ended up
        // as "aninterpreter" (seen in Aulora on 15 Sep 2026). A single line
        // break is a space; two or more still separate paragraphs.
        transformPastedText: (text) =>
          text.replace(/\r\n?/g, "\n").replace(/([^\n])\n(?!\n)/g, "$1 "),
      },
      onUpdate({ editor }) {
        // Barrier 3: what goes out to the app —and from there to the
        // database— is sanitized. That way the stored content is born clean
        // and does not depend on whoever renders it remembering to sanitize.
        const html = editor.isEmpty ? "" : sanitizeRichText(editor.getHTML());
        lastEmitted.current = html;
        onChangeRef.current(html);
      },
      onFocus() {
        setFocused(true);
      },
      onBlur({ editor }) {
        setFocused(false);
        // If an external value arrived while typing, apply it now.
        const html = pending.current;
        pending.current = null;
        if (html != null && html !== (editor.isEmpty ? "" : editor.getHTML())) {
          editor.commands.setContent(html, { emitUpdate: false });
          lastEmitted.current = html;
        }
      },
    },
    [extensions, plain]
  );

  // External change (loading another record, reloading data): sync without
  // overwriting what is being typed.
  useEffect(() => {
    if (!editor) return;
    if (lastEmitted.current !== null && value === lastEmitted.current) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (value === current) return;
    if (editor.isFocused) {
      pending.current = value;
      return;
    }
    editor.commands.setContent(value, { emitUpdate: false });
    lastEmitted.current = value;
  }, [value, editor]);

  const border = bad ? "border-[var(--negative)]" : "border-[var(--border)] focus-within:border-[var(--accent-blue)]";

  if (!editor) {
    return plain ? (
      <div className={className} style={{ minHeight }} />
    ) : (
      <div className={`rounded-xl border border-[var(--border)] bg-[var(--hover)] ${className}`} style={{ minHeight: minHeight + 38 }} />
    );
  }

  // Plain: the toolbar floats over the block instead of pushing it. If it
  // pushed, the text would jump down every time you put the cursor in a paragraph.
  if (plain) {
    return (
      <div className={`relative ${className}`} onClick={(e) => e.preventDefault()} aria-invalid={bad || undefined}>
        {focused && (
          <div className="absolute -top-1.5 left-0 z-30 -translate-y-full rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg">
            <Toolbar editor={editor} floating has={has} />
          </div>
        )}
        <EditorContent editor={editor} style={{ minHeight }} />
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border bg-[var(--background)] transition ${border} ${className}`}
      // If the editor is inside a <label>, clicking the text would activate
      // the first toolbar button (bold). We cancel that activation.
      onClick={(e) => e.preventDefault()}
      aria-invalid={bad || undefined}
    >
      <Toolbar editor={editor} has={has} />
      <EditorContent editor={editor} style={{ minHeight }} />
    </div>
  );
}
