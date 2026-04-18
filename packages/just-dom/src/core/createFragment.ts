import { type JDCreateElementChildren } from "../types";

export const createFragment = function (
  children: JDCreateElementChildren = []
) {
  const fragment = document.createDocumentFragment();
  for (const child of children) {
    if (child) {
      if (typeof child === "object") {
        fragment.appendChild(child);
      }
      if (typeof child === "string") {
        fragment.appendChild(document.createTextNode(child));
      }
    }
  }
  return fragment;
};
