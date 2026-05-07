# create-just-dom

## 1.3.3

### Patch Changes

- chore: swap theme toggle button icon

## 1.3.2

### Patch Changes

- 54c9bf4: Fix element namespace handling for HTML/SVG/MathML (createElement, DOM factories, applyAttributes); align SVG DOM keys, converter, scaffold DaisyUI themes, and docs
- Starter templates: Tailwind plain scaffold removes fixed gray palette utilities from generated `main` (layout + neutral typography); Daisy scaffold uses semantic Daisy tokens (`bg-base-*`, `text-base-content`, styled `<code>`).
- Daisy scaffold adds `@custom-variant dark` mapped to `[data-theme=dark]` so Tailwind `dark:` utilities align with DaisyUI themes.
- Daisy scaffold adds light/dark theme toggle (moon/sun SVG icons), persists preference under **`jd-theme`** in `localStorage`, syncs **`data-theme`** on `<html>`.
- Refactor generated entry template builder (`buildMainSource`) shared between `.ts` and `.js`.

## 1.2.0

### Minor Changes

- Interactive flow uses **sequential** prompts in order: **language → CSS framework → plugins**, each with the same keynav UI (↑/↓, Space, Enter).
- `npm create vite@latest` is called with **`--no-interactive`** so the scaffold stays non-prompting under the CLI.

## 1.1.0

### Minor Changes

- **Flags** for official plugins (`--plugins`, `--no-plugins`) and CSS stack (`--css`, `--no-css`): Tailwind v4, DaisyUI, or none.
- **Interactive** plugin and CSS selection when running in a TTY (unless `-y` / explicit flags).

## 1.0.1

### Patch Changes

- Republish after corrected upstream semver (`just-dom@2.x`, `@just-dom/router@1.x`); CLI behaviour unchanged.

## 1.0.0

### Major Changes

- ff657f2: Initial release of the `create-just-dom` Vite scaffold CLI (`npm create just-dom`).
