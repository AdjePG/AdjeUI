"use client";

// Rich text: WYSIWYG editor (Tiptap) + sanitized viewer (DOMPurify).
// Stores and receives HTML. Deliberately limited: bold, italic, underline,
// heading/subheading, lists, quote, link and INLINE code (a code block is an
// app-level block). No colours, fonts or sizes: the design is set by the app.
//
// A separate entrypoint ("adje-shared-ui/rich-text"), not in the barrel: it
// drags in Tiptap and DOMPurify, optional peerDependencies.
//
//   import { RichTextEditor, RichText } from "adje-shared-ui/rich-text";
//   <Field label="Theory">
//     <RichTextEditor value={html} onChange={setHtml} placeholder="Write…" />
//   </Field>
//   <RichText html={html} />              // what the reader sees, already sanitized
import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import DOMPurify from "dompurify";
import { Bold, Code, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote, Redo2, Underline, Undo2 } from "lucide-react";
import { useFieldInvalid } from "./Field";
import { ToggleIconButton } from "../internal/ToggleIconButton";
import { useLatest } from "../internal/useLatest";

// ---------------- sanitizing and utilities ----------------

const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "s", "h2", "h3", "ul", "ol", "li", "a", "blockquote", "code", "pre", "hr"];

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

// Editor tools. Removing one does not hide a button: the capability leaves the
// document schema, so it cannot come back by shortcut or paste either.
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

// DOM-less sanitizing (server), where DOMPurify has no `sanitize`. Returning
// the HTML as is would be the hole; instead the ALLOWED tags are set aside and
// everything else is escaped as text, so no stray "<" or half-closed tag
// survives for the browser to reassemble.
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

// Every link opens in a new tab, the same on the server and in the browser
// (so both renders match), and nothing else carries target/rel.
function linkTargets(node: Element) {
  if (node.tagName === "A" && node.hasAttribute("href")) {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  } else {
    node.removeAttribute("target");
    node.removeAttribute("rel");
  }
}

/** Sanitizes user HTML before it is stored or rendered: DOMPurify in the browser, an allow-list escaper on the server. */
export function sanitizeRichText(html: string): string {
  if (!html) return "";
  if (!hasDomPurify()) return sanitizeWithoutDom(html);
  DOMPurify.addHook("afterSanitizeAttributes", linkTargets);
  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR: ["href"],
      ALLOWED_URI_REGEXP: SAFE_URI,
      ALLOW_DATA_ATTR: false,
      ALLOW_ARIA_ATTR: false,
    });
  } finally {
    DOMPurify.removeHook("afterSanitizeAttributes", linkTargets);
  }
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (whole, name: string) => {
    if (name[0] !== "#") return ENTITIES[name.toLowerCase()] ?? whole;
    const code = name[1] === "x" || name[1] === "X" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    return Number.isFinite(code) && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
  });
}

/** Plain text of rich HTML (summaries, search, character counts). */
export function richTextToPlain(html: string): string {
  if (!html) return "";
  if (typeof document === "undefined") return decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
  const d = document.createElement("div");
  d.innerHTML = sanitizeRichText(html);
  return (d.textContent ?? "").replace(/\s+/g, " ").trim();
}

