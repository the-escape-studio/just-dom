export const htmlTags: (keyof HTMLElementTagNameMap)[] = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "menu",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "search",
  "section",
  "select",
  "slot",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
]

export const svgTags: (keyof SVGElementTagNameMap)[] = [
  "a",
  "animate",
  "animateMotion",
  "animateTransform",
  "circle",
  "clipPath",
  "defs",
  "desc",
  "ellipse",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence",
  "filter",
  "foreignObject",
  "g",
  "image",
  "line",
  "linearGradient",
  "marker",
  "mask",
  "metadata",
  "mpath",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "script",
  "set",
  "stop",
  "style",
  "svg",
  "switch",
  "symbol",
  "text",
  "textPath",
  "title",
  "tspan",
  "use",
  "view",
]

export const mathmlTags: (keyof MathMLElementTagNameMap)[] = [
  "annotation",
  "annotation-xml",
  "maction",
  "math",
  "merror",
  "mfrac",
  "mi",
  "mmultiscripts",
  "mn",
  "mo",
  "mover",
  "mpadded",
  "mphantom",
  "mprescripts",
  "mroot",
  "mrow",
  "ms",
  "mspace",
  "msqrt",
  "mstyle",
  "msub",
  "msubsup",
  "msup",
  "mtable",
  "mtd",
  "mtext",
  "mtr",
  "munder",
  "munderover",
  "semantics",
]

export const allTags = [...htmlTags, ...svgTags, ...mathmlTags] as const

/** Runtime key on `DOM` for SVG factories. Root `svg` stays `svg`; others use `svg` + PascalCase (`circle` → `svgCircle`). */
export function svgTagToDomKey<T extends keyof SVGElementTagNameMap>(
  tag: T
): T extends "svg" ? "svg" : `svg${Capitalize<T>}` {
  if (tag === "svg")
    return "svg" as T extends "svg" ? "svg" : `svg${Capitalize<T>}`
  return `svg${tag.charAt(0).toUpperCase() + tag.slice(1)}` as T extends "svg"
    ? "svg"
    : `svg${Capitalize<T>}`
}

export const JD_NAMESPACES = {
  html: "http://www.w3.org/1999/xhtml",
  svg: "http://www.w3.org/2000/svg",
  mathml: "http://www.w3.org/1998/Math/MathML",
} as const

/** Explicit namespace for factories (`DOM.svgCircle`, `DOM.a`, …). */
export type JDElementNamespace = keyof typeof JD_NAMESPACES

function matchesListedTag<const T extends string>(
  list: readonly T[],
  tagName: string
): boolean {
  const lower = tagName.toLowerCase()
  return list.some((t) => t.toLowerCase() === lower)
}

/** True when the node lives in SVG or MathML (not HTML). Prefer this over tag-name checks for names shared by HTML and SVG (`a`, `script`, …). */
export function elementIsSvgOrMathML(el: Element): boolean {
  const ns = el.namespaceURI
  return ns === JD_NAMESPACES.svg || ns === JD_NAMESPACES.mathml
}

export function createSmartElement(
  tagName: string,
  namespace?: JDElementNamespace
): Element {
  if (namespace === "svg") {
    return document.createElementNS(JD_NAMESPACES.svg, tagName)
  }
  if (namespace === "mathml") {
    return document.createElementNS(JD_NAMESPACES.mathml, tagName)
  }
  if (namespace === "html") {
    return document.createElement(tagName)
  }

  const lower = tagName.toLowerCase()

  // Without hint, HTML tag names stay in the HTML namespace — covers `a`, `script`, `style`, `title`, …
  if (htmlTags.includes(lower as keyof HTMLElementTagNameMap)) {
    return document.createElement(tagName)
  }
  if (matchesListedTag(svgTags, tagName)) {
    return document.createElementNS(JD_NAMESPACES.svg, tagName)
  }
  if (matchesListedTag(mathmlTags, tagName)) {
    return document.createElementNS(JD_NAMESPACES.mathml, tagName)
  }

  return document.createElement(tagName)
}
