import type { JDom } from "./types";

// --- Plugin type ---

export interface JDPlugin<
  TExtension extends Record<string, (...args: any[]) => any> =
    Record<string, (...args: any[]) => any>,
> {
  name: string;
  extend: () => TExtension;
}

// --- Type utilities ---

type ExtractPluginExtension<P> =
  P extends JDPlugin<infer T> ? T : never;

type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never;

export type MergePluginExtensions<P extends readonly JDPlugin<any>[]> =
  UnionToIntersection<ExtractPluginExtension<P[number]>>;

// --- Runtime functions ---

export function definePlugin<
  T extends Record<string, (...args: any[]) => any>,
>(plugin: JDPlugin<T>): JDPlugin<T> {
  return plugin;
}

export function withPlugins<const P extends readonly JDPlugin<any>[]>(
  dom: JDom,
  plugins: P,
): JDom & MergePluginExtensions<P> {
  const extended = { ...dom } as JDom & MergePluginExtensions<P>;

  for (const plugin of plugins) {
    const ext = plugin.extend();
    for (const [key, value] of Object.entries(ext)) {
      (extended as any)[key] = value;
    }
  }

  return extended;
}
