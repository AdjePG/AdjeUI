# AdjeUI (adje-shared-ui) — shared design system

Installable package (via a git dependency, no need to publish it to npm) with
the components and styles shared by the Adje apps: **MisFinanzas**,
**Adje Store**, **Aulora** and whatever comes next. Web only (React/Next);
the old Flutter version was retired.

## Organization

One component per file, grouped by category in `src/`:

| Folder | Components |
|---|---|
| `src/primitives` | Card, IconChip, Pill, Overline + `overlineCls`, Avatar/AvatarStack + `initials`, Empty, Skeleton, CodeBlock, `tokenize`/`splitLines` (the code highlighter, also for your own code rendering) |
| `src/controls` | Button, IconButton (both also render links with `href`), Segmented, Tabs, Switch, ChoiceOption/ChoiceMark, Toolbar, ScrollArrows, `useScrollEdges` |
| `src/forms` | Field (+ `useFieldInvalid`, `useFieldControlId`, `useFieldLabelId` for your own controls), Input, Textarea, Select, ChipEditor, `useFormErrors` + `rules` (validation); RichTextEditor/RichText (separate entrypoint `adje-shared-ui/rich-text`) |
| `src/overlays` | Modal, Drawer, ConfirmDialog, HelpTip, ToastProvider/useToast, Popover, Menu, `useShortcuts` (+ `formatShortcut`, `useIsMac`) |
| `src/data` | Stat, ProgressBar, Pagination, Table |
| `src/layout` | PageHeader, SectionTitle, Collapsible, Carousel, SideNav + SideNavBrand/SideNavAction/SideNavUser, `sideNavState` + `useSideNavCompact`/`useIsMobile`, OverlayScrollbar, `useTheme` |
| `src/tokens` | `palette(name, shade)`, `paletteHex`, `PALETTE`, `PALETTE_NAMES`, `PALETTE_SHADES` (fixed palette of 15 colors × 10 shades); `Tone` + `TONE_COLOR` (the colour of each meaning) |
| `src/internal` | Private helpers shared by the components, not exported: `useEscape`/`useDismiss` (layer stack), `useMediaQuery`, `useIsoLayoutEffect`, `useLatest`, `ToggleIconButton` |

Charts (recharts) still live in MisFinanzas (`src/components/charts.tsx`):
they depend on recharts and on its euro formatters, and only that app uses them.
If Adje Store ever needs charts, they will move here as an optional module.

`src/index.ts` exports everything **except rich text**: `RichTextEditor`
(WYSIWYG with Tiptap: bold, italic, underline, heading, lists, quote, link),
`RichText` (sanitized viewer with DOMPurify), `sanitizeRichText`,
`richTextToPlain` and `isRichTextEmpty` are imported from `adje-shared-ui/rich-text`.
They are kept apart because they drag in Tiptap and DOMPurify: only the app that
uses them installs them (`npm i @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
@tiptap/pm dompurify`). The editor stores HTML. The historical entry points
(`adje-shared-ui/ui`, `/toast`, `/PageHeader`) keep working as
re-exports but are **deprecated**; import from plain `adje-shared-ui`.

## House rules

- **Concrete sizes.** All inline controls (Button, Input —including the native
  date input—, Select, Segmented) measure `--control-h` (38px; `sm` 32px,
  `lg` 46px, defined in `theme.css`). Button, Input and Select share the
  `size` prop (sm/md/lg) with Segmented: an input and the button next to it
  ALWAYS wear the same size. Never a button taller or shorter than its input.
- **A single size scale.** `Switch`, `ChoiceOption` and `ChoiceMark` share
  `size` (sm/md/lg), just like Button/Input/Select/Segmented:
  `sm` for dense rows and tables, `md` by default, `lg` when the control
  rules the screen.
- **To choose, ONE component: `ChoiceOption`.** The whole row is clickable, not
  the little circle: the native input with `accent-color` neither lets itself be
  sized nor respects the theme.
  - The SHAPE of the mark tells how many you can choose: **round** for one,
    **square** for several. The radio has no center dot — on, it is a filled
    circle with a tick, same as the checkbox: a dot and a tick meant the same
    thing with two different drawings.
  - Chosen = **gradient border + tick**, and the tick appears ONCE: inside the
    mark, or on the right if you go without a mark (`mark={false}`, a card).
  - `tone="positive" | "negative"` + `align="center"` covers the two-option
    toggle with semantic color.
  - `ChoiceMark` is the standalone mark, for your own lists and tables.
