# just-dom

A small library for DOM building and light manipulation. ESM and CJS, with TypeScript types.

- **Full documentation:** [just-dom.vercel.app](https://just-dom.vercel.app)
- **npm:** `just-dom`

## Install

```bash
npm install just-dom
```

## Example

```ts
import DOM, { createRoot } from "just-dom";

const $ = createRoot(DOM, document.getElementById("app")!);
$.div({ class: "greeting" }, "Hello");
```

## Plugins

Official plugins (for example Lucide icons) are published under the `@just-dom` scope, e.g. `@just-dom/lucide`. See the docs site for setup.
