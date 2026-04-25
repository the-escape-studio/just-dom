import type { RouteDefinition } from "./types";

export type PatternParts = readonly string[] | "splat";

export function splitPattern(path?: string): PatternParts {
  if (path === undefined || path === "" || path === "/") {
    return [];
  }
  const trimmed = path.replace(/^\/+|\/+$/g, "");
  if (trimmed === "*") {
    return "splat";
  }
  return trimmed.split("/").filter(Boolean);
}

export type ConsumeRouteResult =
  | { ok: false }
  | {
      ok: true;
      rest: string[];
      params: Record<string, string>;
    };

export function consumeRoute(
  route: RouteDefinition,
  segments: readonly string[],
  baseParams: Record<string, string>,
): ConsumeRouteResult {
  if (route.index) {
    if (segments.length !== 0) {
      return { ok: false };
    }
    return { ok: true, rest: [...segments], params: { ...baseParams } };
  }

  const pattern = splitPattern(route.path);
  if (pattern === "splat") {
    const params = { ...baseParams };
    params["*"] = segments.length ? segments.join("/") : "";
    return { ok: true, rest: [], params };
  }

  if (segments.length < pattern.length) {
    return { ok: false };
  }

  const params = { ...baseParams };
  for (let i = 0; i < pattern.length; i++) {
    const pat = pattern[i]!;
    const seg = segments[i]!;
    if (pat.startsWith(":")) {
      try {
        params[pat.slice(1)] = decodeURIComponent(seg);
      } catch {
        params[pat.slice(1)] = seg;
      }
    } else if (pat !== seg) {
      return { ok: false };
    }
  }

  return {
    ok: true,
    rest: segments.slice(pattern.length),
    params,
  };
}

export function matchRouteTree(
  segments: readonly string[],
  routes: readonly RouteDefinition[],
  inheritedParams: Record<string, string> = {},
): { chain: RouteDefinition[]; params: Record<string, string> } | null {
  for (const route of routes) {
    const consumed = consumeRoute(route, segments, inheritedParams);
    if (!consumed.ok) {
      continue;
    }
    const { rest, params } = consumed;
    const children = route.children;

    if (children && children.length > 0) {
      const sub = matchRouteTree(rest, children, params);
      if (sub) {
        return { chain: [route, ...sub.chain], params: sub.params };
      }
    }

    if (rest.length === 0 && route.element) {
      return { chain: [route], params };
    }
  }

  return null;
}

export function pathnameToSegments(pathname: string): string[] {
  const trimmed = pathname.replace(/^\/+|\/+$/g, "");
  if (!trimmed) {
    return [];
  }
  return trimmed.split("/").filter(Boolean);
}
