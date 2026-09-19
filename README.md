# AdjeUI (adje-shared-ui) — shared design system

Installable package (via a git dependency, no need to publish it to npm) with
the components and styles shared by the Adje apps: **MisFinanzas**,
**Adje Store**, **Aulora** and whatever comes next. Web only (React/Next);
the old Flutter version was retired.

## Organization

One component per file, grouped by category in `src/`:

| Folder | Components |
|---|---|
| `src/primitives` | Card, IconChip, Pill, Empty, Skeleton |
| `src/controls` | Button, IconButton, Segmented, Tabs, Switch, ChoiceOption/ChoiceMark, Toolbar, ScrollArrows |
| `src/forms` | Field, Input, Textarea, Select, ChipEditor, `useFormErrors` + `rules` (validation), `inputCls`; RichTextEditor/RichText (separate entrypoint `adje-shared-ui/rich-text`) |
| `src/overlays` | Modal, Drawer, ConfirmDialog, HelpTip, ToastProvider/useToast, Popover, Menu, useShortcuts |
| `src/data` | Stat, ProgressBar, Pagination, Table |
| `src/layout` | PageHeader, SectionTitle, Collapsible, SideNav + SideNavBrand/SideNavAction/SideNavButton/SideNavUser, `useTheme` |
| `src/tokens` | `palette(name, shade)`, `paletteHex`, `PALETTE` — fixed palette of 15 colors × 10 shades |

Charts (recharts) still live in MisFinanzas (`src/components/charts.tsx`):
they depend on recharts and on its euro formatters, and only that app uses them.
If Adje Store ever needs charts, they will move here as an optional module.

`src/index.ts` exports everything **except rich text**: `RichTextEditor`
(WYSIWYG with Tiptap: bold, italic, underline, heading, lists, quote, link),
`RichText` (sanitized viewer with DOMPurify), `sanitizeRichText`,
`richTextToPlain` and `isRichTextEmpty` are imported from `adje-shared-ui/rich-text`.
They are kept apart because they drag in Tiptap and DOMPurify: only the app that
uses them installs them (`npm i @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
@tiptap/pm dompurify`). The editor stores HTML; use it inside
`<Field as="div">` (an editor does not go inside a `<label>`). The historical entry points
(`adje-shared-ui/ui`, `/toast`, `/PageHeader`) keep working as
re-exports, so existing apps do not break; for new code import from plain
`adje-shared-ui`.

## House rules

- **Concrete sizes.** All inline controls (Button, Input —including the native
  date input—, Select, Segmented) measure `--control-h` (38px; `sm` 32px,
  `lg` 46px, defined in `theme.css`). Button, Input and Select share the
  `size` prop (sm/md/lg) with Segmented: an input and the button next to it
  ALWAYS wear the same size. Never a button taller or shorter than its input.
- **A single size scale.** `Switch`, `Radio`, `Checkbox` and
  `ChoiceOption` share `size` (sm/md/lg), just like
  Button/Input/Select/Segmented:
  `sm` for dense rows and tables, `md` by default, `lg` when the control
  rules the screen.
- **To choose, ONE component: `ChoiceOption`.** There used to be three for the
  same thing (PickCard, ChoiceToggle and ChoiceOption) and the chosen option was
  marked three different ways in the same app. The other two were retired in
  3.0.0. The whole row is clickable, not the little circle: the native input with
  `accent-color` neither lets itself be sized nor respects the theme.
  - The SHAPE of the mark tells how many you can choose: **round** for one,
    **square** for several. The radio has no center dot — on, it is a filled
    circle with a tick, same as the checkbox: a dot and a tick meant the same
    thing with two different drawings.
  - Chosen = **gradient border + tick**, and the tick appears ONCE: inside the
    mark, or on the right if you go without a mark (`mark={false}`, the old
    PickCard).
  - `tone="positive" | "negative"` + `align="center"` covers the two-option
    toggle with semantic color (the old ChoiceToggle).
  - `ChoiceMark` is the standalone mark, for your own lists and tables.
- **The Switch is for on/off**, not for choosing. It matches the
  `ChoiceOption` mark in all three sizes: before, an `md` measured 24px against
  the 18px of the mark next to it and looked like the main element of the row
  without being so.
- **If it does not fit, arrows — never a bar.** `Tabs` and `Segmented` show two
  arrows at the ends when their content overflows the container
  (`ScrollArrows`, reusable in any horizontal row). Scrollbars look
  different on every system and on Mac do not even appear until you touch them.
- **The Popover renders in `<body>`.** It uses a portal and a fixed position
  computed from the trigger, so no container with overflow clips it (scrolling
  tables, cards, sticky panels) — that was the cause of menus cut in half. If it
  does not fit below, it opens upward.
- **The chosen item is marked with a gradient border.** `PickCard` and `ChoiceOption`
  use the `.gradient-border` class from `theme.css` (three background layers, because
  `border-image` does not get along with `border-radius`). The flat accent was
  indistinguishable from the normal border in dark theme.
- **Block code is an ELEMENT, not text formatting.** `CodeBlock`
  (with language and copy button) is its own piece; inside rich text only
  INLINE code remains. No syntax highlighting on purpose: that calls for a
  separate library.
- **Rich text: three barriers.** `RichTextEditor` does not let dangerous HTML in
  (`transformPastedHTML` sanitizes pasted content BEFORE interpreting it), does not
  let links with odd protocols be created (`isAllowedUri` + `protocols`) and
  emits already sanitized output, so what gets stored is born clean. `RichText`
  sanitizes again when rendering. And `sanitizeRichText` works WITHOUT a DOM (server),
  where DOMPurify does not exist: instead of returning the HTML as is —the classic
  hole— it keeps the allowed tags aside and escapes everything else.
