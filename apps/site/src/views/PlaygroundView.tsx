"use client";

import DOM, {
  createElFromHTMLString,
  createElement,
  createRef,
  definePlugin,
  withPlugins,
} from "just-dom";
import { copyToClipboard } from "@/lib/utils";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  EraserIcon,
  PlayIcon,
  RefreshCwIcon,
  TerminalIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

type PlaygroundLog = { kind: "log" | "warn" | "error"; message: string };
type MonacoInstance = Parameters<OnMount>[1];

const PLAYGROUND_TYPES = `
type JDAllTags = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap | keyof MathMLElementTagNameMap;
type JDTagsMap = HTMLElementTagNameMap & SVGElementTagNameMap & MathMLElementTagNameMap;
type JDRef<T extends JDAllTags> = { current: JDTagsMap[T] | null };
type JDCreateElementChildren = (Node | string | null | undefined)[] | string;
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
type JDSvgPresentationAttributes = {
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
};
type JDSvgOptionsAugment<T extends JDAllTags> = T extends keyof SVGElementTagNameMap
  ? JDSvgPresentationAttributes
  : {};
type JDCreateElementOptions<T extends JDAllTags> = Omit<JDElementOptionsShape<T>, "style"> &
  JDSvgOptionsAugment<T> & {
    style?: Partial<CSSStyleDeclaration>;
    ref?: JDRef<T>;
    [key: \`data-\${string}\`]: string | undefined;
    [key: \`data\${string}\`]: string | undefined;
  };
type JDom = {
  [K in JDAllTags]: (
    props?: JDCreateElementOptions<K>,
    children?: (HTMLElement | SVGElement | MathMLElement | string | Node)[]
  ) => JDTagsMap[K];
} & {
  fragment: (children?: JDCreateElementChildren) => DocumentFragment;
};
interface JDPlugin<TExtension extends Record<string, (...args: any[]) => any> = Record<string, (...args: any[]) => any>> {
  name: string;
  extend: () => TExtension;
}
type ExtractPluginExtension<P> = P extends JDPlugin<infer T> ? T : never;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type MergePluginExtensions<P extends readonly JDPlugin<any>[]> = UnionToIntersection<ExtractPluginExtension<P[number]>>;

declare const DOM: JDom;
declare function createRoot(root: string | HTMLElement, rootEl: HTMLElement): void;
declare function createRef<T extends JDAllTags>(): JDRef<T>;
declare function createElement<T extends JDAllTags>(tagName: T, options: JDCreateElementOptions<T>, children?: JDCreateElementChildren): JDTagsMap[T];
declare function createElFromHTMLString(htmlString: string): DocumentFragment;
declare function definePlugin<T extends Record<string, (...args: any[]) => any>>(plugin: JDPlugin<T>): JDPlugin<T>;
declare function withPlugins<P extends readonly JDPlugin<any>[]>(dom: JDom, plugins: P): JDom & MergePluginExtensions<P>;
declare const mount: HTMLDivElement;
`;

