#!/usr/bin/env node
/**
 * create-just-dom — Vite + just-dom scaffold
 *
 * Flags (optional; otherwise prompts when TTY, in order: language, CSS, plugins):
 *   --ts | --js             Language template
 *   --plugins=<list>        Comma-separated plugins (router,signals,lucide)
 *   --no-plugins            Install no plugins
 *   --css=<option>          CSS framework: tailwind | tailwind-daisyui | none
 *   --no-css                No CSS framework (same as --css=none)
 *   --pnpm                  Use pnpm in the new project
 *   -y, --yes               Skip prompts (TypeScript, no CSS, no plugins)
 *   -h, --help              Show help
 *
 * Project name "." scaffolds into the invocation directory (must be empty). When started via
 * `pnpm run` / `npm run`, that is INIT_CWD (where you ran the command), not the package root.
 */
import { spawnSync } from "node:child_process"
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  rmdirSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { createInterface } from "node:readline"
import { stdin as input, stdout as output } from "node:process"
import { basename, join, resolve } from "node:path"

const OFFICIAL_PLUGINS = [
  {
    id: "router",
    pkg: "@just-dom/router",
    label: "@just-dom/router   — client-side SPA navigation",
    importLine: `import { createRouterPlugin } from "@just-dom/router";`,
    setupLine: `const router = createRouterPlugin();`,
    pluginVar: "router",
  },
  {
    id: "signals",
    pkg: "@just-dom/signals",
    label: "@just-dom/signals  — fine-grained reactive state",
    importLine: null,
    setupLine: null,
    pluginVar: null,
    configNote: `// @just-dom/signals — import { createSignal, reactive, effect, computed } where needed`,
  },
  {
    id: "lucide",
    pkg: "@just-dom/lucide",
    label: "@just-dom/lucide   — Lucide icons integration",
    importLine: `import { lucidePlugin } from "@just-dom/lucide";`,
    setupLine: null,
    pluginVar: "lucidePlugin",
  },
]

const CSS_OPTIONS = [
  { id: "none", label: "none" },
  { id: "tailwind", label: "tailwindcss v4" },
  { id: "tailwind-daisyui", label: "tailwindcss v4 + daisyui" },
]

function printHelp() {
  const pluginList = OFFICIAL_PLUGINS.map((p) => `    ${p.id}`).join("\n")
  const cssList = CSS_OPTIONS.map((o) => `    ${o.id}`).join("\n")
  console.log(`
create-just-dom — New Vite project with just-dom and src/jd.config

Usage:
  npm create just-dom@latest [project-name | .] [options]

  Use "." as the project name to generate files in the current directory (folder must be empty).

Options:
  --ts, --typescript     Use TypeScript (vanilla-ts template)
  --js, --javascript     Use JavaScript (vanilla template)
  --plugins=<list>       Comma-separated plugins to install:
${pluginList}
  --no-plugins           Install no plugins
  --css=<option>         CSS framework:
${cssList}
  --no-css               No CSS framework
  --pnpm                 Use pnpm inside the new folder (default: npm)
  -y, --yes              Non-interactive: TypeScript, no plugins, no CSS
  -h, --help             Show this help

Examples:
  npm create just-dom@latest
  npm create just-dom@latest .    # scaffold into the current directory (must be empty)
  npm create just-dom@latest my-app -- --js --no-plugins --no-css
  npm create just-dom@latest my-app -- --ts --plugins=router --css=tailwind-daisyui --pnpm
`)
}

