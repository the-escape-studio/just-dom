# create-just-dom

Scaffold a **[Vite](https://vite.dev)** app with **[just-dom](https://just-dom.vercel.app)**, a ready-made **`jd.config`** (`jd.config.ts` or `jd.config.js`), and an optional starter for **`@just-dom/router`**.

Full documentation: **[App setup → Start a new project](https://just-dom.vercel.app/docs/jd-config#start-a-new-project)** and **[Installation](https://just-dom.vercel.app/docs/installation#new-vite-project-cli)**.

## Usage

```bash
npm create just-dom@latest
npm create just-dom@latest my-app
```

**Interactive** (default in a TTY): you choose **TypeScript vs JavaScript** and **with / without `@just-dom/router`**.

**Non-interactive** (CI or scripts): use **`--yes`** or pass explicit flags:

| Flag | Effect |
|------|--------|
| `--ts`, `--typescript` | Vite `vanilla-ts` |
| `--js`, `--javascript` | Vite `vanilla` (`.js` files) |
| `--router` | Install `just-dom` + `@just-dom/router` + route starter |
| `--no-router` | Install `just-dom` only |
| `--pnpm` | Use `pnpm add` in the new folder |
| `-y`, `--yes` | Skip prompts (defaults: TS + try router) |
| `-h`, `--help` | Help |

```bash
npm create just-dom@latest my-app -- --yes
npm create just-dom@latest my-app -- --js --no-router
npm create just-dom@latest my-app -- --ts --router --pnpm
```

Then:

```bash
cd my-app
npm install   # if Vite did not install deps yet
npm run dev
```

If **`@just-dom/router` is not on npm** yet, the CLI installs **`just-dom` only** and generates a no-router starter (even if you asked for `--router`).

## Monorepo development

From the `just-dom` repository root:

```bash
pnpm create:app ../path/to/my-app
```

## License

Same as the parent monorepo.