/** Whether rich HTML has no text at all (required-field checks). */
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

  // A divider only between two groups that are both there.
  const hasInline = has("bold") || has("italic") || has("underline");
  const hasHeadings = has("h2") || has("h3");
  const hasBlocks = has("list") || has("ordered") || has("quote") || has("code") || has("link");

  function link() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const typed = url.trim();
    // Without a protocol, https is assumed; a protocol we do not accept
    // (javascript:, data:…) is rejected with the reason.
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
        <ToggleIconButton keepFocus label="Bold (Ctrl+B)" active={s.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={14} />
        </ToggleIconButton>
      )}
      {has("italic") && (
        <ToggleIconButton keepFocus label="Italic (Ctrl+I)" active={s.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={14} />
        </ToggleIconButton>
      )}
      {has("underline") && (
        <ToggleIconButton keepFocus label="Underline (Ctrl+U)" active={s.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <Underline size={14} />
        </ToggleIconButton>
      )}
      {hasInline && hasHeadings && <Divider />}
      {has("h2") && (
        <ToggleIconButton keepFocus label="Heading" active={s.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={14} />
        </ToggleIconButton>
      )}
      {has("h3") && (
        <ToggleIconButton keepFocus label="Subheading" active={s.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={14} />
        </ToggleIconButton>
      )}
      {(hasInline || hasHeadings) && hasBlocks && <Divider />}
      {has("list") && (
        <ToggleIconButton keepFocus label="Bullet list" active={s.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={14} />
        </ToggleIconButton>
      )}
      {has("ordered") && (
        <ToggleIconButton keepFocus label="Numbered list" active={s.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={14} />
        </ToggleIconButton>
      )}
      {has("quote") && (
        <ToggleIconButton keepFocus label="Quote" active={s.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={14} />
        </ToggleIconButton>
      )}
      {has("code") && (
        <ToggleIconButton keepFocus label="Inline code" active={s.code} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code size={14} />
        </ToggleIconButton>
      )}
      {has("link") && (
        <ToggleIconButton keepFocus label="Link" active={s.link} onClick={link}>
          <Link2 size={14} />
        </ToggleIconButton>
      )}
      {has("history") && (
        <>
          <span className="flex-1" />
          <ToggleIconButton keepFocus label="Undo (Ctrl+Z)" disabled={!s.canUndo} onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 size={14} />
          </ToggleIconButton>
          <ToggleIconButton keepFocus label="Redo (Ctrl+Y)" disabled={!s.canRedo} onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 size={14} />
          </ToggleIconButton>
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
  /** HTML ("" = empty). */
  value: string;
  /** Sanitized HTML; "" when the editor is empty. */
  onChange: (html: string) => void;
  placeholder?: string;
  /** Height of the writing area (px). */
  minHeight?: number;
  /** Red border; inside a Field with `error` it is set automatically. */
  invalid?: boolean;
  className?: string;
  /**
   * "box": frame and toolbar always visible (forms).
   * "plain": no frame or padding, and the toolbar only floats above while
   * typing, for document-like editors.
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
  const onChangeRef = useLatest(onChange);
  // Read by the editor when it needs them, so changing them does not rebuild it.
  const placeholderRef = useLatest(placeholder);
  const classRef = useLatest(`rich-text rich-text-editor outline-none ${plain ? "py-1" : "px-3 py-2.5"}`);

  // Sanitizing the whole document is the costly part of a keystroke: it runs
  // once typing pauses, and at once on blur and on unmount.
  const emitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const emitNow = useRef<(() => void) | null>(null);
  function flush() {
    clearTimeout(emitTimer.current);
    const run = emitNow.current;
    emitNow.current = null;
    run?.();
  }
  useEffect(() => flush, []);

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
                // Barrier 1: a javascript:/data:/vbscript: link never becomes a mark.
                protocols: PROTOCOLS,
                isAllowedUri: (url: string, ctx: { defaultValidate: (u: string) => boolean }) =>
                  ctx.defaultValidate(url) && SAFE_URI.test(url),
              }
            : false,
          // No tool creates these, so they are not in the schema either.
          codeBlock: false,
          strike: false,
          horizontalRule: false,
        }),
        Placeholder.configure({ placeholder: () => placeholderRef.current }),
      ];
    },
    [key, placeholderRef],
  );

  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      extensions,
      content: value,
      editorProps: {
        attributes: () => ({ class: classRef.current }),
        // Barrier 2: pasted HTML is sanitized before ProseMirror reads it.
        transformPastedHTML: (html) => sanitizeRichText(html),
        // Text wrapped at 80 columns (a .md file) would glue the words at each
        // break: a single line break is a space; two or more still separate paragraphs.
        transformPastedText: (text) =>
          text.replace(/\r\n?/g, "\n").replace(/([^\n])\n(?!\n)/g, "$1 "),
      },
      onUpdate({ editor }) {
        // Barrier 3: what goes out to the app (and the database) is sanitized.
        emitNow.current = () => {
          const html = editor.isEmpty ? "" : sanitizeRichText(editor.getHTML());
          lastEmitted.current = html;
          onChangeRef.current(html);
        };
        clearTimeout(emitTimer.current);
        emitTimer.current = setTimeout(flush, 150);
      },
      onFocus() {
        setFocused(true);
      },
      onBlur({ editor }) {
        setFocused(false);
        flush();
        // If an external value arrived while typing, apply it now.
        const html = pending.current;
        pending.current = null;
        if (html != null && html !== (editor.isEmpty ? "" : editor.getHTML())) {
          editor.commands.setContent(html, { emitUpdate: false });
          lastEmitted.current = html;
        }
      },
    },
    [extensions],
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

  // Plain: the toolbar floats over the block instead of pushing the text down.
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
      className={`rounded-xl border bg-[var(--field-bg,var(--background))] transition ${border} ${className}`}
      // Inside a wrapping <label> a click would activate the first toolbar button.
      onClick={(e) => e.preventDefault()}
      aria-invalid={bad || undefined}
    >
      <Toolbar editor={editor} has={has} />
      <EditorContent editor={editor} style={{ minHeight }} />
    </div>
  );
}