function parseArgs(argv) {
  const rest = argv.slice(2)
  let usePnpm = false
  let useTypescript = undefined
  let selectedPlugins = undefined
  let cssChoice = undefined
  let yes = false
  let help = false
  const positional = []
  for (const a of rest) {
    if (a === "--pnpm") {
      usePnpm = true
    } else if (a === "--ts" || a === "--typescript") {
      useTypescript = true
    } else if (a === "--js" || a === "--javascript") {
      useTypescript = false
    } else if (a.startsWith("--plugins=")) {
      const val = a.slice("--plugins=".length)
      selectedPlugins = val
        ? val
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    } else if (a === "--no-plugins") {
      selectedPlugins = []
    } else if (a.startsWith("--css=")) {
      cssChoice = a.slice("--css=".length)
    } else if (a === "--no-css") {
      cssChoice = "none"
    } else if (a === "-y" || a === "--yes") {
      yes = true
    } else if (a === "-h" || a === "--help") {
      help = true
    } else if (!a.startsWith("-")) {
      positional.push(a)
    }
  }
  return {
    projectName: positional[0],
    usePnpm,
    useTypescript,
    selectedPlugins,
    cssChoice,
    yes,
    help,
  }
}

/**
 * Base directory for resolving project paths. `pnpm`/`npm run` set INIT_CWD to the shell
 * directory where the user invoked the script; the Node process cwd is the package root.
 */
function getRunBaseDir() {
  const init = process.env.INIT_CWD
  if (init && typeof init === "string") {
    const resolved = resolve(init)
    try {
      if (statSync(resolved).isDirectory()) return resolved
    } catch {
      // invalid or missing path
    }
  }
  return process.cwd()
}

function assertValidProjectName(name) {
  if (!name || typeof name !== "string") {
    throw new Error("Invalid project name.")
  }
  if (name === "..") {
    throw new Error(`Invalid project name: "${name}"`)
  }
  if (name === ".") {
    return
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    throw new Error(
      `Project name "${name}" contains invalid characters. Use letters, numbers, ".", "-", or "_".`
    )
  }
}

function assertScaffoldTargetDir(projectDir, projectName) {
  if (projectName === ".") {
    let entries
    try {
      entries = readdirSync(projectDir)
    } catch {
      throw new Error(`Cannot read directory: ${projectDir}`)
    }
    if (entries.length > 0) {
      throw new Error(
        `Cannot scaffold into ".": directory is not empty (${entries.length} item(s)). Use an empty folder or pass a subdirectory name.`
      )
    }
    return
  }
  if (existsSync(projectDir)) {
    throw new Error(
      `Directory already exists: ${projectDir}\nChoose another name or remove the folder.`
    )
  }
}

function patchIndexHtml(projectDir, title) {
  const indexPath = join(projectDir, "index.html")
  if (!existsSync(indexPath)) return
  let html = readFileSync(indexPath, "utf8")
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${title.replace(/</g, "")}<\/title>`
  )
  writeFileSync(indexPath, html, "utf8")
}

function removeStarterFiles(projectDir, useTypescript) {
  const src = join(projectDir, "src")
  const counter = useTypescript ? "counter.ts" : "counter.js"
  const paths = [
    join(src, counter),
    join(src, "assets", "vite.svg"),
    join(src, "assets", useTypescript ? "typescript.svg" : "javascript.svg"),
    join(src, "assets", "hero.png"),
  ]
  for (const p of paths) {
    if (existsSync(p)) rmSync(p)
  }
  const assetsDir = join(src, "assets")
  if (existsSync(assetsDir)) {
    try {
      if (readdirSync(assetsDir).length === 0) rmdirSync(assetsDir)
    } catch {
      // ignore
    }
  }
}

// ─── jd.config ──────────────────────────────────────────────────────────────

function buildJdConfig(selectedIds, useTypescript) {
  const plugins = OFFICIAL_PLUGINS.filter((p) => selectedIds.includes(p.id))
  const withPluginsItems = plugins.filter((p) => p.pluginVar !== null)
  const signalsPlugin = plugins.find((p) => p.id === "signals")

  const lines = []

  lines.push(`import DOM, { withPlugins } from "just-dom";`)
  for (const p of withPluginsItems) lines.push(p.importLine)
  lines.push("")

  if (plugins.length === 0) {
    lines.push("/**")
    lines.push(
      " * Central app DOM — add official plugins (e.g. `@just-dom/router`) here."
    )
    lines.push(" * @see https://just-dom.vercel.app/docs/jd-config")
    lines.push(" */")
  }

  const setupLines = withPluginsItems.filter((p) => p.setupLine)
  for (const p of setupLines) lines.push(p.setupLine)
  if (setupLines.length > 0) lines.push("")

  if (signalsPlugin) {
    lines.push(signalsPlugin.configNote)
    lines.push("")
  }

  const pluginVars = withPluginsItems.map((p) => p.pluginVar).join(", ")
  lines.push(`export const jd = withPlugins(DOM, [${pluginVars}]);`)

  if (useTypescript) {
    lines.push("")
    lines.push(`export type Jd = typeof jd;`)
  }

  return lines.join("\n") + "\n"
}

// ─── File templates ──────────────────────────────────────────────────────────

const VITE_CONFIG = `import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
`

/** Theme + DaisyUI toggle — written to \`src/components/theme-toggle.{ts,js}\` when using daisyUI. */
function buildThemeToggleSource(useTypescript) {
  const jdConfigImport = useTypescript ? "../jd.config" : "../jd.config.js"
  const themeParam = useTypescript ? "theme: string" : "theme"
  return `import { jd } from "${jdConfigImport}";

const THEME_KEY = "jd-theme";

export function readStoredTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "dark" || v === "light") return v;
  } catch {}
  return "light";
}

