# just-dom site

Next.js + [Fumadocs](https://fumadocs.dev) app: documentation, API reference, and the playground. Source of truth for end-user copy lives here, not in package READMEs.

- **Local dev** (from repo root): `pnpm dev` (Turborepo) or from this app: `pnpm dev`
- **Production:** [just-dom.vercel.app](https://just-dom.vercel.app)

The site consumes workspace packages `just-dom`, `@just-dom/lucide`, `@just-dom/router`, and `@workspace/ui` for examples and the playground. Playground code lives under `src/views/playground/`.

End-user guides cover **[App setup (jd.config)](https://just-dom.vercel.app/docs/jd-config)** and the **`create-just-dom`** scaffold (`npm create just-dom@latest`); the CLI package lives at `packages/create-just-dom` in this monorepo.

### Playground types

Editor globals are **generated** from `packages/just-dom/dist/index.d.ts` (no hand-written duplicate). After changing the public `just-dom` API, from `apps/site` run `pnpm run generate:playground-types` (or `pnpm run build` / `pnpm run dev`, which run it first). The output is `src/views/playground/playground-globals.generated.ts` (commit it). The Lucide plugin uses a small fixed icon set; see `playground-lucide-ambient.ts` and `PLAYGROUND_LUCIDE_ICONS` in `PlaygroundView.tsx` if you add more icons to the preview.
