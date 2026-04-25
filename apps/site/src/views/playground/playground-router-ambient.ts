/**
 * Monaco extraLib for `@just-dom/router` in the playground.
 * Keep in sync with runtime bindings in `PlaygroundView.tsx`.
 */
export const PLAYGROUND_ROUTER_TYPES = `
type RouterMode = "browser" | "hash";

interface RouteMatchContext {
  params: Readonly<Record<string, string>>;
  search: URLSearchParams;
  pathname: string;
}

type RouteElementRenderer = (ctx: RouteMatchContext) => HTMLElement | SVGElement;
type RouteLayoutRenderer = (
  ctx: RouteMatchContext & { outlet: HTMLElement | SVGElement },
) => HTMLElement | SVGElement;

interface RouteDefinition {
  path?: string;
  index?: boolean;
  layout?: RouteLayoutRenderer;
  element?: RouteElementRenderer;
  children?: readonly RouteDefinition[];
}

interface CreateRouterPluginOptions {
  mode?: RouterMode;
  basename?: string;
}

interface RouterMountOptions {
  basename?: string;
}

type RouterLinkProps = Record<string, unknown> & {
  href: string;
  replace?: boolean;
};

interface RouterLinkRenderContext {
  isActive: boolean;
  isExact: boolean;
  pathname: string;
  href: string;
}

type RouterLinkPropsInput =
  | RouterLinkProps
  | ((ctx: RouterLinkRenderContext) => RouterLinkProps);

declare function defineRoutes<const T extends readonly RouteDefinition[]>(routes: T): T;

declare function createRouterPlugin(
  options?: CreateRouterPluginOptions,
): {
  name: string;
  extend: () => {
    router: (
      routes: readonly RouteDefinition[],
      mountOptions?: RouterMountOptions,
    ) => HTMLDivElement;
    routerLink: (
      props: RouterLinkPropsInput,
      children?: readonly (HTMLElement | SVGElement | string)[] | string,
    ) => HTMLAnchorElement;
  };
};

declare function navigate(
  to: string,
  options?: {
    replace?: boolean;
    mode?: RouterMode;
    basename?: string;
    targetWindow?: Window;
  },
): void;
`.trim();
