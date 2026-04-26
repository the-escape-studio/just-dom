# create-just-dom

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
