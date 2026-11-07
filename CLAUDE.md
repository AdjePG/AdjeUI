# AdjeUI (adje-shared-ui)

The design system of every Adje app, version 1.0.0. Before changing it, load the skill **adje-code-standards** (`~/.claude/skills/adje-code-standards`), in particular `references/adjeui-authoring.md` (API conventions, internal helpers, styling, release) and keep `references/adjeui-catalogue.md` in sync with what you change.

- Layout: `package.json` stays at the repo root (npm git dependencies need it there) and maps every import into `AdjeUI.LibraryCore/` (the library: `src/`, `theme.css`, `rich-text.ts`, legacy entry points, `tests/`); `AdjeUI.Demo/` is the live demo. Never change a public import path.
- No breaking changes without a major version and a README note; deprecate first (`@deprecated`), remove when no consumer app uses it.
- Check with `npx tsc --noEmit` and `npm test` from the root; the demo (`AdjeUI.Demo/`, `npm run demo`, port 4400) shows every public component and prop.
- Everything in English.