const PRESETS: { label: string; value: string; code: string }[] = [
  {
    label: "Hello World",
    value: "hello",
    code: `const app = DOM.div(
  { style: { padding: "24px", fontFamily: "system-ui, sans-serif" } },
  [
    DOM.h1({}, ["Hello, Just DOM!"]),
    DOM.p(
      { style: { color: "#6b7280", marginTop: "8px" } },
      ["Building UIs without the overhead."]
    ),
  ]
);

createRoot(mount, app);`,
  },
  {
    label: "Styles & Events",
    value: "styles-events",
    code: `const app = DOM.div(
  { style: { padding: "24px", fontFamily: "system-ui, sans-serif" } },
  [
    DOM.h2({}, ["Interactive Button"]),
    DOM.button(
      {
        style: {
          marginTop: "12px",
          padding: "10px 20px",
          backgroundColor: "#3b82f6",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
        },
        onclick: () => console.log("Button clicked!"),
        onmouseenter: (e) => {
          (e.target as HTMLElement).style.backgroundColor = "#2563eb";
        },
        onmouseleave: (e) => {
          (e.target as HTMLElement).style.backgroundColor = "#3b82f6";
        },
      },
      ["Hover & click me"]
    ),
  ]
);

createRoot(mount, app);`,
  },
  {
    label: "Refs",
    value: "refs",
    code: `const inputRef = createRef<"input">();

const form = DOM.div(
  { style: { padding: "24px", fontFamily: "system-ui, sans-serif" } },
  [
    DOM.h2({}, ["Using Refs"]),
    DOM.div({ style: { display: "flex", gap: "8px", marginTop: "12px" } }, [
      DOM.input({
        ref: inputRef,
        type: "text",
        placeholder: "Type something...",
        style: {
          padding: "8px 12px",
          border: "1px solid #d4d4d8",
          borderRadius: "6px",
        },
      }),
      DOM.button(
        {
          style: {
            padding: "8px 16px",
            backgroundColor: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          },
          onclick: () => {
            const value = inputRef.current?.value;
            console.log("Input value:", value || "(empty)");
          },
        },
        ["Log Value"]
      ),
    ]),
  ]
);

createRoot(mount, form);`,
  },
  {
    label: "Todo List",
    value: "todo",
    code: `const inputRef = createRef<"input">();
const listRef = createRef<"ul">();

const addItem = () => {
  const value = inputRef.current?.value;
  if (!value) return;
  const item = DOM.li(
    { style: { padding: "8px", borderBottom: "1px solid #eee" } },
    [value]
  );
  listRef.current?.appendChild(item);
  if (inputRef.current) inputRef.current.value = "";
};

const app = DOM.div(
  {
    style: {
      padding: "24px",
      fontFamily: "system-ui, sans-serif",
      maxWidth: "400px",
    },
  },
  [
    DOM.h2({}, ["Todo List"]),
    DOM.div({ style: { display: "flex", gap: "8px", marginTop: "12px" } }, [
      DOM.input({
        ref: inputRef,
        type: "text",
        placeholder: "Add a new task...",
        style: {
          flex: "1",
          padding: "8px 12px",
          border: "1px solid #d4d4d8",
          borderRadius: "6px",
        },
        onkeydown: (e) => {
          if (e.key === "Enter") addItem();
        },
      }),
      DOM.button(
        {
          style: {
            padding: "8px 16px",
            backgroundColor: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          },
          onclick: addItem,
        },
        ["Add"]
      ),
    ]),
    DOM.ul({
      ref: listRef,
      style: { listStyle: "none", padding: "0", marginTop: "12px" },
    }),
  ]
);

createRoot(mount, app);`,
  },
  {
    label: "SVG",
    value: "svg",
    code: `const icon = DOM.svg(
  {
    width: "120",
    height: "120",
    viewBox: "0 0 120 120",
    fill: "none",
  },
  [
    DOM.circle({
      cx: "60",
      cy: "60",
      r: "50",
      stroke: "#3b82f6",
      "stroke-width": "4",
      fill: "#eff6ff",
    }),
    DOM.text(
      {
        x: "60",
        y: "66",
        "text-anchor": "middle",
        "font-size": "20",
        fill: "#3b82f6",
        "font-family": "system-ui, sans-serif",
        "font-weight": "600",
      },
      ["SVG"]
    ),
  ]
);

const app = DOM.div(
  {
    style: {
      padding: "24px",
      fontFamily: "system-ui, sans-serif",
      textAlign: "center",
    },
  },
  [DOM.h2({}, ["SVG Elements"]), icon]
);

createRoot(mount, app);`,
  },
  {
    label: "Plugin",
    value: "plugin",
    code: `const badgePlugin = definePlugin({
  name: "badge",
  extend: () => ({
    badge: (text: string, color = "#3b82f6"): HTMLSpanElement => {
      return createElement("span", {
        style: {
          display: "inline-block",
          padding: "2px 10px",
          borderRadius: "9999px",
          backgroundColor: color,
          color: "#fff",
          fontSize: "12px",
          fontWeight: "600",
        },
      }, [text]);
    },
  }),
});

const $ = withPlugins(DOM, [badgePlugin]);

const app = $.div(
  { style: { padding: "24px", fontFamily: "system-ui, sans-serif" } },
  [
    $.h2({}, ["Plugin System"]),
    $.p({ style: { marginTop: "12px" } }, [
      "Status: ",
      $.badge("Active", "#22c55e"),
      " ",
      $.badge("New"),
      " ",
      $.badge("Beta", "#f59e0b"),
    ]),
  ]
);

createRoot(mount, app);`,
  },
];

const IFRAME_HTML = `<!DOCTYPE html>
<html><head><style>
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, -apple-system, sans-serif; color: #1a1a1a; background: #ffffff; }
button { cursor: pointer; font-family: inherit; }
input, textarea, select { font-family: inherit; }
</style></head>
<body><div id="playground-root"></div></body>
</html>`;

