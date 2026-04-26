export const PLAYGROUND_PRESETS: {
  label: string
  value: string
  code: string
}[] = [
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
    label: "Lucide (official plugin)",
    value: "lucide",
    code: `const lucide = createLucidePlugin({ icons: LUCIDE });
const jd = withPlugins(DOM, [lucide]);

const app = jd.div(
  { style: { padding: "24px", fontFamily: "system-ui, sans-serif" } },
  [
    jd.h2({}, ["@just-dom/lucide"]),
    jd.p({ style: { marginTop: "8px", color: "#6b7280" } }, [
      "Icons: House, Search, Star, … (playground ships a small preset; see LUCIDE)",
    ]),
    jd.div(
      { style: { display: "flex", gap: "12px", marginTop: "16px", alignItems: "center" } },
      [
        jd.icon("House", { size: 28, color: "#3b82f6" }),
        jd.icon("Search", { size: 28, color: "#22c55e" }),
        jd.icon("Star", { size: 28, color: "#f59e0b" }),
      ],
    ),
  ],
);

createRoot(mount, app);`,
  },
  {
    label: "Router (official plugin)",
    value: "router",
    code: `const router = createRouterPlugin({ mode: "hash" });
const jd = withPlugins(DOM, [router]);

const routes = defineRoutes([
  {
    layout: ({ outlet }) =>
      jd.div({ style: { padding: "16px", fontFamily: "system-ui, sans-serif" } }, [
        jd.div(
          {
            style: {
              display: "flex",
              gap: "12px",
              marginBottom: "12px",
              flexWrap: "wrap",
            },
          },
          [
            jd.routerLink(
              ({ isExact }) => ({
                href: "#/",
                style: {
                  color: isExact ? "#2563eb" : "",
                  fontWeight: isExact ? "700" : "",
                },
                "aria-current": isExact ? "page" : undefined,
              }),
              ["Home"],
            ),
            jd.routerLink(
              ({ isExact }) => ({
                href: "#/user/alice",
                style: {
                  color: isExact ? "#2563eb" : "",
                  fontWeight: isExact ? "700" : "",
                },
                "aria-current": isExact ? "page" : undefined,
              }),
              ["Alice"],
            ),
            jd.routerLink(
              ({ isExact }) => ({
                href: "#/user/bob",
                style: {
                  color: isExact ? "#2563eb" : "",
                  fontWeight: isExact ? "700" : "",
                },
                "aria-current": isExact ? "page" : undefined,
              }),
              ["Bob"],
            ),
          ],
        ),
        outlet,
      ]),
    children: [
      {
        index: true,
        element: () =>
          jd.p({ style: { color: "#6b7280" } }, ["Pick a route via the links."]),
      },
      {
        path: "user/:name",
        element: ({ params }) =>
          jd.p({ style: { marginTop: "8px" } }, ["Hello, " + params.name + "!"]),
      },
      { path: "*", element: () => jd.p({ style: { color: "#ef4444" } }, ["No route"]) },
    ],
  },
]);

const app = jd.div({}, [
  jd.h2({}, ["@just-dom/router"]),
  jd.router(routes),
]);

createRoot(mount, app);`,
  },
  {
    label: "Signals (official plugin)",
    value: "signals",
    code: `// ── Signals ──────────────────────────────────────────
const [hello, setHello] = createSignal("World");
const [count, setCount] = createSignal(0);
const [dark, setDark] = createSignal(false);

// computed — derived from other signals
const statusTracker = computed(() => {
  const c = count();
  if (c === 0) return "Start clicking!";
  if (c < 5) return "Warming up…";
  if (c < 10) return "Going strong!";
  return "Legendary 🏆";
});

// ── Helpers ───────────────────────────────────────────
const iconBtn = (label: string, onClick: () => void) =>
  DOM.button({
    onclick: onClick,
    style: {
      width: "40px", height: "40px", borderRadius: "8px",
      border: "1px solid currentColor", background: "transparent",
      color: "inherit", cursor: "pointer", fontSize: "20px",
    },
  }, [label]);

// ── Tree ──────────────────────────────────────────────
// Conditional child — local ref, no wrapper element needed
let badge = null;

const content = DOM.div({ style: { padding: '24px' } }, [
  DOM.div({
    // effect(el, fn) in ref — reactive theme without any external variable
    ref: (el) => {
      effect(el, () => {
        el.style.background = dark() ? "#1e293b" : "#f8fafc";
        el.style.color = dark() ? "#e2e8f0" : "#0f172a";
        el.style.border = \`1px solid \${ dark() ? "#334155" : "#e2e8f0" }\`;
      });
    },
    style: {
      padding: "28px", borderRadius: "14px", maxWidth: "320px",
      fontFamily: "system-ui, sans-serif", transition: "background .2s, color .2s",
    },
  }, [
    // reactive() — live text, updates in place
    DOM.h2({ style: { margin: "0 0 2px", fontSize: "20px" } }, [
      "Hello, ", reactive(hello), "!",
    ]),
    DOM.p({ style: { margin: "0 0 20px", fontSize: "13px", opacity: ".6" } }, [
      reactive(statusTracker),
    ]),

    // Counter row
    DOM.div({ style: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" } }, [
      iconBtn("-", () => setCount((c) => c > 0 ? c - 1 : 0)),
      DOM.span({ style: { minWidth: "52px", textAlign: "center", fontSize: "36px", fontWeight: "700" } }, [
        reactive(count),
      ]),
      iconBtn("+", () => setCount((c) => c + 1)),
    ]),

    // Conditional — badge appears only when count >= 10
    DOM.div({
      ref: (el) => {
        effect(el, () => {
          const next = count() >= 10
            ? DOM.p({ style: { margin: "0 0 12px", fontSize: "13px", color: "#f59e0b" } }, [
              "🏆 Legendary score — nice!",
            ])
            : null;
          badge?.remove();
          badge = next;
          if (next) el.appendChild(next);
        });
      },
    }),

    // Controls
    DOM.div({ style: { display: "flex", gap: "8px", marginBottom: "20px" } }, [
      DOM.button({
        onclick: () => setCount(0),
        style: {
          padding: "6px 14px", borderRadius: "6px", fontSize: "13px",
          border: "1px solid currentColor", background: "transparent",
          color: "inherit", cursor: "pointer",
        },
      }, ["Reset"]),
      DOM.button({
        onclick: () => setDark((d) => !d),
        style: {
          padding: "6px 14px", borderRadius: "6px", fontSize: "13px",
          border: "1px solid currentColor", background: "transparent",
          color: "inherit", cursor: "pointer",
        },
      }, [reactive(() => dark() ? "☀ Light" : "☾ Dark")]),
    ]),

    // Name input
    DOM.div({ style: { display: "flex", flexDirection: "column", gap: "4px" } }, [
      DOM.label({ style: { fontSize: "12px", opacity: ".5" } }, ["Your name"]),
      DOM.input({
        type: "text",
        value: "World",
        oninput: (e: InputEvent & { target: HTMLInputElement }) => setHello(e.target.value || "World"),
        style: {
          padding: "7px 10px", borderRadius: "6px", fontSize: "14px",
          border: "1px solid currentColor", background: "transparent",
          color: "inherit", outline: "none", width: "100%",
        },
      }),
    ]),
  ])
])

createRoot(mount, content);`,
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

const jd = withPlugins(DOM, [badgePlugin]);

const app = jd.div(
  { style: { padding: "24px", fontFamily: "system-ui, sans-serif" } },
  [
    jd.h2({}, ["Plugin System"]),
    jd.p({ style: { marginTop: "12px" } }, [
      "Status: ",
      jd.badge("Active", "#22c55e"),
      " ",
      jd.badge("New"),
      " ",
      jd.badge("Beta", "#f59e0b"),
    ]),
  ]
);

createRoot(mount, app);`,
  },
]
