/**
 * Monaco extraLib for the Lucide plugin in the playground. Keep in sync with the `LUCIDE`
 * object passed at runtime in PlaygroundView (icon names and createLucidePlugin).
 */
export const PLAYGROUND_LUCIDE_TYPES = `
// Playground: subset of lucide \`IconNode\`s exposed as \`LUCIDE\` (see playground-lucide-ambient.ts)
type IconNode = readonly [string, { readonly [k: string]: string | number }][];
interface LucideIconOptions {
  size?: number;
  color?: string;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
  className?: string;
}
declare const LUCIDE: {
  House: IconNode;
  Search: IconNode;
  Heart: IconNode;
  Star: IconNode;
  Menu: IconNode;
  Loader: IconNode;
};
declare function createLucidePlugin<T extends Record<string, IconNode>>(config: { icons: T }): {
  name: string;
  extend: () => { lucide: (name: keyof T & string, options?: LucideIconOptions) => SVGSVGElement };
};

`.trim();
