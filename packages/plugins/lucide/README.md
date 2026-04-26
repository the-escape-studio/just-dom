# @just-dom/lucide

Lucide icons as a [just-dom](https://github.com/the-escape-studio/just-dom) plugin: typed `lucide` helper on your configured DOM object.

- **Documentation:** [Lucide plugin](https://just-dom.vercel.app/docs/official-plugins/lucide)
- **npm:** `@just-dom/lucide`
- **Peer dependency:** `just-dom`

## Install

```bash
npm install @just-dom/lucide just-dom
```

## Example (inline `withPlugins`)

```ts
import DOM, { withPlugins } from "just-dom";
import { createLucidePlugin } from "@just-dom/lucide";
import { House, Search } from "lucide";

const jd = withPlugins(DOM, [
  createLucidePlugin({ icons: { House, Search } }),
]);

jd.lucide("House", { size: 24 });
```

## Recommended: `jd.config.ts`

Register Lucide next to other plugins in one module and import **`jd`** everywhere else:

- **[App setup (jd.config)](https://just-dom.vercel.app/docs/jd-config)**
- New app: **`npm create just-dom@latest`** ([CLI](https://just-dom.vercel.app/docs/jd-config#start-a-new-project))

See the site docs for **`lucidePlugin`** (all icons) vs **`createLucidePlugin`** (tree-shake friendly).
