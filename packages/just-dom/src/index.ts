import {
  createElement,
  createElFromHTMLString,
  createFragment,
  createRef,
  createRoot,
} from "./core";
import { JDom } from "./types";
import { allTags } from "./utils/tags";

/**
 * @description A lightweight library for DOM manipulation
 * @type {JDom}
 * @default
 *
 * @example
 * ```ts
 * import DOM from "just-dom-2";
 * const el = DOM.div({ id: "my-div" }, "Hello, world!");
 * document.body.appendChild(el);
 * ```
 */
const DOM: JDom = {
  fragment: createFragment,
} as JDom;

for (const tag of allTags) {
  // @ts-ignore – TS non riesce a inferire K dentro il ciclo
  DOM[tag] = (props, children) => createElement(tag, props, children);
}

// EXPORTS
export { createElement, createElFromHTMLString, createRef, createRoot };
export { definePlugin, withPlugins } from "./plugin";
export type { JDPlugin, MergePluginExtensions } from "./plugin";
export type {
  JDom,
  JDAllTags,
  JDTagsMap,
  JDCreateElementOptions,
  JDCreateElementChildren,
  JDRef,
  JDSvgPresentationAttributes,
} from "./types";
export default DOM;
