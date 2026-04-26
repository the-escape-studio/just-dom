# create-just-dom

Scaffold a **[Vite](https://vite.dev)** app with **[just-dom](https://just-dom.vercel.app)**, a ready-made **`jd.config`** (`jd.config.ts` or `jd.config.js`), and your choice of **official plugins** and **CSS stack** (plain CSS, **Tailwind CSS v4**, or **Tailwind + DaisyUI**).

Full documentation: **[App setup → Start a new project](https://just-dom.vercel.app/docs/jd-config#start-a-new-project)** and **[Installation](https://just-dom.vercel.app/docs/installation#new-vite-project-cli)**.

## Usage

```bash
npm create just-dom@latest
npm create just-dom@latest my-app
```

**Interactive** (default in a TTY): you choose **TypeScript vs JavaScript**, then a **multi-select** for plugins and a **CSS framework** (radio: none, Tailwind v4, or Tailwind + DaisyUI).

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

With **`--css=tailwind`** or **`tailwind-daisyui`**, the CLI adds **`tailwindcss`**, **`@tailwindcss/vite`**, wires **`vite.config`**, and generates a starter **`style.css`** using Tailwind v4 (`@import "tailwindcss"`). DaisyUI adds the `@plugin "daisyui/index.js"` line.

If **stdin is not a TTY** and you did not pass plugin/CSS flags, selections fall back to **no plugins** and **no CSS framework**.

## Monorepo development

From the `just-dom` repository root:

```bash
pnpm create:app ../path/to/my-app
```

## License

Same as the parent monorepo.