- **Menus with separators and shortcuts.** `Menu` items accept
  `{ separator: true }` to group (the usual one before a "Delete") and
  `shortcut: "mod+d"`, which is drawn as a key. The menu only DRAWS it: what makes
  it work is `useShortcuts(items)`, called where the actions live — so the
  shortcut works with the menu closed, which is the whole point.
- **Action zone.** Modal and Drawer have a `footer` prop: the save/cancel
  buttons go there (its own bar, always visible in the Drawer), never loose in
  the content.
- **Validation.** `useFormErrors` + `rules` to validate on the client, and
  `<Field error={errors.x} required>`: it paints the message in red and the
  control border automatically (via context), so it is always clear which field
  fails.
- **Colors only by token.** No hex in components: always `var(--...)`.
  Base tokens live in `theme.css`; brand identity tokens
  (`--accent-pink`, `--accent-blue`, `--app-gradient`, `--blue-shadow`,
  `--scrollbar-thumb`, `--scrollbar-thumb-hover`) are defined by each app in its
  `globals.css`.
- **Fixed palette for "data" colors.** Tags, categories, pills and
  charts use the palette of 15 colors × 10 shades (`--c-<color>-<shade>`,
  50→900): slate, red, orange, amber, yellow, lime, green, teal, cyan, blue,
  indigo, violet, purple, pink, rose. In code: `palette("green", 600)` returns
  `var(--c-green-600)`; `PALETTE.green[600]` gives the hex for targets without CSS
  (canvas, exported SVG). Shades do not change with the theme: 500–600 in light,
  300–400 in dark. All of them are visible in the Tokens section of the demo.
- **Three-zone navigation.** `SideNav` has `top` (usually `SideNavBrand`:
  icon + app name; or anything else: site switcher, notices), the menu (`items`) and `bottom` (anything;
  usually `SideNavUser`: avatar + name that opens a `Menu` with theme,
  settings, sign out) and `SideNavAction` (icon + label + badge, with an action or a
  popover: notifications, notices…). On desktop it is the 232px rail of the
  `.app-shell` layout, collapsible to icons only (72px) with the "Collapse" button (remembered
  in localStorage; `topCompact`/`bottomCompact` for the zones,
  `useSideNavCompact()` for your own content);
  below 768px it stays hidden on the left and opens with the hamburger
  that `PageHeader` draws only when a SideNav is mounted (no provider:
  `sideNavState`). It closes on navigation, with Escape or by tapping the backdrop.
- **No domain logic.** Only reusable UI here.

## Demo / showcase

```bash
npm install
npm run demo   # http://localhost:4400
```

`demo/` is a page with every component live, by category: use it to see what
exists before creating something new, and add any new component there.

## How each app consumes it

It is a real npm package (not published to the registry; installed straight from
GitHub), not a sibling folder with path aliases. In the consuming app's
`package.json`:

```json
"dependencies": {
  "adje-shared-ui": "github:AdjePG/AdjeUI"
}
```

And in its configuration:

- `next.config.mjs`: `transpilePackages: ["adje-shared-ui"]` (the package is
  distributed as uncompiled TSX).
- `tailwind.config.ts` → `content`: add
  `"./node_modules/adje-shared-ui/**/*.{ts,tsx}"` so Tailwind does not purge
  the package's classes.
- `app/layout.tsx` (or global): `import "adje-shared-ui/theme.css";`

**Publishing changes:** commit + push to `main` on GitHub and, in each app,
`npm update adje-shared-ui` (or delete `node_modules/adje-shared-ui` and
`npm install`). ALWAYS test in every app that consumes it: any change here
affects all of them.

## Breaking changes in 4.0.0

The whole codebase (comments, identifiers, default UI strings) moved from
Spanish to English. Public renames:

- Rich text: `HERRAMIENTAS_TEXTO` → `TEXT_TOOLS`; type `HerramientaTexto` →
  `TextTool`. Tool values: `"negrita"` → `"bold"`, `"cursiva"` → `"italic"`,
  `"subrayado"` → `"underline"`, `"lista"` → `"list"`, `"numerada"` →
  `"ordered"`, `"cita"` → `"quote"`, `"codigo"` → `"code"`, `"enlace"` →
  `"link"`, `"historial"` → `"history"` (`"h2"`/`"h3"` unchanged).
- `RichTextEditor` props: `herramientas` → `tools`; `variante` → `variant`,
  with values `"caja"` → `"box"` and `"plano"` → `"plain"`.
- Shortcuts: `esMac` → `isMac`, `useEsMac` → `useIsMac`, type `AccionConAtajo`
  → `ShortcutAction`.
- Code highlighting: `tokenizar` → `tokenize`, `porLineas` → `splitLines`, type
  `TipoToken` → `TokenType` (module `src/primitives/resaltado.ts` is now
  `src/primitives/highlight.ts`).
- Default UI strings (ConfirmDialog labels, placeholders, aria-labels) are now
  in English. Apps that relied on the Spanish defaults should pass their own
  labels.
- `ChoiceOption`: prop `marca` → `mark`. `ScrollArrows`: prop `paso` → `step`.
  `CodeBlock`: props `copiable` → `copyable`, `colorPorDefecto` →
  `defaultColor`, `numerosPorDefecto` → `defaultLineNumbers`.
- CSS classes in `theme.css`: `.principal` → `.app-shell`, `.borde-degradado` →
  `.gradient-border`, `.sin-scrollbar` → `.no-scrollbar`, `.codigo-scroll` →
  `.code-scroll`.
- Every other component and prop name was already English and is unchanged.