export function applyTheme(${themeParam}) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

export function themeToggleButton() {
  return jd.button(
    {
      type: "button",
      className: "btn btn-ghost btn-circle",
      ariaLabel: "Toggle theme",
      onclick: () => {
        const next =
          document.documentElement.getAttribute("data-theme") === "dark"
            ? "light"
            : "dark";
        applyTheme(next);
      },
    },
    [
      jd.span({ className: "hidden dark:inline" }, [
        jd.svg(
          {
            viewBox: "0 0 24 24",
            width: "20",
            height: "20",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            ariaHidden: "true",
          },
          [
            jd.svgPath({
              d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9",
            }),
          ],
        ),
      ]),
      jd.span({ className: "inline dark:hidden" }, [
        jd.svg(
          {
            viewBox: "0 0 24 24",
            width: "20",
            height: "20",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            ariaHidden: "true",
          },
          [
            jd.svgCircle({ cx: "12", cy: "12", r: "4" }),
            jd.svgPath({
              d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41",
            }),
          ],
        ),
      ]),
    ],
  );
}
`
}

function buildMainSource({
  cfgImport,
  mainEntryFile,
  cfgEntryFile,
  cssChoice,
}) {
  if (cssChoice === "none") {
    return `import "./style.css";
import { createRoot } from "just-dom";
import { jd } from "${cfgImport}";

createRoot(
  "app",
  jd.div({ className: "page" }, [
    jd.h1({}, ["Vite + Just DOM"]),
    jd.p({}, [
      "Edit ",
      jd.code({}, ["${mainEntryFile}"]),
      " to get started. Add plugins in ",
      jd.code({}, ["${cfgEntryFile}"]),
      ".",
    ]),
  ]),
);
`
  }

  if (cssChoice === "tailwind") {
    return `import "./style.css";
import { createRoot } from "just-dom";
import { jd } from "${cfgImport}";

createRoot(
  "app",
  jd.div({ className: "min-h-screen font-sans" }, [
    jd.div({ className: "max-w-2xl mx-auto px-6 py-8" }, [
      jd.h1({ className: "text-3xl font-bold mb-3" }, ["Vite + Just DOM"]),
      jd.p({ className: "leading-relaxed" }, [
        "Edit ",
        jd.code({ className: "font-mono rounded px-1.5 py-0.5 text-sm" }, ["${mainEntryFile}"]),
        " to get started. Add plugins in ",
        jd.code({ className: "font-mono rounded px-1.5 py-0.5 text-sm" }, ["${cfgEntryFile}"]),
        ".",
      ]),
    ]),
  ]),
);
`
  }

  return `import "./style.css";
import { createRoot } from "just-dom";
import { jd } from "${cfgImport}";
import {
  applyTheme,
  readStoredTheme,
  themeToggleButton,
} from "./components/theme-toggle";

