# `packages/plugins`

Official [just-dom](https://github.com/the-escape-studio/just-dom) packages published under the [`@just-dom`](https://www.npmjs.com/org/just-dom) scope. Each subfolder is an npm package (e.g. `lucide` → `@just-dom/lucide` on npm).

## In this directory

| Folder  | Package        | Description        |
| ------- | -------------- | ----------------- |
| `lucide` | `@just-dom/lucide` | [Lucide](https://lucide.dev) icons as a `just-dom` plugin |

## Authoring a plugin

- Ship as `@just-dom/<name>`; list `just-dom` as a **peer dependency**.
- User-facing documentation lives on the [docs site](https://just-dom.vercel.app) (Fumadocs), not in long READMEs here.
- Releasing: root [Changesets](https://github.com/changesets/changesets) flow (`pnpm changeset` from the monorepo root).
