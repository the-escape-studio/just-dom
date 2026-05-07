import {
  createElement,
  createElFromHTMLString,
  createFragment,
  createRef,
  createRoot,
} from "./core"
import { JDom } from "./types"
import { htmlTags, mathmlTags, svgTags, svgTagToDomKey } from "./utils/tags"

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
} as JDom

for (const tag of htmlTags) {
  // @ts-ignore – TS non riesce a inferire K dentro il ciclo
  DOM[tag] = (props, children) => createElement(tag, props, children, "html")
}
for (const tag of mathmlTags) {
  // @ts-ignore
  DOM[tag] = (props, children) => createElement(tag, props, children, "mathml")
}
for (const tag of svgTags) {
  const key = svgTagToDomKey(tag)
  // @ts-ignore
  DOM[key] = (props, children) => createElement(tag, props, children, "svg")
}

// EXPORTS
export { createElement, createElFromHTMLString, createRef, createRoot }
export {
  svgTagToDomKey,
  JD_NAMESPACES,
  elementIsSvgOrMathML,
} from "./utils/tags"
export type { JDElementNamespace } from "./utils/tags"
export { definePlugin, withPlugins } from "./plugin"
export type { JDPlugin, MergePluginExtensions } from "./plugin"
export type {
  JDom,
  JDAllTags,
  JDTagsMap,
  JDCreateElementOptions,
  JDCreateElementChildren,
  JDRef,
  JDSvgDomKey,
  JDSvgPresentationAttributes,
} from "./types"
export default DOM