- **The Switch is for on/off**, not for choosing. It matches the
  `ChoiceOption` mark in all three sizes, so the two read as relatives in a row.
- **If it does not fit, arrows — never a bar.** `Tabs` and `Segmented` show two
  arrows at the ends when their content overflows the container
  (`ScrollArrows`, reusable in any horizontal row). Scrollbars look
  different on every system and on Mac do not even appear until you touch them.
- **The Popover renders in `<body>`.** It uses a portal and a fixed position
  computed from the trigger, so no container with overflow clips it (scrolling
  tables, cards, sticky panels). If it does not fit below, it opens upward; a
  panel taller than the window scrolls. The Select list and the Toolbar's "···"
  menu are Popovers too.
- **Layers.** Escape and outside clicks go through one layer stack: Escape
  closes only the topmost layer (a Select inside a Modal, a ConfirmDialog over a
  Drawer), and a click inside a layer opened on top of another does not close
  the lower one.
- **Scrollbars: `custom-scrollbar`, and `scroll-no-gutter` beside it when the
  reserved strip is dead space.** The base class keeps `scrollbar-gutter:
  stable` so a page does not jump sideways the moment its content grows past
  the window. A panel that opens already at its final size has nothing to keep
  stable: add `scroll-no-gutter` there (the Select dropdown does) or it draws
  14px of nothing down its right edge.
- **On a phone the Popover is a bottom sheet.** Below `sm` it stops being
  anchored: full width, stuck to the bottom edge, over a scrim. Anchoring needs
  a pointer that can aim and room around the trigger, and a thumb has neither.
  `sheet={false}` keeps it anchored for the panels that must stay glued to
  their trigger (the Select list). The sheet has no grab bar: it cannot be
  dragged. It scrolls with the app's own scrollbar and no reserved gutter.
- **The small uppercase caption is a component.** `Overline` (and `overlineCls`
  for the places that are an input or a button and cannot be wrapped). Never
  write `uppercase tracking-*` by hand, inside AdjeUI either. The recipe is
  12px / 600 / 0.06em: at 11px the system font hints unevenly, and
  `tracking-widest` pulls a word apart into separate letters. `Menu`'s title,
  HelpTip's heading and CodeBlock's language chip use it.
- **The chosen item is marked with a gradient border.** `ChoiceOption`
  uses the `.gradient-border` class from `theme.css` (two background layers, because
  `border-image` does not get along with `border-radius`). The flat accent was
  indistinguishable from the normal border in dark theme.
- **Gradient fills use `.bg-app-gradient`**, never an inline
  `style={{ background: "var(--app-gradient)" }}`.
- **Block code is an ELEMENT, not text formatting.** `CodeBlock`
  (with language, reader toggles for colours and line numbers, and copy
  button) is its own piece; inside rich text only INLINE code remains. Its
  highlighter (`tokenize`/`splitLines`) is dependency-free and returns tokens
  that React renders: no injected HTML.
- **Rich text: three barriers.** `RichTextEditor` does not let dangerous HTML in
  (`transformPastedHTML` sanitizes pasted content BEFORE interpreting it), does not
  let links with odd protocols be created (`isAllowedUri` + `protocols`) and
  emits already sanitized output (once typing pauses, and at once on blur), so
  what gets stored is born clean. `RichText` sanitizes again when rendering.
  And `sanitizeRichText` works WITHOUT a DOM (server), where DOMPurify does not
  exist: instead of returning the HTML as is, it keeps the allowed tags aside
  and escapes everything else. Links open in a new tab on both sides.
- **Menus with separators and shortcuts.** `Menu` items accept
  `{ separator: true }` to group (the usual one before a "Delete") and
  `shortcut: "mod+d"`, which is drawn as a key UNDER the label, not to its
  right: as a second column it competed with the label for the same width and
  the label was the one that lost ("Duplicate les…" beside a pristine
  "Ctrl+Shift+D"). The menu only DRAWS it: what makes it work is
  `useShortcuts(items)`, called where the actions live — so the shortcut works
  with the menu closed, which is the whole point. An item with `keepOpen`
  leaves the menu open after it runs: for toggles (a theme switch) whose new
  state is shown right on the item.