applyTheme(readStoredTheme());

createRoot(
  "app",
  jd.div({ className: "min-h-screen bg-base-100 text-base-content font-sans" }, [
    jd.div({ className: "max-w-2xl mx-auto px-6 py-8" }, [
      jd.div({ className: "flex items-center justify-between gap-3 mb-3" }, [
        jd.h1({ className: "text-3xl font-bold" }, ["Vite + Just DOM"]),
        themeToggleButton(),
      ]),
      jd.p({ className: "text-base-content/70 leading-relaxed" }, [
        "Edit ",
        jd.code(
          {
            className:
              "bg-base-200 text-base-content rounded px-1.5 py-0.5 text-sm font-mono",
          },
          ["${mainEntryFile}"],
        ),
        " to get started. Add plugins in ",
        jd.code(
          {
            className:
              "bg-base-200 text-base-content rounded px-1.5 py-0.5 text-sm font-mono",
          },
          ["${cfgEntryFile}"],
        ),
        ".",
      ]),
      jd.button({ className: "btn btn-primary mt-4" }, ["Click me"]),
    ]),
  ]),
);
`
}

function mainTs(cfgExt, cssChoice) {
  const cfgImport = cfgExt === "ts" ? "./jd.config" : "./jd.config.js"
  return buildMainSource({
    cfgImport,
    mainEntryFile: `src/main.${cfgExt}`,
    cfgEntryFile: `src/jd.config.${cfgExt}`,
    cssChoice,
  })
}

function mainJs(cssChoice) {
  return buildMainSource({
    cfgImport: "./jd.config.js",
    mainEntryFile: "src/main.js",
    cfgEntryFile: "src/jd.config.js",
    cssChoice,
  })
}

function buildStyleCss(cssChoice) {
  if (cssChoice === "tailwind") {
    return `@import "tailwindcss";\n`
  }
  if (cssChoice === "tailwind-daisyui") {
    return `@import "tailwindcss";\n@plugin "daisyui/index.js" {
  themes:
    light --default,
    dark;
}

@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
`
  }
  return `:root {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  color: #111827;
  background: #f9fafb;
}

body {
  margin: 0;
}

.root {
  min-height: 100vh;
}

.page {
  max-width: 42rem;
  margin: 0 auto;
  padding: 1.5rem;
}
`
}

function readme({ selectedPlugins, cssChoice, useTypescript }) {
  const mainFile = useTypescript ? "src/main.ts" : "src/main.js"
  const cfgFile = useTypescript ? "src/jd.config.ts" : "src/jd.config.js"
  const lang = useTypescript ? "TypeScript" : "JavaScript"

  const pluginLines =
    selectedPlugins.length === 0
      ? "- **Plugins:** none — browse [official plugins](https://just-dom.vercel.app/docs/official-plugins) when you need them"
      : selectedPlugins
          .map((id) => {
            const p = OFFICIAL_PLUGINS.find((x) => x.id === id)
            return `- **${p.pkg}:** installed`
          })
          .join("\n")

  const cssLine =
    cssChoice === "tailwind"
      ? "- **Tailwind CSS v4:** installed (`@tailwindcss/vite` Vite plugin)"
      : cssChoice === "tailwind-daisyui"
        ? "- **Tailwind CSS v4 + DaisyUI:** installed"
        : ""

  return `# Vite + Just DOM (${lang})

Created with [\`create-just-dom\`](https://www.npmjs.com/package/create-just-dom).

- **Docs:** [just-dom.vercel.app](https://just-dom.vercel.app)
- **App module:** \`${cfgFile}\` — plugins configured here
${pluginLines}${cssLine ? "\n" + cssLine : ""}
- **Entry:** \`${mainFile}\`

## Scripts

\`\`\`bash
npm run dev
npm run build
npm run preview
\`\`\`
`
}

// ─── Install helpers ─────────────────────────────────────────────────────────

function run(cmd, args, options) {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(
      `Command failed: ${cmd} ${args.join(" ")} (exit ${result.status})`
    )
  }
}

