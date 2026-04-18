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
    // Gestisce ref se presente
    if (
      options.ref &&
      typeof options.ref === "object" &&
      "current" in options.ref
    ) {
      options.ref.current = el;
      const { ref, ...restOptions } = options;
      applyAttributes(el, restOptions);
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
