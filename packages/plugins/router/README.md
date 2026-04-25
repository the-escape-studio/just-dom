# @just-dom/router

Client-side routing for [just-dom](https://github.com/the-escape-studio/just-dom): nested route objects, optional layouts, dynamic segments (`:id`), splat (`*`), and `routerLink` for navigation without full page reloads.

> **Note:** The helper is named `routerLink` so it does not override `DOM.link` (the `<link>` element factory).

## Install

```bash
npm install @just-dom/router just-dom
```

## Usage

Register the plugin once (often in **`jd.config.ts`** — see [App setup](https://just-dom.vercel.app/docs/jd-config)), then define routes in your entry file (e.g. **`main.ts`**). New project: **`npm create just-dom@latest`** ([CLI](https://just-dom.vercel.app/docs/jd-config#start-a-new-project)).

**`jd.config.ts`**

```ts
import DOM, { withPlugins } from "just-dom";
import { createRouterPlugin } from "@just-dom/router";

export const jd = withPlugins(DOM, [createRouterPlugin({ mode: "browser" })]);
```

**`main.ts`**

```ts
import { createRoot } from "just-dom";
import { defineRoutes } from "@just-dom/router";
import { jd } from "./jd.config";

const routes = defineRoutes([
  {
    layout: ({ outlet }) =>
      jd.div({ className: "layout" }, [
        jd.nav({}, [
          jd.routerLink(
            ({ isExact }) => ({
              href: "/",
              className: isExact ? "active" : "",
              "aria-current": isExact ? "page" : undefined,
            }),
            ["Home"],
          ),
          jd.routerLink(
            ({ isExact }) => ({
              href: "/users/1",
              className: isExact ? "active" : "",
              "aria-current": isExact ? "page" : undefined,
            }),
            ["User 1"],
          ),
        ]),
        outlet,
      ]),
    children: [
      { index: true, element: () => jd.h1({}, ["Home"]) },
      { path: "users/:id", element: ({ params }) => jd.h1({}, [params.id]) },
      { path: "*", element: () => jd.h1({}, ["Not found"]) },
    ],
  },
]);

createRoot("app", jd.div({ className: "app" }, [jd.router(routes)]));
```

### Modes

- **`browser`** (default): uses `history.pushState` / `popstate` on the real URL path.
- **`hash`**: stores the app path in `location.hash` (e.g. `#/users/1`) — handy for static hosting without server fallbacks.

Configure with `createRouterPlugin({ mode: "hash" })`.

### Active links

`routerLink` accepts either a props object or a props function. The function receives the current match state:

```ts
jd.routerLink(
  ({ isActive, isExact }) => ({
    href: "/users",
    className: isActive ? "active" : "",
    style: { fontWeight: isExact ? "700" : "400" },
    "aria-current": isExact ? "page" : undefined,
  }),
  ["Users"],
);
```

`isExact` means the current path exactly equals the link target. `isActive` is also true for nested paths, so `/users` is active on `/users/1`.

### Imperative navigation

```ts
import { navigate } from "@just-dom/router";

navigate("/users/2", { mode: "browser" });
```

## API

| Export | Description |
|--------|-------------|
| `createRouterPlugin(options?)` | Returns a `JDPlugin` adding `router` and `routerLink`. |
| `routerPlugin` | Default plugin instance (`mode: "browser"`). |
| `defineRoutes(routes)` | Typed helper for route trees. |
| `navigate(to, options?)` | Programmatic navigation. |
| `matchRouteTree` | Low-level matcher (for tests / advanced use). |

## License

Same as the parent monorepo.