function installPackages(projectDir, usePnpm, extra = []) {
  const pkgs = ["just-dom", ...extra]
  if (usePnpm) {
    run("pnpm", ["add", ...pkgs], { cwd: projectDir })
  } else {
    run("npm", ["install", ...pkgs], { cwd: projectDir })
  }
}

function installDevPackages(projectDir, usePnpm, pkgs) {
  if (usePnpm) {
    run("pnpm", ["add", "-D", ...pkgs], { cwd: projectDir })
  } else {
    run("npm", ["install", "--save-dev", ...pkgs], { cwd: projectDir })
  }
}

// ─── Interactive UI ──────────────────────────────────────────────────────────

async function promptText({ message, defaultValue = "" }) {
  return new Promise((resolve) => {
    const rl = createInterface({ input, output })
    const hint = defaultValue ? ` (${defaultValue})` : ""
    rl.question(`  ${message}${hint}: `, (answer) => {
      rl.close()
      resolve(answer.trim() || defaultValue)
    })
  })
}

/**
 * Single-screen keynav: radio (◯/●) or multi-select (◇/◆).
 *
 * Radio: arrows move + auto-select, enter confirms.
 * Multiselect: arrows move, space toggles, enter confirms.
 *
 * @param {{ title: string, hint: string, kind: "radio" | "multiselect", items: { id: string, label: string }[], defaultIndex?: number }} opts
 * @returns {Promise<string | string[]>} Selected id (radio) or id[] (multiselect)
 */
async function promptKeynavScreen(opts) {
  const { title, hint, kind, items, defaultIndex = 0 } = opts
  const state = items.map((it, i) => ({
    id: it.id,
    label: it.label,
    selected: kind === "radio" ? i === defaultIndex : false,
  }))

  let cursor = defaultIndex
  let firstRender = true
  let lineCount = 0

  const RESET = "\x1b[0m"
  const BOLD = "\x1b[1m"
  const DIM = "\x1b[2m"
  const CYAN = "\x1b[36m"

  function render() {
    if (!firstRender) process.stdout.write(`\x1b[${lineCount}A`)
    firstRender = false
    let n = 0
    const line = (s) => {
      process.stdout.write(`\x1b[2K\r${s}\n`)
      n++
    }
    line(`  ${BOLD}${title}${RESET}`)
    line("")
    line(`  ${DIM}${hint}${RESET}`)
    line("")
    for (let i = 0; i < state.length; i++) {
      const item = state[i]
      const isRadio = kind === "radio"
      const check = isRadio
        ? item.selected
          ? "●"
          : "◯"
        : item.selected
          ? "◆"
          : "◇"
      const isActive = i === cursor
      const text = isActive
        ? `  ${CYAN}${check} ${item.label}${RESET}`
        : `  ${DIM}${check}${RESET} ${item.label}`
      line(text)
    }
    lineCount = n
  }

  function toggle() {
    const item = state[cursor]
    if (kind === "radio") {
      for (const it of state) it.selected = false
      item.selected = true
    } else {
      item.selected = !item.selected
    }
  }

  render()

  return new Promise((resolve, reject) => {
    if (typeof process.stdin.setRawMode !== "function") {
      process.stdout.write("\n")
      if (kind === "radio") {
        resolve(
          state[Math.min(defaultIndex, state.length - 1)]?.id ?? items[0].id
        )
      } else {
        resolve([])
      }
      return
    }

    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding("utf8")

    function cleanup() {
      process.stdin.setRawMode(false)
      process.stdin.pause()
      process.stdin.removeListener("data", onKey)
    }

    function onKey(key) {
      if (key === "\x03") {
        cleanup()
        process.stdout.write("\n")
        reject(new Error("Aborted."))
        return
      }
      if (key === "\r" || key === "\n") {
        cleanup()
        process.stdout.write("\n")
        if (kind === "radio") {
          resolve(state.find((s) => s.selected)?.id ?? state[0].id)
        } else {
          resolve(state.filter((s) => s.selected).map((s) => s.id))
        }
        return
      }
      if (key === " ") {
        if (kind === "multiselect") toggle()
      } else if (key === "\x1b[A") {
        cursor = (cursor - 1 + state.length) % state.length
        if (kind === "radio") toggle()
      } else if (key === "\x1b[B") {
        cursor = (cursor + 1) % state.length
        if (kind === "radio") toggle()
      }
      render()
    }

    process.stdin.on("data", onKey)
  })
}

