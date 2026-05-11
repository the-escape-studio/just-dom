---
name: just-dom
description: Guides use of the just-dom DOM library, create-just-dom Vite scaffold CLI, jd.config + withPlugins, and @just-dom/* official plugins. Prefer in-repo MDX under apps/site/src/content/docs when editing or answering from this repository. Use when implementing or explaining just-dom, jd.config, npm create just-dom, DOM tag factories, createRoot, definePlugin/withPlugins, router/signals/lucide plugins, or monorepo paths under packages/just-dom and packages/plugins.
---

# just-dom (libreria, CLI, plugin)

## Riferimenti rapidi

- **Documentazione nel repo (fonte per il sito):** `apps/site/src/content/docs/` — pagine **MDX** (Fumadocs). Ordine e indice: `meta.json` nella stessa cartella; sottocartelle **`core-api/`**, **`plugin-api/`**, **`official-plugins/`** (es. `router.mdx`, `signals.mdx`, `lucide.mdx`). Per argomenti generali: `index.mdx`, `installation.mdx`, `getting-started.mdx`, `jd-config.mdx`, `typescript.mdx`, `create-a-plugin.mdx`.
- **Docs pubbliche (stesso contenuto deployato):** [just-dom.vercel.app](https://just-dom.vercel.app)
- **Repo:** [github.com/the-escape-studio/just-dom](https://github.com/the-escape-studio/just-dom)
- **Monorepo:** `packages/just-dom` (npm `just-dom`), `packages/create-just-dom`, `packages/plugins/*`, app docs in `apps/site`

## Uso dell'agente

Quando lavori **in questo repository**, leggere/aggiornare la doc in **`apps/site/src/content/docs/`** prima di inventare API o URL; il sito è generato da quei file.

## Libreria core

- **ESM/CJS** con tipi TypeScript.
- **Import tipico:** `import DOM, { createRoot, createRef, createElement, createFragment, withPlugins, definePlugin } from "just-dom"`.
- **Fabbriche tag:** `DOM.div(...)`, `DOM.span(...)`, ecc.; supporto **HTML**, **SVG** (alcuni tag espongono chiavi DOM diverse, vedi export `svgTagToDomKey`), **MathML** (`fragment` per liste di figli).
- **`createRoot(containerId | HTMLElement, rootElement)`:** monta aggiungendo il root al container (vedi docs `create-root`).
- **Plugin runtime:** `withPlugins(domBase, plugins)` unisce le estensioni restituite da `plugin.extend()` sull'istanza DOM; **`definePlugin`** per definire un plugin tipizzato (`name`, `extend` → oggetto di metodi).

Pattern consigliato nelle app: un solo modulo **`jd.config.ts` / `jd.config.js`** che esporta `jd = withPlugins(DOM, [...])` e importare **`jd`** da lì in `main` e nei moduli UI.

## CLI `create-just-dom`

```bash
npm create just-dom@latest [my-app|.|path]
```

- **Interattivo (TTY):** tre schermate in ordine — **Linguaggio** (TS/JS) → **CSS** (nessuno, Tailwind v4, Tailwind+DaisyUI) → **Plugin** (multi-select, tutti opzionali). Navigazione **↑/↓**, **Space**, **Enter**.
- **Non interattivo:** `--yes` / `-y` oppure flag espliciti.

| Flag | Effetto |
|------|--------|
| `--ts` / `--typescript` | template Vite `vanilla-ts` |
| `--js` / `--javascript` | template `vanilla` (.js) |
| `--plugins=<list>` | `router`, `signals`, `lucide` (comma-separated) |
| `--no-plugins` | solo `just-dom` |
| `--css=none` \| `tailwind` \| `tailwind-daisyui` | stack CSS |
| `--no-css` | come `--css=none` |
| `--pnpm` | `pnpm add` nel progetto nuovo |
| `-y` / `--yes` | salta prompt (default: **TS**, nessun plugin, nessun CSS) |

Se **stdin non è TTY** e mancano flag: default **TypeScript**, nessun plugin, nessun framework CSS.

**Nel monorepo:** dalla root `pnpm create:app ../percorso/app` (equivale allo script che invoca `packages/create-just-dom`).

## Plugin ufficiali (`@just-dom/*`)

| Cartella `packages/plugins` | Package | Ruolo |
|----------------------------|---------|--------|
| `router` | `@just-dom/router` | routing client (`router`, `routerLink`, ecc.) |
| `signals` | `@just-dom/signals` | reattività / signals |
| `lucide` | `@just-dom/lucide` | icone Lucide come plugin |

- Installazione tipica tramite scaffold o `pnpm`/`npm`; registrazione in **`jd.config`** con `withPlugins`.
- **Autore di plugin:** pubblicare come `@just-dom/<nome>` (o scope coerente col progetto), **`just-dom` come peerDependency**; README del package breve, dettaglio in **`apps/site/src/content/docs/`** (Fumadocs). Release del monorepo: **Changesets** (`pnpm changeset` dalla root).

## Quando si lavora in questo repo

- Dopo cambi all'API core del pacchetto pubblicato: rigenerare tipi playground con `pnpm run sync:playground-types`; in CI vale `pnpm run check:playground-types` su `playground-globals.generated.ts`.
- Prima release/publish: vedere `README.md` root per flusso `pnpm release`, playground types, OIDC.

## Cosa evitare

- Non confondere **`apps/site/cli.json`**: è schema **Fumadocs CLI** per il sito docs, **non** la CLI `create-just-dom`.
- Nei plugin, non duplicare documentazione lunga nei README se esiste già la pagina in **`apps/site/src/content/docs/`** (e sul sito) — mantenere README corto e link alla doc.
