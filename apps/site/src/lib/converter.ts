import * as prettier from "prettier/standalone";
import * as parserBabel from "prettier/parser-babel";
import prettierPluginEstree from "prettier/plugins/estree";
import {
  JD_NAMESPACES,
  elementIsSvgOrMathML,
  svgTagToDomKey,
} from "just-dom";
import { mathmlTags, svgTags } from "@/lib/tags";

/** DOM factory callee like `DOM.div` or `DOM["annotation-xml"]`, based on element namespace (fixes HTML vs SVG name clashes such as `a`). */
function domCalleeForElement(el: Element, prefix: string): string {
  const ns = el.namespaceURI;

  if (ns === JD_NAMESPACES.svg) {
    const svgTagKey = svgTags.find(
      (t) => t.toLowerCase() === el.tagName.toLowerCase(),
    );
    const method = svgTagKey
      ? svgTagToDomKey(svgTagKey)
      : el.tagName.toLowerCase();
    return `${prefix}.${method}`;
  }

  if (ns === JD_NAMESPACES.mathml) {
    const mathTagKey = mathmlTags.find(
      (t) => t.toLowerCase() === el.tagName.toLowerCase(),
    );
    const tag = mathTagKey ?? el.tagName.toLowerCase();
    return /^[a-zA-Z_$][\w$]*$/.test(tag)
      ? `${prefix}.${tag}`
      : `${prefix}[${JSON.stringify(tag)}]`;
  }

  return `${prefix}.${el.tagName.toLowerCase()}`;
}

export const formatCode = async (code: string): Promise<string> => {
  try {
    return await prettier.format(code, {
      parser: "babel",
      plugins: [parserBabel, prettierPluginEstree],
      semi: true,
      singleQuote: false,
      tabWidth: 2,
      printWidth: 80,
      trailingComma: "es5",
      bracketSpacing: true,
      arrowParens: "always",
      endOfLine: "lf",
    });
  } catch (error) {
    console.log(error);
    return code;
  }
};

export const getJsAttributeName = (
  htmlName: string,
  el: Element,
): string => {
  // Gestione dei casi speciali più comuni
  const specialCases: Record<string, string> = {
    class: "className",
    for: "htmlFor",

    // Accessibilità e dataset
    "aria-activedescendant": "ariaActiveDescendant",
    "aria-atomic": "ariaAtomic",
    "aria-autocomplete": "ariaAutoComplete",
    "aria-busy": "ariaBusy",
    "aria-checked": "ariaChecked",
    "aria-colcount": "ariaColCount",
    "aria-colindex": "ariaColIndex",
    "aria-colspan": "ariaColSpan",
    "aria-controls": "ariaControls",
    "aria-current": "ariaCurrent",
    "aria-describedby": "ariaDescribedBy",
    "aria-details": "ariaDetails",
    "aria-disabled": "ariaDisabled",
    "aria-dropeffect": "ariaDropEffect",
    "aria-errormessage": "ariaErrorMessage",
    "aria-expanded": "ariaExpanded",
    "aria-flowto": "ariaFlowTo",
    "aria-grabbed": "ariaGrabbed",
    "aria-haspopup": "ariaHasPopup",
    "aria-hidden": "ariaHidden",
    "aria-invalid": "ariaInvalid",
    "aria-keyshortcuts": "ariaKeyShortcuts",
    "aria-label": "ariaLabel",
    "aria-labelledby": "ariaLabelledBy",
    "aria-level": "ariaLevel",
    "aria-live": "ariaLive",
    "aria-modal": "ariaModal",
    "aria-multiline": "ariaMultiline",
    "aria-multiselectable": "ariaMultiSelectable",
    "aria-orientation": "ariaOrientation",
    "aria-owns": "ariaOwns",
    "aria-placeholder": "ariaPlaceholder",
    "aria-posinset": "ariaPosInSet",
    "aria-pressed": "ariaPressed",
    "aria-readonly": "ariaReadOnly",
    "aria-relevant": "ariaRelevant",
    "aria-required": "ariaRequired",
    "aria-roledescription": "ariaRoleDescription",
    "aria-rowcount": "ariaRowCount",
    "aria-rowindex": "ariaRowIndex",
    "aria-rowspan": "ariaRowSpan",
    "aria-selected": "ariaSelected",
    "aria-setsize": "ariaSetSize",
    "aria-sort": "ariaSort",
    "aria-valuemax": "ariaValueMax",
    "aria-valuemin": "ariaValueMin",
    "aria-valuenow": "ariaValueNow",
    "aria-valuetext": "ariaValueText",

    // Form e input
    "accept-charset": "acceptCharset",
    enctype: "encType",
    maxlength: "maxLength",
    minlength: "minLength",
    readonly: "readOnly",
    tabindex: "tabIndex",
    spellcheck: "spellCheck",
    autocapitalize: "autoCapitalize",
    autocomplete: "autoComplete",
    autocorrect: "autoCorrect",

    // Tabelle
    colspan: "colSpan",
    rowspan: "rowSpan",

    // Media
    playsinline: "playsInline",
    autoplay: "autoPlay",
    loop: "loop",
    muted: "muted",

    // Altri
    crossorigin: "crossOrigin",
    hreflang: "hrefLang",
    novalidate: "noValidate",
    usemap: "useMap",
    formaction: "formAction",
    formnovalidate: "formNoValidate",
    ismap: "isMap",
    nomodule: "noModule",
    nonce: "nonce",
  };

  if (elementIsSvgOrMathML(el)) {
    return `"${htmlName}"`;
  } else if (specialCases[htmlName]) {
    return specialCases[htmlName];
  }

  // Per gli altri casi, convertiamo il nome in camelCase
  return htmlName.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
};

export const convertHtmlToDom = async (html: string, prefix = "DOM") => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const element = doc.body.firstChild as Element | null;

    if (!element || element.nodeType !== Node.ELEMENT_NODE) return "";

    const convertElement = (el: Element): string => {
      const attributes = Array.from(el.attributes)
        .map((attr) => {
          const jsAttrName = getJsAttributeName(attr.name, el);
          return `${jsAttrName}: "${attr.value}"`;
        })
        .join(",");

      const childNodes = Array.from(el.childNodes)
        .map((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            return text ? `" ${text}"` : null;
          }
          if (node.nodeType === Node.ELEMENT_NODE) {
            return convertElement(node as Element);
          }
          return null;
        })
        .filter(Boolean);

      const hasChildren = childNodes.length > 0;

      let result = `${domCalleeForElement(el, prefix)}(`;

      if (attributes) {
        result += `{`;
        result += attributes;
        result += `}`;
      } else {
        result += `{}`;
      }

      if (hasChildren) {
        result += `,[`;
        result += childNodes.join(",");
        result += `]`;
      }

      result += `)`;
      return result;
    };

    const unformattedResult = convertElement(element);
    return await formatCode(unformattedResult);
  } catch {
    return "Errore nella conversione. Assicurati che l'HTML sia valido.";
  }
};