const stringifyArg = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const PlaygroundView = () => {
  const { resolvedTheme } = useTheme();
  const [code, setCode] = useState(PRESETS[0]?.code || "");
  const [logs, setLogs] = useState<PlaygroundLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<MonacoInstance | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onClickOutside = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [menuOpen]);

  const transpile = async (source: string): Promise<string> => {
    const m = monacoRef.current;
    const ed = editorRef.current;
    if (!m || !ed) return source;

    const model = ed.getModel();
    if (!model) return source;

    if (model.getValue() !== source) model.setValue(source);

    try {
      const getWorker = await m.languages.typescript.getTypeScriptWorker();
      const client = await getWorker(model.uri);
      const result = await client.getEmitOutput(model.uri.toString());
      const output = result.outputFiles[0]?.text;
      if (!output) return source;
      return output.replace(/^export \{\};\s*/gm, "");
    } catch {
      return source;
    }
  };

  const execute = (js: string) => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write(IFRAME_HTML);
    iframeDoc.close();

    const mountEl = iframeDoc.getElementById("playground-root")!;

    setLogs([]);
    setError(null);

    const scopedConsole = {
      log: (...args: unknown[]) => {
        const msg = args.map(stringifyArg).join(" ");
        setLogs((prev) => [...prev, { kind: "log", message: msg }]);
        setConsoleOpen(true);
        console.log(...args);
      },
      warn: (...args: unknown[]) => {
        const msg = args.map(stringifyArg).join(" ");
        setLogs((prev) => [...prev, { kind: "warn", message: msg }]);
        setConsoleOpen(true);
        console.warn(...args);
      },
      error: (...args: unknown[]) => {
        const msg = args.map(stringifyArg).join(" ");
        setLogs((prev) => [...prev, { kind: "error", message: msg }]);
        setConsoleOpen(true);
        console.error(...args);
      },
    };

    try {
      const fn = new Function(
        "DOM",
        "createRoot",
        "createRef",
        "createElement",
        "createElFromHTMLString",
        "definePlugin",
        "withPlugins",
        "mount",
        "console",
        js,
      );

      fn(
        DOM,
        (root: string | HTMLElement, rootEl: HTMLElement) => {
          if (
            root === mountEl ||
            root === "app" ||
            root === "playground-root"
          ) {
            mountEl.replaceChildren(rootEl);
            return;
          }
          if (typeof root === "string") {
            const el = iframeDoc.getElementById(root);
            if (el) {
              el.replaceChildren(rootEl);
              return;
            }
          }
          if (root instanceof HTMLElement) {
            root.replaceChildren(rootEl);
            return;
          }
          mountEl.replaceChildren(rootEl);
        },
        createRef,
        createElement,
        createElFromHTMLString,
        definePlugin,
        withPlugins,
        mountEl,
        scopedConsole,
      );
    } catch (err) {
      setError(stringifyArg(err));
      setConsoleOpen(true);
    }
  };

  const runCode = async (source: string) => {
    const js = await transpile(source);
    execute(js);
  };

  const handleEditorMount: OnMount = (ed, m) => {
    editorRef.current = ed;
    monacoRef.current = m;

    ed.addAction({
      id: "run-playground",
      label: "Run Code",
      keybindings: [m.KeyMod.CtrlCmd | m.KeyCode.Enter],
      run: () => {
        const source = ed.getValue();
        setCode(source);
        void runCode(source);
      },
    });

    void runCode(PRESETS[0]?.code || "");
  };

  const handleRun = () => {
    const source = editorRef.current?.getValue() || code;
    setCode(source);
    void runCode(source);
  };

  const handlePresetChange = (value: string) => {
    const preset = PRESETS.find((p) => p.value === value);
    if (!preset) return;
    setCode(preset.code);
    setMenuOpen(false);
    void runCode(preset.code);
  };

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
  };

  const handleClearConsole = () => {
    setLogs([]);
    setError(null);
  };

  const handleCopyConsole = () => {
    const parts: string[] = [];
    if (error) parts.push(`[error] ${error}`);
    for (const l of logs) parts.push(`[${l.kind}] ${l.message}`);
    copyToClipboard(parts.join("\n"), "Console copied");
  };

  const logCount = logs.length + (error ? 1 : 0);

  return (
    <main className="p-4 pt-20 h-svh flex flex-col gap-4 md:gap-0 w-full mx-auto max-w-(--fd-layout-width)">
      {/* Header */}
      <div className="contents md:flex items-center justify-between gap-2 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Playground</h1>
          <p className="text-sm text-muted-foreground">
            Write TypeScript with full autocompletion — no install needed.
          </p>
        </div>
        <Button onClick={handleRun} className="order-last">
          <PlayIcon className="size-4" />
          Run
          <div className="ms-auto inline-flex gap-0.5">
            <kbd className="rounded-md border border-primary-foreground/30 bg-primary-foreground/20! px-1.5">
              ⌘
            </kbd>
            <kbd className="rounded-md border border-primary-foreground/30 bg-primary-foreground/20! px-1.5">
              ↵
            </kbd>
          </div>
        </Button>
      </div>

      {/* Editor / Preview attached container */}
      <div className="flex flex-col lg:flex-row w-full border rounded-md overflow-hidden flex-auto min-h-0">
        {/* ── Editor column ─────────────────────────── */}
        <div className="w-full flex flex-col min-h-[320px]">
          <div className="flex items-center gap-2 justify-between px-4 py-2 border-b">
            <p className="text-sm font-medium">Editor</p>
            <div className="flex gap-1 items-center">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => copyToClipboard(code, "Code copied")}
                title="Copy code"
              >
                <CopyIcon className="size-3.5" />
              </Button>

              <div ref={menuRef} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  Load Template
                  <ChevronDownIcon
                    className={cn(
                      "size-3 opacity-50 transition-transform",
                      menuOpen && "rotate-180",
                    )}
                  />
                </Button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 min-w-[11rem] rounded-md border bg-popover p-1 shadow-md">
                    {PRESETS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => handlePresetChange(p.value)}
                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Editor
            path="playground.ts"
            defaultLanguage="typescript"
            value={code}
            onChange={handleEditorChange}
            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
            beforeMount={(m) => {
              m.languages.typescript.typescriptDefaults.setCompilerOptions({
                target: m.languages.typescript.ScriptTarget.ESNext,
                module: m.languages.typescript.ModuleKind.None,
                strict: false,
                noImplicitAny: false,
                noUnusedLocals: false,
                noUnusedParameters: false,
              });
              m.languages.typescript.typescriptDefaults.addExtraLib(
                PLAYGROUND_TYPES,
                "playground-globals.d.ts",
              );
            }}
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Separator */}
        <div className="w-full h-px lg:h-auto lg:w-px bg-border" />

        {/* ── Preview + Console column ──────────────── */}
        <div className="w-full flex flex-col min-h-[320px]">
          <div className="flex items-center gap-2 justify-between px-4 py-2 border-b">
            <p className="text-sm font-medium">Preview</p>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={handleRun}
              title="Reload preview"
            >
              <RefreshCwIcon className="size-3.5" />
            </Button>
          </div>

          <iframe
            ref={iframeRef}
            title="Playground preview"
            className="flex-auto w-full border-0 bg-white"
          />

          {/* Collapsible console */}
          <div className="border-t">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setConsoleOpen((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  setConsoleOpen((v) => !v);
              }}
              className="flex w-full items-center justify-between gap-2 px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors cursor-pointer select-none"
            >
              <span className="flex items-center gap-2">
                <TerminalIcon className="size-3.5 opacity-60" />
                Console
                {logCount > 0 && (
                  <span className="inline-flex items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-semibold leading-4 tabular-nums">
                    {logCount}
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyConsole();
                  }}
                  className="inline-flex items-center justify-center rounded-md size-7 hover:bg-muted transition-colors"
                  title="Copy console"
                >
                  <CopyIcon className="size-3.5 opacity-60" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearConsole();
                  }}
                  className="inline-flex items-center justify-center rounded-md size-7 hover:bg-muted transition-colors"
                  title="Clear console"
                >
                  <EraserIcon className="size-3.5 opacity-60" />
                </button>
                <ChevronUpIcon
                  className={cn(
                    "size-3.5 opacity-50 transition-transform",
                    consoleOpen && "rotate-180",
                  )}
                />
              </span>
            </div>

            {consoleOpen && (
              <div className="max-h-[200px] overflow-auto border-t p-3 text-xs font-mono space-y-1">
                {error && <p className="text-red-500">{error}</p>}
                {!error && logs.length === 0 && (
                  <p className="text-muted-foreground">No output.</p>
                )}
                {logs.map((entry, i) => (
                  <p
                    key={`${entry.kind}-${i}`}
                    className={
                      entry.kind === "error"
                        ? "text-red-500"
                        : entry.kind === "warn"
                          ? "text-amber-500"
                          : "text-muted-foreground"
                    }
                  >
                    [{entry.kind}] {entry.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default PlaygroundView;
