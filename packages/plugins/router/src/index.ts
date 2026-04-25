import {
  definePlugin,
  type JDCreateElementChildren,
  type JDCreateElementOptions,
} from "just-dom";
import { matchRouteTree, pathnameToSegments } from "./match";
import { parsePathFromTo } from "./parse-path";
import type {
  NavigateOptions,
  RouteDefinition,
  RouteMatchContext,
  RouterLinkProps,
  RouterLinkPropsInput,
  RouterLinkRenderContext,
  RouterMode,
  RouterMountOptions,
  RouterPluginDefaults,
} from "./types";

export type {
  NavigateOptions,
  RouteDefinition,
  RouteMatchContext,
  RouteElementRenderer,
  RouteLayoutRenderer,
  RouterLinkProps,
  RouterLinkPropsInput,
  RouterLinkRenderContext,
  RouterMode,
  RouterMountOptions,
  RouterPluginDefaults,
} from "./types";

export { matchRouteTree, consumeRoute, pathnameToSegments } from "./match";
export type { ConsumeRouteResult, PatternParts } from "./match";

const listeners = new Set<() => void>();
const windowListenerCounts = new Map<Window, number>();

function flush(): void {
  for (const fn of listeners) {
    fn();
  }
}

function subscribeWindow(win: Window, listener: () => void): () => void {
  listeners.add(listener);
  const next = (windowListenerCounts.get(win) ?? 0) + 1;
  windowListenerCounts.set(win, next);
  if (next === 1) {
    win.addEventListener("popstate", flush);
    win.addEventListener("hashchange", flush);
  }
  return () => {
    listeners.delete(listener);
    const count = windowListenerCounts.get(win) ?? 1;
    if (count <= 1) {
      windowListenerCounts.delete(win);
      win.removeEventListener("popstate", flush);
      win.removeEventListener("hashchange", flush);
    } else {
      windowListenerCounts.set(win, count - 1);
    }
  };
}

function normalizeBasename(basename: string): string {
  if (!basename || basename === "/") {
    return "";
  }
  const withSlash = basename.startsWith("/") ? basename : `/${basename}`;
  return withSlash.endsWith("/") ? withSlash.slice(0, -1) : withSlash;
}

function stripBasename(pathname: string, basename: string): string {
  const b = normalizeBasename(basename);
  if (!b) {
    return pathname || "/";
  }
  if (pathname === b) {
    return "/";
  }
  if (pathname.startsWith(`${b}/`)) {
    const rest = pathname.slice(b.length);
    return rest.startsWith("/") ? rest : `/${rest}`;
  }
  return pathname || "/";
}

function applyBasename(path: string, basename: string): string {
  const b = normalizeBasename(basename);
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!b) {
    return p;
  }
  if (p === "/") {
    return b;
  }
  return `${b}${p}`;
}