// ─── Choices resolution ──────────────────────────────────────────────────────

async function resolveChoices(parsed, canPrompt) {
  let useTypescript = parsed.useTypescript
  let selectedPlugins = parsed.selectedPlugins
  let cssChoice = parsed.cssChoice

  if (canPrompt) {
    try {
      if (useTypescript === undefined) {
        const langId = await promptKeynavScreen({
          title: "Language",
          hint: "↑↓ navigate · enter confirm",
          kind: "radio",
          defaultIndex: 0,
          items: [
            { id: "typescript", label: "TypeScript (vanilla-ts template)" },
            { id: "javascript", label: "JavaScript (vanilla template)" },
          ],
        })
        useTypescript = langId === "typescript"
      }
      if (cssChoice === undefined) {
        cssChoice = await promptKeynavScreen({
          title: "CSS framework",
          hint: "↑↓ navigate · enter confirm",
          kind: "radio",
          defaultIndex: 0,
          items: CSS_OPTIONS.map((o) => ({ id: o.id, label: o.label })),
        })
      }
      if (selectedPlugins === undefined) {
        selectedPlugins = await promptKeynavScreen({
          title: "Plugins (optional)",
          hint: "↑↓ navigate · space toggle · enter confirm",
          kind: "multiselect",
          items: OFFICIAL_PLUGINS.map((p) => ({ id: p.id, label: p.label })),
        })
      }
    } catch (e) {
      if (e instanceof Error && e.message === "Aborted.") process.exit(1)
      throw e
    }
  }

  if (useTypescript === undefined) useTypescript = true
  if (selectedPlugins === undefined) selectedPlugins = []
  if (cssChoice === undefined) cssChoice = "none"

  // Validate plugin IDs
  const validPluginIds = OFFICIAL_PLUGINS.map((p) => p.id)
  const unknown = selectedPlugins.filter((id) => !validPluginIds.includes(id))
  if (unknown.length > 0) {
    console.warn(
      `\n  Warning: unknown plugin(s): ${unknown.join(", ")}. Valid: ${validPluginIds.join(", ")}\n`
    )
    selectedPlugins = selectedPlugins.filter((id) =>
      validPluginIds.includes(id)
    )
  }

  // Validate CSS choice
  const validCssIds = CSS_OPTIONS.map((o) => o.id)
  if (!validCssIds.includes(cssChoice)) {
    console.warn(
      `\n  Warning: unknown --css value "${cssChoice}". Valid: ${validCssIds.join(", ")}. Defaulting to none.\n`
    )
    cssChoice = "none"
  }

  return { useTypescript, selectedPlugins, cssChoice }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const parsed = parseArgs(process.argv)
  if (parsed.help) {
    printHelp()
    return
  }

  const cwd = getRunBaseDir()
  const { usePnpm } = parsed
  let { projectName } = parsed

  const canPrompt = input.isTTY && output.isTTY && !parsed.yes

  const needsNamePrompt = projectName === undefined && canPrompt
  const needsOtherPrompts =
    canPrompt &&
    (parsed.useTypescript === undefined ||
      parsed.cssChoice === undefined ||
      parsed.selectedPlugins === undefined)

  if (needsNamePrompt || needsOtherPrompts) {
    console.log("\n  create-just-dom — a few choices\n")
  }

  if (needsNamePrompt) {
    projectName = await promptText({
      message: "Project name (use . for current directory)",
      defaultValue: "just-dom-app",
    })
  } else if (projectName === undefined) {
    projectName = "just-dom-app"
  }

  assertValidProjectName(projectName)

  const { useTypescript, selectedPlugins, cssChoice } = await resolveChoices(
    parsed,
    canPrompt
  )

  const projectDir = resolve(cwd, projectName)
  assertScaffoldTargetDir(projectDir, projectName)

  const viteTemplate = useTypescript ? "vanilla-ts" : "vanilla"
  const langLabel = useTypescript ? "vanilla-ts" : "vanilla (JavaScript)"
  const createLabel =
    projectName === "."
      ? `in current directory (${basename(projectDir)})`
      : `"${projectName}"`
  console.log(`\n  Creating Vite (${langLabel}) project ${createLabel}…\n`)
  run(
    "npm",
    [
      "create",
      "vite@latest",
      projectName,
      "--",
      "--template",
      viteTemplate,
      "--no-interactive",
    ],
    { cwd }
  )

  const extraPkgs = selectedPlugins.map(
    (id) => OFFICIAL_PLUGINS.find((p) => p.id === id).pkg
  )
  if (extraPkgs.length > 0) {
    console.log(`\n  Adding just-dom + ${extraPkgs.join(", ")}…\n`)
  } else {
    console.log("\n  Adding just-dom…\n")
  }
  installPackages(projectDir, usePnpm, extraPkgs)

  if (cssChoice === "tailwind") {
    console.log("\n  Adding tailwindcss, @tailwindcss/vite…\n")
    installDevPackages(projectDir, usePnpm, [
      "tailwindcss",
      "@tailwindcss/vite",
    ])
  } else if (cssChoice === "tailwind-daisyui") {
    console.log("\n  Adding tailwindcss, @tailwindcss/vite, daisyui…\n")
    installDevPackages(projectDir, usePnpm, [
      "tailwindcss",
      "@tailwindcss/vite",
      "daisyui",
    ])
  }

  removeStarterFiles(projectDir, useTypescript)

  const ext = useTypescript ? "ts" : "js"
  const withTailwind = cssChoice !== "none"

  writeFileSync(
    join(projectDir, "src", `jd.config.${ext}`),
    buildJdConfig(selectedPlugins, useTypescript),
    "utf8"
  )
  writeFileSync(
    join(projectDir, "src", `main.${ext}`),
    useTypescript ? mainTs(ext, cssChoice) : mainJs(cssChoice),
    "utf8"
  )
  if (cssChoice === "tailwind-daisyui") {
    const componentsDir = join(projectDir, "src", "components")
    mkdirSync(componentsDir, { recursive: true })
    writeFileSync(
      join(componentsDir, `theme-toggle.${ext}`),
      buildThemeToggleSource(useTypescript),
      "utf8"
    )
  }
  writeFileSync(
    join(projectDir, "src", "style.css"),
    buildStyleCss(cssChoice),
    "utf8"
  )

  if (withTailwind) {
    writeFileSync(join(projectDir, `vite.config.${ext}`), VITE_CONFIG, "utf8")
  }

  writeFileSync(
    join(projectDir, "README.md"),
    readme({ selectedPlugins, cssChoice, useTypescript }),
    "utf8"
  )

  const htmlTitle = projectName === "." ? basename(projectDir) : projectName
  patchIndexHtml(projectDir, htmlTitle)

  const parts = [useTypescript ? "TypeScript" : "JavaScript"]
  if (extraPkgs.length > 0) parts.push(`plugins: ${extraPkgs.join(", ")}`)
  if (cssChoice !== "none") {
    const cssLabel =
      CSS_OPTIONS.find((o) => o.id === cssChoice)?.label ?? cssChoice
    parts.push(cssLabel)
  }
  console.log(`\n  Done. (${parts.join(" · ")})\n`)
  if (projectName !== ".") {
    console.log(`    cd ${projectName}`)
  }
  if (usePnpm) {
    console.log(
      "    pnpm install   # if the Vite template left the tree incomplete"
    )
    console.log("    pnpm dev\n")
  } else {
    console.log(
      "    npm install    # if the Vite template left the tree incomplete"
    )
    console.log("    npm run dev\n")
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