- **Collapsible is a folding panel.** Icon, the title as an `Overline`, an
  optional `summary` line under it, and a chevron that turns over; the content
  folds with an animation. Open, nothing inside is clipped (a Select's list
  opens freely); closed, it cannot be tabbed into.
- **Carousel is a row that stays one row.** Anything goes inside. While there
  is room the items share the width; once they reach `itemWidth` (220 px by
  default) they stop shrinking and the row scrolls sideways — they never wrap
  and never grow back. No scrollbar: it moves with the finger or trackpad,
  by dragging it with the mouse (it stays where you let go, and a drag is not
  a click on what is inside), or with a button in the app's colour on the
  edge that has more, which moves one item along. `bleed` (the page's side
  padding) lets the row run out to the page's edge while it scrolls, so the
  items are cut by the screen and not inside the margin. `fade` also fades
  out the side with more to see (off by default).
- **Tables that scroll sideways.** `Table` draws a hairline on each side that
  has more to show and removes it once you reach that end, so cut-off cells
  read as "there is more", not as a bug. `stickyFirst` pins the first column
  (and moves the left line to its edge, measured again when the rows change); `stickyBg` if the table is not on
  `--card`. The measuring is `useScrollEdges`, shared with `ScrollArrows`.
- **Options with icons.** Every `Select` option is one template, `[icon]
  label [check]`: give any option an `icon` and every row keeps the icon slot,
  so the labels line up, and the closed Select shows the chosen icon too.
  Pick among things that have a drawing (chart kinds…) with it rather than a
  hand-made Popover list.
- **Action zone.** Modal and Drawer have a `footer` prop: the save/cancel
  buttons go there (its own bar, always visible in the Drawer), never loose in
  the content.
- **Validation.** `useFormErrors` + `rules` to validate on the client, and
  `<Field error={errors.x} required>`: it paints the message in red and the
  control border automatically (via context), so it is always clear which field
  fails.
