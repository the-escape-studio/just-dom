# `packages/plugins`

Official [just-dom](https://github.com/the-escape-studio/just-dom) packages published under the [`@just-dom`](https://www.npmjs.com/org/just-dom) scope. Each subfolder is an npm package.

## In this directory

| Folder   | Package             | Description |
| -------- | ------------------- | ----------- |
| `lucide` | `@just-dom/lucide`  | [Lucide](https://lucide.dev) icons as a `just-dom` plugin |
| `router` | `@just-dom/router` | Client-side routing (`router`, `routerLink`) |

## App setup

End users typically:

1. Register plugins once in **[`jd.config.ts`](https://just-dom.vercel.app/docs/jd-config)** (single `withPlugins` + `export const jd`).
2. Import `jd` from that module in **`main.ts`** and in UI modules.

Scaffold a **Vite + TypeScript** starter (includes `jd.config.ts` and optional `@just-dom/router` when published):

```bash
npm create just-dom@latest my-app
# optional: --js --no-router --pnpm --yes  (see docs)
```

From the monorepo root: `pnpm create:app ../path/to/my-app`.

## Authoring a plugin

- Ship as `@just-dom/<name>`; list `just-dom` as a **peer dependency**.
- User-facing documentation lives on the [docs site](https://just-dom.vercel.app) (Fumadocs); package **README** files stay short and point to the site.
- Releasing: root [Changesets](https://github.com/changesets/changesets) flow (`pnpm changeset` from the monorepo root).
