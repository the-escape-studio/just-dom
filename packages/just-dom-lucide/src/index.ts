import { definePlugin } from "just-dom";
import {
  createElement as lucideCreateElement,
  icons as allIcons,
  type IconNode,
} from "lucide";

export type { IconNode };

export interface LucideIconOptions {
  size?: number;
  color?: string;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
  className?: string;
}

function toSvgAttrs(
  options: LucideIconOptions = {},
): Record<string, string | number> {
  const attrs: Record<string, string | number> = {};

  if (options.size !== undefined) {
    attrs.width = options.size;
    attrs.height = options.size;
  }
  if (options.color !== undefined) {
    attrs.stroke = options.color;
  }
  if (options.strokeWidth !== undefined) {
    attrs["stroke-width"] = options.absoluteStrokeWidth
      ? (options.strokeWidth * 24) / (options.size ?? 24)
      : options.strokeWidth;
  }
  if (options.className !== undefined) {
    attrs.class = options.className;
  }

  return attrs;
}

/**
 * Create a Lucide plugin with a specific set of icons.
 * Only registered icons are bundled and type-checked.
 *
 * @example
 * ```ts
 * import { createLucidePlugin } from "just-dom-lucide";
 * import { House, Search } from "lucide";
 *
 * const lucide = createLucidePlugin({ icons: { House, Search } });
 * const $ = withPlugins(DOM, [lucide]);
 *
 * $.icon("House", { size: 24 });   // OK
 * $.icon("Search");                 // OK
 * $.icon("Missing");                // TS error
 * ```
 */
export function createLucidePlugin<T extends Record<string, IconNode>>(config: {
  icons: T;
}) {
  return definePlugin({
    name: "lucide",
    extend: () => ({
      icon: (
        name: keyof T & string,
        options?: LucideIconOptions,
      ): SVGSVGElement => {
        const iconNode = config.icons[name];
        if (!iconNode) {
          throw new Error(
            `[just-dom-lucide] Icon "${name}" not found. ` +
              `Make sure it's registered in createLucidePlugin({ icons: { ... } })`,
          );
        }

        return lucideCreateElement(iconNode, toSvgAttrs(options)) as SVGSVGElement;
      },
    }),
  });
}

/**
 * Pre-configured plugin with ALL Lucide icons.
 * Convenient for prototyping, but includes the full icon set in the bundle.
 * For production, prefer `createLucidePlugin` with only the icons you need.
 */
export const lucidePlugin = createLucidePlugin({ icons: allIcons });
