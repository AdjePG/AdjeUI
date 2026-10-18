# AdjeUI (adje-shared-ui)

The design system of every Adje app. Before changing it, load the skill **adje-code-standards** (`~/.claude/skills/adje-code-standards`), in particular `references/adjeui-authoring.md` (API conventions, internal helpers, styling, release) and keep `references/adjeui-catalogue.md` in sync with what you change.

- No breaking changes without a major version and a README note; deprecate first (`@deprecated`), remove when no consumer app uses it.
- Check with `npx tsc --noEmit`; the demo (`demo/`, port 4400) shows every public component and prop.
- Everything in English.
