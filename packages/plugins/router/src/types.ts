import type { JDCreateElementOptions } from "just-dom";

export type RouterMode = "browser" | "hash";

export interface RouteMatchContext {
  params: Readonly<Record<string, string>>;
  search: URLSearchParams;
  pathname: string;
}

export type RouteElementRenderer = (
  ctx: RouteMatchContext,
) => HTMLElement | SVGElement;

export type RouteLayoutRenderer = (
  ctx: RouteMatchContext & { outlet: HTMLElement | SVGElement },
) => HTMLElement | SVGElement;

export interface RouteDefinition {
  /**
   * Segment pattern relative to the parent, e.g. `"users/:id"`, `"*"`.
   * Omit, `""`, or `"/"` for a segment-less branch (layout wrapper at this depth).
   */
  path?: string;
  /** Matches when no URL segments remain at this depth. */
  index?: boolean;
  layout?: RouteLayoutRenderer;
  element?: RouteElementRenderer;
  children?: readonly RouteDefinition[];
}

export type ScrollBehavior = false | "restore";

export type NavAction = "PUSH" | "POP" | "REPLACE";

export interface NavigateOptions {
  replace?: boolean;
  /**
   * History and location APIs use this window. Defaults to the global `window`.
   * Set when driving a router mounted in another browsing context (e.g. playground iframe).
   */
  targetWindow?: Window;
  /** When true, forward navigation does not scroll to the top. */
  preventScrollReset?: boolean;
}

export interface RouterPluginDefaults {
  mode: RouterMode;
  basename: string;
  scroll: ScrollBehavior;
}

export interface RouterMountOptions {
  /** Overrides the plugin default basename for this router subtree. */
  basename?: string;
  /**
   * Scroll handling for this router. Default: `"restore"` (scroll to top on push/replace,
   * restore on back/forward). Use `false` to leave scroll unchanged.
   */
  scroll?: ScrollBehavior;
}

export type RouterLinkProps = JDCreateElementOptions<"a"> & {
  href: string;
  replace?: boolean;
  /** When true, this link does not reset scroll to the top on navigation. */
  preventScrollReset?: boolean;
};

export interface RouterLinkRenderContext {
  /** True when the current route matches the link target or one of its descendants. */
  isActive: boolean;
  /** True only when the current route exactly matches the link target. */
  isExact: boolean;
  /** Current logical router pathname, without basename. */
  pathname: string;
  /** Link target href from the first props pass. */
  href: string;
}

export type RouterLinkPropsInput =
  | RouterLinkProps
  | ((ctx: RouterLinkRenderContext) => RouterLinkProps);