- **Field labels point at their control.** `Field` renders a `<label for>`
  tied to the AdjeUI control inside (Input, Textarea, ChipEditor's input) and
  `aria-labelledby` for the ones that are not labelable (Select, Segmented). It
  never wraps the control in a `<label>`, which would activate the first button
  inside (a chip's remove button). `as="label"` wraps it on purpose, only for a
  single native input; `as="div"` is now the default.
- **Async confirmations.** `ConfirmDialog`'s `onConfirm` may return a promise:
  the button shows a spinner, the dialog closes when it resolves and stays open
  if it throws.
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
  `.app-shell` layout, collapsible to icons only (73px) with the "Collapse" button (remembered
  in localStorage; `topCompact`/`bottomCompact` for the zones,
  `useSideNavCompact()` for your own content);
  below 768px it stays hidden on the left and opens with the hamburger
  that `PageHeader` draws only when a SideNav is mounted (no provider:
  `sideNavState`). It closes on navigation, with Escape or by tapping the backdrop.
  The active item is the most specific `href` that `activePath` is inside, on
  segment boundaries (`/course` is not active on `/courses`; `/` only on `/`).
- **Theme.** `useTheme(key)` is one store for the page: every call sees the same
  theme. Storage failures (private mode) are ignored.
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

## Changelog

### 4.6.2

- `Textarea grow` removed: the growing box belongs to one dialog of an app,
  not to the design system. `Textarea` is back to its resize handle.

### 4.6.1

- `Textarea grow` grows up to half the screen's height (it stopped at
  240 px, with room left in the dialog).

### 4.6.0

- **New:** `Textarea grow`: it gets taller with each line (CSS `field-sizing:
  content`, no script) up to about ten lines, then scrolls with
  `custom-scrollbar`. Without `grow` it keeps the resize handle.
- **Fix:** `Modal`'s backdrop keeps no scrollbar gutter, so on a phone the
  full-screen dialog reaches the right edge (it left a 14 px strip).

### 4.5.1

- **Fix:** a square `Avatar` (and the `+N` chip of a square `AvatarStack`)
  rounds its corner with its size (md 8 px · lg 12 px · xl 16 px…) instead of
  8 px at every size, so a big logo no longer looks like a sharp tile.

### 4.5.0 (no breaking changes)

- **New:** `Avatar` (image or initials on the app gradient or a `color`; sizes
  sm 24 · md 32 · lg 40 · xl 56 px; `shape` circle/square; falls back to the
  initials when the image breaks) and `AvatarStack` (overlapping, `+N` chip);
  `initials()`. `SideNavUser` uses `Avatar`.
- **New:** `Button` and `IconButton` take `href` (+ `target`, `LinkComponent`
  like SideNav) and render a link styled as the button.
- **New exports:** `tokenize`, `splitLines`, `Token`, `TokenType`;
  `Tone`, `TONE_COLOR`; `SegmentedOption`; `useFieldControlId`, `useFieldLabelId`.
- **Generic value controls:** `Segmented<T>`, `Tabs<T>`, `Select<T>` (and
  `SelectOption<T>`, `PageHeader` tabs) take `T extends string = string`, so
  `onChange` receives the caller's union with no cast.
- **Field:** a `<div>` with a `<label for>` pointing at the control (`useId`);
  `as` keeps working (`"label"` wraps a single native input). Clicking a
  Field's label no longer deletes ChipEditor's first chip, picks Segmented's
  first option or toggles a Select. Controls get `aria-describedby` for the error.
- **ConfirmDialog:** `onConfirm: () => void | Promise<unknown>` is awaited with
  a busy button; closes on success, stays open on throw.
- **Layers:** Escape closes only the topmost layer; outside clicks inside a
  layer opened on top do not close the one below (Modal, Drawer, Popover,
  Select, Toolbar menu, SideNav).
- **Select** opens its list in a Popover (portal): no longer clipped by
  `overflow` parents; listeners only while open; `listbox`/`option` roles.
- **Toolbar**'s "···" menu is a Popover + Menu (portal, bottom sheet on phones).
- **Popover:** a panel taller than the window scrolls (`--popover-max-h`),
  repositioning runs once per frame, new `role` prop.
- **Table:** `wrapperClassName` for the scroll box.
- **useTheme:** one shared store (`useSyncExternalStore`), storage in try/catch.
- **SideNav:** active item on segment boundaries; one media-query listener for
  every rail row; `PageHeader` re-renders only when a SideNav mounts/unmounts.
- **Rich text:** strike and horizontal rules are out of the schema (no tool
  makes them); `h4` out of the allow-list; links get `target`/`rel` the same in
  the browser as on the server; `richTextToPlain` decodes entities on the
  server; no stray toolbar divider; output sanitized once typing pauses (and
  on blur/unmount); changing `placeholder`/`variant` no longer rebuilds the editor.
- **Performance:** the toast context no longer re-renders its consumers;
  OverlayScrollbar measures the layout only when it changes, not per scroll
  frame; the highlighter no longer copies the code per token.
- **Fixes:** `type="button"` on Pagination, Modal/Drawer close and toasts
  (they submitted an enclosing form); ScrollArrows' veil matches the surface
  (`--scroll-veil`, `--surface-bg`); CodeBlock line numbers at 70 % muted;
  HelpTip closes on scroll; toasts have `aria-live` and clear their timers.
- **theme.css:** `.text-muted` and `.bg-app-gradient` defined here (apps no
  longer need their own); `--surface-bg`; reduced motion also stops
  `.skeleton` and `.sidenav-backdrop`; removed the dead `.help-pop` and the
  `.sidenav-menu` rule.
- **Deprecated** (still working; removed once no app uses them): Modal `wide`
  → `size="lg"`; `inputCls` → `<Input>`; SideNav `logo`/`logoHref` →
  `top={<SideNavBrand/>}`; SideNav `mobileAction` → a SideNavAction in
  `bottom`; `SideNavButton` → `SideNavAction`; entry points
  `adje-shared-ui/ui`, `/toast`, `/PageHeader` → `adje-shared-ui`; tokens
  `--primary`, `--tertiary` (used by no component).

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