function readHashPathname(win: Window): string {
  const raw = win.location.hash.replace(/^#/, "");
  if (!raw) {
    return "/";
  }
  const [pathPart] = raw.split("?");
  if (!pathPart) {
    return "/";
  }
  return pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
}

function readHashSearch(win: Window): string {
  const raw = win.location.hash.replace(/^#/, "");
  const q = raw.indexOf("?");
  if (q === -1) {
    return "";
  }
  return raw.slice(q + 1);
}

function getPathnameForMode(
  mode: RouterMode,
  basename: string,
  win: Window,
): string {
  if (mode === "hash") {
    return stripBasename(readHashPathname(win), basename);
  }
  return stripBasename(win.location.pathname, basename);
}

function getSearchForMode(mode: RouterMode, win: Window): string {
  if (mode === "hash") {
    return readHashSearch(win);
  }
  return win.location.search.replace(/^\?/, "");
}

function normalizeComparePath(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function getLinkPathnameForMode(
  href: string,
  mode: RouterMode,
  basename: string,
  win: Window,
): string | null {
  try {
    if (mode === "hash" && href.startsWith("#")) {
      return stripBasename(parsePathFromTo(href).pathname, basename);
    }
    const resolved = new URL(href, win.location.href);
    if (mode === "hash") {
      const hashPath = resolved.hash
        ? parsePathFromTo(resolved.hash).pathname
        : resolved.pathname;
      return stripBasename(hashPath, basename);
    }
    return stripBasename(resolved.pathname, basename);
  } catch {
    return null;
  }
}

function routeIsExact(currentPathname: string, targetPathname: string): boolean {
  const current = normalizeComparePath(currentPathname);
  const target = normalizeComparePath(targetPathname);
  return current === target;
}

function routeIsActive(
  currentPathname: string,
  targetPathname: string,
): boolean {
  const current = normalizeComparePath(currentPathname);
  const target = normalizeComparePath(targetPathname);

  if (routeIsExact(current, target)) {
    return true;
  }
  if (target === "/") {
    return false;
  }
  return current.startsWith(`${target}/`);
}

function composeMatched(
  chain: readonly RouteDefinition[],
  ctx: RouteMatchContext,
): HTMLElement | SVGElement {
  const leaf = chain[chain.length - 1];
  if (!leaf?.element) {
    throw new Error("[@just-dom/router] Matched route chain has no element renderer.");
  }
  let node: HTMLElement | SVGElement = leaf.element(ctx);
  for (let i = chain.length - 2; i >= 0; i--) {
    const r = chain[i]!;
    if (r.layout) {
      node = r.layout({ ...ctx, outlet: node });
    }
  }
  return node;
}

function shouldHandleLinkClick(
  e: MouseEvent,
  anchor: HTMLAnchorElement,
): boolean {
  if (e.defaultPrevented || e.button !== 0) {
    return false;
  }
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
    return false;
  }
  const target = anchor.getAttribute("target");
  if (target && target !== "" && target.toLowerCase() !== "_self") {
    return false;
  }
  return true;
}

function applyAnchorOptions(
  anchor: HTMLAnchorElement,
  options: JDCreateElementOptions<"a">,
): void {
  for (const [key, value] of Object.entries(options)) {
    if (value === null || value === undefined) {
      anchor.removeAttribute(key);
      continue;
    }

    if (key === "ref" && typeof value === "object" && "current" in value) {
      (value as { current: HTMLAnchorElement | null }).current = anchor;
      continue;
    }

    if (key === "style" && typeof value === "object") {
      Object.assign(anchor.style, value);
      continue;
    }

    if (key.startsWith("on") && typeof value === "function") {
      anchor.addEventListener(
        key.slice(2).toLowerCase(),
        value as EventListener,
      );
      continue;
    }

    if (key.startsWith("data-")) {
      anchor.setAttribute(key, String(value));
      continue;
    }

    if (typeof value === "boolean") {
      if (value) {
        anchor.setAttribute(key, "");
      } else {
        anchor.removeAttribute(key);
      }
      continue;
    }

    if (key in anchor) {
      (anchor as unknown as Record<string, unknown>)[key] = value;
    } else {
      anchor.setAttribute(key, String(value));
    }
  }
}

function appendAnchorChildren(
  anchor: HTMLAnchorElement,
  children?: JDCreateElementChildren,
): void {
  if (!children) {
    return;
  }

  const doc = anchor.ownerDocument;
  if (Array.isArray(children)) {
    for (const child of children) {
      if (child === null || child === undefined) {
        continue;
      }
      anchor.appendChild(
        typeof child === "string" ? doc.createTextNode(child) : child,
      );
    }
    return;
  }

  anchor.appendChild(doc.createTextNode(children));
}

function getRouterLinkState(
  href: string,
  mode: RouterMode,
  basename: string,
  win: Window,
): RouterLinkRenderContext {
  const pathname = getPathnameForMode(mode, basename, win);
  const targetPathname = getLinkPathnameForMode(href, mode, basename, win);
  const isExact =
    targetPathname !== null && routeIsExact(pathname, targetPathname);

  return {
    href,
    isActive:
      targetPathname !== null && routeIsActive(pathname, targetPathname),
    isExact,
    pathname,
  };
}

function resolveRouterLinkProps(
  input: RouterLinkPropsInput,
  mode: RouterMode,
  basename: string,
  win: Window,
  previousHref = "",
): RouterLinkProps {
  if (typeof input !== "function") {
    return input;
  }

  const initial = input(
    getRouterLinkState(previousHref || "/", mode, basename, win),
  );
  const state = getRouterLinkState(initial.href, mode, basename, win);
  return input(state);
}

function applyResolvedRouterLinkProps(
  anchor: HTMLAnchorElement,
  props: RouterLinkProps,
): void {
  const { href, replace: _replace, onclick: _onclick, ...rest } = props;
  anchor.removeAttribute("style");
  anchor.removeAttribute("aria-current");
  applyAnchorOptions(anchor, {
    ...rest,
    href,
  } as unknown as JDCreateElementOptions<"a">);
}

function navigateInternal(
  to: string,
  mode: RouterMode,
  basename: string,
  options: NavigateOptions | undefined,
  win: Window,
): void {
  const replace = options?.replace === true;

  if (mode === "hash") {
    const { pathname: rawPath, search } = parsePathFromTo(to);
    const logical = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
    const pathWithBase = applyBasename(logical, basename);
    const searchPart = search ? `?${search}` : "";
    const hashPath = `${pathWithBase}${searchPart}`;
    const nextHash = `#${hashPath.startsWith("/") ? hashPath : `/${hashPath}`}`;
    const newUrl = `${win.location.pathname}${win.location.search}${nextHash}`;
    if (replace) {
      win.history.replaceState(win.history.state, "", newUrl);
    } else {
      win.history.pushState(win.history.state, "", newUrl);
    }
    flush();
    return;
  }

  const url = new URL(to, win.location.href);
  const sameOrigin = url.origin === win.location.origin;
  if (!sameOrigin) {
    win.location.assign(url.toString());
    return;
  }

  const nextUrl = applyBasename(
    `${url.pathname}${url.search}${url.hash}`,
    basename,
  );
  if (replace) {
    win.history.replaceState(win.history.state, "", nextUrl);
  } else {
    win.history.pushState(win.history.state, "", nextUrl);
  }
  flush();
}

/**
 * Imperative navigation. In `hash` mode, `to` should be a path like `/inbox` or `/inbox?tab=1`
 * (the plugin will translate it into `location.hash`).
 */
export function navigate(
  to: string,
  options?: NavigateOptions & { mode?: RouterMode; basename?: string },
): void {
  const mode = options?.mode ?? "browser";
  const basename = options?.basename ?? "";
  const win = options?.targetWindow ?? window;
  navigateInternal(to, mode, basename, options, win);
}

export function defineRoutes<const T extends readonly RouteDefinition[]>(
  routes: T,
): T {
  return routes;
}

export interface CreateRouterPluginOptions {
  mode?: RouterMode;
  basename?: string;
}

export function createRouterPlugin(
  pluginDefaults: CreateRouterPluginOptions = {},
) {
  const defaults: RouterPluginDefaults = {
    mode: pluginDefaults.mode ?? "browser",
    basename: pluginDefaults.basename ?? "",
  };

  return definePlugin({
    name: "router",
    extend: () => ({
      router: (
        routes: readonly RouteDefinition[],
        mountOptions: RouterMountOptions = {},
      ): HTMLDivElement => {
        const mode = defaults.mode;
        const basename = mountOptions.basename ?? defaults.basename;

        const container = document.createElement("div");

        const render = (): void => {
          const doc = container.ownerDocument;
          const win = doc.defaultView ?? window;
          const pathname = getPathnameForMode(mode, basename, win);
          const searchRaw = getSearchForMode(mode, win);
          const segments = pathnameToSegments(pathname);
          const hit = matchRouteTree(segments, routes);
          const search =
            searchRaw.length > 0
              ? searchRaw.startsWith("?")
                ? searchRaw.slice(1)
                : searchRaw
              : "";
          const ctx: RouteMatchContext = {
            params: hit?.params ?? {},
            search: new URLSearchParams(search),
            pathname,
          };

          if (!hit) {
            container.replaceChildren(
              doc.createTextNode("No route matched."),
            );
            return;
          }

          try {
            const el = composeMatched(hit.chain, ctx);
            container.replaceChildren(el);
          } catch (err) {
            const message =
              err instanceof Error ? err.message : String(err);
            container.replaceChildren(
              doc.createTextNode(`Router error: ${message}`),
            );
          }
        };

        let unsub: (() => void) | null = null;
        const connect = (): void => {
          if (unsub) {
            return;
          }
          const win = container.ownerDocument.defaultView ?? window;
          unsub = subscribeWindow(win, render);
          render();
        };

        // Always defer: while the app tree is built, the router container is
        // `isConnected` to the parent doc (sibling of h2) before `createRoot`
        // adopts the subtree into an iframe — sync connect would read the wrong window.
        queueMicrotask(() => {
          connect();
        });

        const cleanup = (): void => {
          unsub?.();
        };

        (container as HTMLDivElement & { dispose?: () => void }).dispose =
          cleanup;

        return container;
      },

      /**
       * SPA `<a>` helper (named `routerLink` to avoid clashing with `DOM.link` for `<link>` elements).
       */
      routerLink: (
        props: RouterLinkPropsInput,
        children?: JDCreateElementChildren,
      ): HTMLAnchorElement => {
        const mode = defaults.mode;
        const basename = defaults.basename;
        const anchor = document.createElement("a");
        let currentProps = resolveRouterLinkProps(
          props,
          mode,
          basename,
          window,
        );

        const onRouterLinkClick = (e: MouseEvent): void => {
          const { href, replace, onclick } = currentProps;
          if (typeof onclick === "function") {
            (onclick as (ev: MouseEvent) => void)(e);
          }
          const currentAnchor = e.currentTarget as HTMLAnchorElement;
          if (!shouldHandleLinkClick(e, currentAnchor)) {
            return;
          }
          const linkWin = currentAnchor.ownerDocument.defaultView ?? window;
          const rawHref = currentAnchor.getAttribute("href") || href;
          const resolved = new URL(rawHref, linkWin.location.href);
          if (resolved.origin !== linkWin.location.origin) {
            return;
          }
          e.preventDefault();
          if (mode === "hash") {
            const target = rawHref.startsWith("#")
              ? rawHref
              : `${resolved.pathname}${resolved.search}`;
            navigateInternal(
              target,
              mode,
              basename,
              {
                replace: replace === true,
              },
              linkWin,
            );
            return;
          }
          navigateInternal(
            `${resolved.pathname}${resolved.search}${resolved.hash}`,
            mode,
            basename,
            {
              replace: replace === true,
            },
            linkWin,
          );
        };

        anchor.addEventListener("click", onRouterLinkClick);
        applyResolvedRouterLinkProps(anchor, currentProps);
        appendAnchorChildren(anchor, children);

        if (typeof props === "function") {
          let unsub: (() => void) | null = null;

          const update = (): void => {
            if (!anchor.isConnected) {
              unsub?.();
              unsub = null;
              return;
            }

            const win = anchor.ownerDocument.defaultView ?? window;
            currentProps = resolveRouterLinkProps(
              props,
              mode,
              basename,
              win,
              currentProps.href,
            );
            applyResolvedRouterLinkProps(anchor, currentProps);
          };

          queueMicrotask(() => {
            const win = anchor.ownerDocument.defaultView ?? window;
            unsub = subscribeWindow(win, update);
            update();
          });
        }

        return anchor;
      },
    }),
  });
}

export const routerPlugin = createRouterPlugin();
