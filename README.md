# just-dom

Monorepo for **just-dom** and official plugins. Documentation, guides, and the playground live in the **site** app.

- **Docs:** [just-dom.vercel.app](https://just-dom.vercel.app)
- **Repository:** [github.com/the-escape-studio/just-dom](https://github.com/the-escape-studio/just-dom)

## Workspace layout

| Path | Description |
|------|-------------|
| `packages/just-dom` | Core library (`just-dom` on npm) |
| `packages/plugins` | Official [`@just-dom/*` packages](packages/plugins/README.md) (one folder per plugin) |
| `packages/create-just-dom` | [`create-just-dom`](https://www.npmjs.com/package/create-just-dom) — Vite scaffold with `jd.config`, optional plugins (`router`, `signals`, `lucide`), optional Tailwind v4 / DaisyUI (`npm create just-dom`); locally: `pnpm create:app` |
| `apps/site` | Documentation site and playground (Fumadocs + Next.js) |
| `packages/ui` | Internal UI for the site |
| `packages/eslint-config` / `packages/typescript-config` | Shared workspace tooling |
| `skills/` | Agent Skills — `npx skills add the-escape-studio/just-dom` (vedi [skills/README.md](skills/README.md)) |

## Development

```bash
pnpm install
pnpm dev
```

Scaffold a Vite app (with `jd.config`, optional plugins and CSS stack, TS or JS — TTY prompts: language, then CSS, then plugins, or use flags) from this repo:

```bash
pnpm create:app ../path/to/my-app
# same as: node ./packages/create-just-dom/bin/create-just-dom.mjs ../path/to/my-app
```

Releases and versioning use [Changesets](https://github.com/changesets/changesets) (`pnpm changeset` from the root).

- **`pnpm release`** (used by the release workflow before `changeset publish`) builds the publishable packages, then **regenerates** [playground types](apps/site/README.md#playground-types) from `just-dom`’s `dist`, so the committed file matches the API about to ship.
- **Publishing to npm:** merge the versioned commits to **`main`** and let [`.github/workflows/release.yml`](.github/workflows/release.yml) publish via OIDC (no OTP). For a **local** publish with an npm account that has 2FA, pass a one-time password, e.g. `NPM_CONFIG_OTP=123456 pnpm release` (or `pnpm exec changeset publish --otp 123456`).
- **Wrong semver on npm (e.g. mistaken major):** within npm’s unpublish window you can remove a version, e.g. `npm unpublish just-dom@3.0.0` and `npm unpublish @just-dom/lucide@2.0.0`. If unpublish is not allowed, publish the corrected versions from this repo (`pnpm release`) — `latest` moves to the version you just published — then deprecate the bad tarballs, e.g. `npm deprecate just-dom@3.0.0 "wrong semver; use 2.0.2"` and `npm deprecate @just-dom/lucide@2.0.0 "wrong semver; use 1.0.2"`.
- If you only change the core API, sync the playground by hand: `pnpm run sync:playground-types` (or rely on the check below).
- **PRs** run `pnpm run check:playground-types` — the job fails if `playground-globals.generated.ts` is out of date; commit the regenerated file or run the sync command.

## License

See each package for license (if any).
