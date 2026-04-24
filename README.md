# just-dom

Monorepo for **just-dom** and official plugins. Documentation, guides, and the playground live in the **site** app.

- **Docs:** [just-dom.vercel.app](https://just-dom.vercel.app)
- **Repository:** [github.com/the-escape-studio/just-dom](https://github.com/the-escape-studio/just-dom)

## Workspace layout

| Path | Description |
|------|-------------|
| `packages/just-dom` | Core library (`just-dom` on npm) |
| `packages/plugins` | Official [`@just-dom/*` packages](packages/plugins/README.md) (one folder per plugin) |
| `apps/site` | Documentation site and playground (Fumadocs + Next.js) |
| `packages/ui` | Internal UI for the site |
| `packages/eslint-config` / `packages/typescript-config` | Shared workspace tooling |

## Development

```bash
pnpm install
pnpm dev
```

Releases and versioning use [Changesets](https://github.com/changesets/changesets) (`pnpm changeset` from the root).

- **`pnpm release`** (used by the release workflow before `changeset publish`) builds the publishable packages, then **regenerates** [playground types](apps/site/README.md#playground-types) from `just-dom`’s `dist`, so the committed file matches the API about to ship.
- If you only change the core API, sync the playground by hand: `pnpm run sync:playground-types` (or rely on the check below).
- **PRs** run `pnpm run check:playground-types` — the job fails if `playground-globals.generated.ts` is out of date; commit the regenerated file or run the sync command.

## License

See each package for license (if any).
