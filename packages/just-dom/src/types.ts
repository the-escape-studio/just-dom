import { createFragment } from "./core";
import { htmlTags, svgTags, mathmlTags } from "./utils/tags";

export type HTMLTag = (typeof htmlTags)[number];
export type SVGTag = (typeof svgTags)[number];
export type MathMLTag = (typeof mathmlTags)[number];
export type JDAllTags = HTMLTag | SVGTag | MathMLTag;

export type JDTagsMap = HTMLElementTagNameMap &
  SVGElementTagNameMap &
  MathMLElementTagNameMap;

/**
 * DOM lib marks many SVG (and some other) properties as readonly and types them as
 * live objects (e.g. SVGAnimatedLength). At runtime just-dom sets these via
 * setAttribute, so options should accept attribute-style string/number/boolean.
 */
type JDCoerceElementProp<V> = V extends (...args: never) => unknown
  ? V
  : V extends SVGAnimatedBoolean
    ? boolean | string
    : V extends
          | SVGAnimatedAngle
          | SVGAnimatedEnumeration
          | SVGAnimatedInteger
          | SVGAnimatedLength
          | SVGAnimatedLengthList
          | SVGAnimatedNumber
          | SVGAnimatedNumberList
          | SVGAnimatedPoints
          | SVGAnimatedPreserveAspectRatio
          | SVGAnimatedRect
          | SVGAnimatedString
          | SVGAnimatedTransformList
      ? string | number
      : V;

type JDElementOptionsShape<T extends JDAllTags> = {
  -readonly [K in keyof JDTagsMap[T]]?: JDCoerceElementProp<JDTagsMap[T][K]>;
};

/**
 * Presentation and paint attributes that exist on SVG markup but are often omitted from
 * TypeScript's SVG*Element interfaces, so they are not in keyof JDTagsMap[T].
 */
export type JDSvgPresentationAttributes = {
  fill?: string;
  stroke?: string;
  color?: string;
  opacity?: string | number;
  "fill-opacity"?: string | number;
  fillOpacity?: string | number;
  "fill-rule"?: string;
  fillRule?: string;
  "stroke-opacity"?: string | number;
  strokeOpacity?: string | number;
  "stroke-width"?: string | number;
  strokeWidth?: string | number;
  "stroke-linecap"?: string;
  strokeLinecap?: string;
  "stroke-linejoin"?: string;
  strokeLinejoin?: string;
  "stroke-miterlimit"?: string | number;
  strokeMiterlimit?: string | number;
  "stroke-dasharray"?: string;
  strokeDasharray?: string;
  "stroke-dashoffset"?: string | number;
  strokeDashoffset?: string | number;
  "vector-effect"?: string;
  vectorEffect?: string;
  "text-anchor"?: string;
  textAnchor?: string;
  "text-decoration"?: string;
  textDecoration?: string;
  "font-family"?: string;
  fontFamily?: string;
  "font-size"?: string | number;
  fontSize?: string | number;
  "font-weight"?: string | number;
  fontWeight?: string | number;
  "font-style"?: string;
  fontStyle?: string;
  "letter-spacing"?: string | number;
  letterSpacing?: string | number;
  "word-spacing"?: string | number;
  wordSpacing?: string | number;
  "dominant-baseline"?: string;
  dominantBaseline?: string;
  "alignment-baseline"?: string;
  alignmentBaseline?: string;
  transform?: string;
  "clip-path"?: string;
  clipPath?: string;
  mask?: string;
  filter?: string;
  display?: string;
  visibility?: string;
  /** SVG `<path>` (spesso assente da `keyof` sulle mappe DOM incrociate). */
  d?: string;
  pathLength?: string | number;
};

type JDSvgOptionsAugment<T extends JDAllTags> = T extends SVGTag
  ? JDSvgPresentationAttributes
  : {};

export type JDCreateElementOptions<T extends JDAllTags> = Omit<
  JDElementOptionsShape<T>,
  "style"
> &
  JDSvgOptionsAugment<T> & {
    style?: Partial<CSSStyleDeclaration>;
    ref?: JDRef<T> | ((el: JDTagsMap[T]) => void);
    [key: `data-${string}`]: string | undefined;
    [key: `data${string}`]: string | undefined;
  };

export type JDCreateElementChildren =
  | (Node | string | null | undefined)[]
  | string;

export type JDRef<T extends JDAllTags> = { current: JDTagsMap[T] | null };

/** Keys used on `DOM` for SVG element factories (`svg` for the root; others prefixed with `svg`). */
export type JDSvgDomKey<K extends SVGTag = SVGTag> = K extends "svg"
  ? "svg"
  : `svg${Capitalize<K>}`;

type JDomHtml = {
  [K in HTMLTag]: (
    props?: JDCreateElementOptions<K>,
    children?: JDCreateElementChildren
  ) => HTMLElementTagNameMap[K];
};

type JDomMathML = {
  [K in MathMLTag]: (
    props?: JDCreateElementOptions<K>,
    children?: JDCreateElementChildren
  ) => MathMLElementTagNameMap[K];
};

type JDomSvg = {
  [K in SVGTag as JDSvgDomKey<K>]: (
    props?: JDCreateElementOptions<K>,
    children?: JDCreateElementChildren
  ) => SVGElementTagNameMap[K];
};

export type JDom = JDomHtml &
  JDomMathML &
  JDomSvg & {
    fragment: typeof createFragment;
  };
