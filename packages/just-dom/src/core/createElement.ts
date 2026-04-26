import {
  JDAllTags,
  JDCreateElementOptions,
  JDCreateElementChildren,
  JDTagsMap,
} from "../types";
import { createSmartElement, applyAttributes } from "../utils";

export const createElement = <T extends JDAllTags>(
  tagName: T,
  options: JDCreateElementOptions<T>,
  children?: JDCreateElementChildren,
): JDTagsMap[T] => {
  const el = createSmartElement(tagName) as JDTagsMap[T];

  // Applica gli attributi
  if (options) {
    if (options.ref) {
      const { ref, ...restOptions } = options;
      applyAttributes(el, restOptions);
      if (typeof ref === "function") {
        ref(el);
      } else if (typeof ref === "object" && "current" in ref) {
        ref.current = el;
      }
    } else {
      applyAttributes(el, options);
    }
  }

  // Aggiungi i figli
  if (children && children.length) {
    if (Array.isArray(children)) {
      for (const child of children) {
        if (child) {
          if (typeof child === "string") {
            el.appendChild(document.createTextNode(child));
          } else {
            el.appendChild(child);
          }
        }
      }
    } else if (typeof children === "string") {
      el.appendChild(document.createTextNode(children));
    } else {
      throw new Error(
        "Invalid children type. Expected an array of elements or a string.",
      );
    }
  }

  return el;
};
