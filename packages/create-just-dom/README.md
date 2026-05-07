# create-just-dom

Scaffold a **[Vite](https://vite.dev)** app with **[just-dom](https://just-dom.vercel.app)**, a ready-made **`jd.config`** (`jd.config.ts` or `jd.config.js`), and your choice of **official plugins** and **CSS stack** (plain CSS, **Tailwind CSS v4**, or **Tailwind + DaisyUI**).

Full documentation: **[App setup → Start a new project](https://just-dom.vercel.app/docs/jd-config#start-a-new-project)** and **[Installation](https://just-dom.vercel.app/docs/installation#new-vite-project-cli)**.

## Usage

```bash
npm create just-dom@latest
npm create just-dom@latest my-app
npm create just-dom@latest .   # scaffold into the current directory (must be empty)
```

**Interactive** (default in a TTY): three **separate** keyboard-driven screens, in order: **Language** (TypeScript vs JavaScript) → **CSS framework** (none, Tailwind v4, or Tailwind + DaisyUI) → **Plugins** (multi-select, all optional). Use **↑/↓** to move, **Space** to toggle or pick, **Enter** to confirm.

**Non-interactive** (CI or scripts): use **`--yes`** or pass explicit flags:

| Flag | Effect |
|------|--------|
| `--ts`, `--typescript` | Vite `vanilla-ts` |
| `--js`, `--javascript` | Vite `vanilla` (`.js` files) |
| `--plugins=<list>` | Comma-separated plugins: `router`, `signals`, `lucide` |
| `--no-plugins` | Install `just-dom` only (no `@just-dom/*` plugins) |
| `--css=<option>` | `none` \| `tailwind` \| `tailwind-daisyui` |
| `--no-css` | Same as `--css=none` |
| `--pnpm` | Use `pnpm add` in the new folder |
| `-y`, `--yes` | Skip prompts (defaults: **TypeScript**, **no plugins**, **no CSS framework**) |
| `-h`, `--help` | Help |

```bash
npm create just-dom@latest my-app -- --yes
npm create just-dom@latest my-app -- --js --no-plugins --no-css
npm create just-dom@latest my-app -- --ts --plugins=router,lucide --css=tailwind --pnpm
```

Then:

```bash
cd my-app
npm install   # if Vite did not install deps yet
npm run dev
```

With **`--css=tailwind`**, the CLI adds **`tailwindcss`**, **`@tailwindcss/vite`**, wires **`vite.config`**, and generates **`style.css`** with `@import "tailwindcss"`. With **`--css=tailwind-daisyui`**, it also installs DaisyUI, enables **`light`** / **`dark`** themes via `@plugin "daisyui/index.js"`, adds **`@custom-variant dark`** so Tailwind’s **`dark:`** prefix tracks **`data-theme="dark"`** on `<html>`, and scaffolds a **theme toggle** (persisted under **`jd-theme`** in **`localStorage`**).

If **stdin is not a TTY** and you omit flags, defaults are **TypeScript**, **no plugins**, and **no CSS framework**.

## Monorepo development

From the `just-dom` repository root:

```bash
pnpm create:app ../path/to/my-app
```

From any directory (including an empty folder under `examples/…`), `pnpm create:app` uses your **current shell directory** for `.` and for relative names—thanks to `INIT_CWD`—not only the repo root.

## License

Same as the parent monorepo.
