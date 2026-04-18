import { tagIsCustomNS } from "./tags";

export const applyAttributes = (
  el: HTMLElement | SVGElement | MathMLElement,
  attributes: Record<string, any>
) => {
  if (!attributes) return;

  for (const [key, value] of Object.entries(attributes)) {
    if (value === null || value === undefined) {
      el.removeAttribute(key);
      continue;
    }

    switch (true) {
      case key === "style" && typeof value === "object":
        Object.assign(el.style, value);
        break;
      case key.startsWith("on") && typeof value === "function":
        el.addEventListener(key.slice(2).toLowerCase(), value);
        break;
      case key.startsWith("data-"):
        const dataKey = key
          .slice(5)
          .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        (el as HTMLElement).dataset[dataKey] = String(value);
        break;
      case key.startsWith("data") && !key.startsWith("data-"):
        (el as HTMLElement).dataset[key.slice(4)] = String(value);
        break;
      case typeof value === "boolean":
        if (value) {
          el.setAttribute(key, "");
        } else {
          el.removeAttribute(key);
        }
        break;
      default:
        if (tagIsCustomNS(el.tagName)) {
          el.setAttribute(key, String(value));
        } else {
          if (key in el) {
            (el as any)[key] = value;
          } else {
            el.setAttribute(key, String(value));
          }
        }
    }
  }
};
