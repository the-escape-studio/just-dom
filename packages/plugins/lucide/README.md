# @just-dom/lucide

Lucide icons as a [just-dom](https://github.com/the-escape-studio/just-dom) plugin: typed `icon` helpers on your DOM object.

- **Documentation:** [Lucide plugin](https://just-dom.vercel.app/docs/official-plugins/lucide)
- **npm:** `@just-dom/lucide`
- **Peer dependency:** `just-dom`

## Install

```bash
npm install @just-dom/lucide just-dom
```

## Example

```ts
import DOM, { withPlugins } from "just-dom";
import { createLucidePlugin } from "@just-dom/lucide";
import { House, Search } from "lucide";

const jd = withPlugins(DOM, [
  createLucidePlugin({ icons: { House, Search } }),
]);

jd.icon("House", { size: 24 });
```

See the docs for `lucidePlugin` (all icons) vs `createLucidePlugin` (tree-shake friendly).
