# just-dom

A small library for building the real DOM with typed tag factories, refs, fragments, and a **plugin** system. Ships as **ESM** and **CJS** with TypeScript declarations.

- **Documentation:** [just-dom.vercel.app](https://just-dom.vercel.app)
- **npm:** [`just-dom`](https://www.npmjs.com/package/just-dom)

## Install

```bash
npm install just-dom
```

## Quick example

```ts
import DOM, { createRoot } from "just-dom";

const app = DOM.div({ className: "app" }, [
  DOM.h1({}, ["Hello, Just DOM"]),
  DOM.p({}, ["Mount below, then edit this tree."]),
]);

createRoot("app", app);
```

`createRoot` accepts a container **id** (`"app"`) or an `HTMLElement`, and **appends** your root element (see [createRoot](https://just-dom.vercel.app/docs/core-api/create-root)).

## Plugins and `jd.config`

Use [`withPlugins`](https://just-dom.vercel.app/docs/plugin-api/with-plugins) to attach official or custom plugins. In apps, the usual pattern is a single module (**[`jd.config.ts`](https://just-dom.vercel.app/docs/jd-config)**) that exports `jd` for the whole project.

## New project (Vite)

```bash
npm create just-dom@latest my-app
```

The CLI scaffolds **`jd.config`**, optional **`@just-dom/*` plugins**, and optional **Tailwind / DaisyUI**. See [`create-just-dom`](https://www.npmjs.com/package/create-just-dom) on npm and the [App setup / CLI](https://just-dom.vercel.app/docs/jd-config#start-a-new-project) docs.

## Official plugins

Published under **`@just-dom/*`** (e.g. [`@just-dom/lucide`](https://just-dom.vercel.app/docs/official-plugins/lucide), [`@just-dom/router`](https://just-dom.vercel.app/docs/official-plugins/router)). List and authoring notes live in the monorepo [`packages/plugins/README.md`](https://github.com/the-escape-studio/just-dom/blob/main/packages/plugins/README.md).
