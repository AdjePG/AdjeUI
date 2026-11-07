# AdjeUI.LibraryCore

The library itself: everything the apps install from `adje-shared-ui`. The
package's `package.json` stays at the repo root (npm git dependencies read it
there) and points into this folder; its `files` installs only this folder.

| Import | File |
|---|---|
| `adje-shared-ui` | `src/index.ts` (the barrel) |
| `adje-shared-ui/rich-text` | `rich-text.ts` (Tiptap + DOMPurify, kept out of the barrel) |
| `adje-shared-ui/theme.css` | `theme.css` (tokens and classes) |
| `adje-shared-ui/ui`, `/toast`, `/PageHeader` | `ui.tsx`, `toast.tsx`, `PageHeader.tsx` (deprecated aliases) |

- `src/<category>/` holds one component per file; `src/internal/` the private helpers.
- `tests/` runs with `npm test` from the repo root (Node's own runner).

Components, house rules and the changelog: the root [README](../README.md).
