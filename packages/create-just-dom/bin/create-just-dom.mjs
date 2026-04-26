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
 */
import { spawnSync } from "node:child_process"
import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  rmdirSync,
  writeFileSync,
} from "node:fs"
import { stdin as input, stdout as output } from "node:process"
import { join, resolve } from "node:path"

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
  npm create just-dom@latest [project-name] [options]

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
    projectName: positional[0] ?? "just-dom-app",
    usePnpm,
    useTypescript,
    selectedPlugins,
    cssChoice,
    yes,
    help,
  }
}

function assertValidProjectName(name) {
  if (!name || typeof name !== "string") {
    throw new Error("Invalid project name.")
  }
  if (name === "." || name === "..") {
    throw new Error(`Invalid project name: "${name}"`)
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    throw new Error(
      `Project name "${name}" contains invalid characters. Use letters, numbers, ".", "-", or "_".`
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

function mainTs(cfgExt, cssChoice) {
  const cfgImport = cfgExt === "ts" ? "./jd.config" : "./jd.config.js"
  const withTailwind =
    cssChoice === "tailwind" || cssChoice === "tailwind-daisyui"
  const daisyButtonLine =
    cssChoice === "tailwind-daisyui"
      ? `      jd.button({ className: "btn btn-primary mt-4" }, ["Click me"]),\n`
      : ""
  if (withTailwind) {
    return `import "./style.css";
import { createRoot } from "just-dom";
import { jd } from "${cfgImport}";

createRoot(
  "app",
  jd.div({ className: "min-h-screen bg-gray-50 font-sans" }, [
    jd.div({ className: "max-w-2xl mx-auto px-6 py-8" }, [
      jd.h1({ className: "text-3xl font-bold text-gray-900 mb-3" }, ["Vite + Just DOM"]),
      jd.p({ className: "text-gray-600 leading-relaxed" }, [
        "Edit ",
        jd.code({ className: "bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" }, ["src/main.${cfgExt}"]),
        " to get started. Add plugins in ",
        jd.code({ className: "bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" }, ["src/jd.config.${cfgExt}"]),
        ".",
      ]),
${daisyButtonLine}    ]),
  ]),
);
`
  }
  return `import "./style.css";
import { createRoot } from "just-dom";
import { jd } from "${cfgImport}";

createRoot(
  "app",
  jd.div({ className: "page" }, [
    jd.h1({}, ["Vite + Just DOM"]),
    jd.p({}, [
      "Edit ",
      jd.code({}, ["src/main.${cfgExt}"]),
      " to get started. Add plugins in ",
      jd.code({}, ["src/jd.config.${cfgExt}"]),
      ".",
    ]),
  ]),
);
`
}

function mainJs(cssChoice) {
  const withTailwind =
    cssChoice === "tailwind" || cssChoice === "tailwind-daisyui"
  const daisyButtonLine =
    cssChoice === "tailwind-daisyui"
      ? `      jd.button({ className: "btn btn-primary mt-4" }, ["Click me"]),\n`
      : ""
  if (withTailwind) {
    return `import "./style.css";
import { createRoot } from "just-dom";
import { jd } from "./jd.config.js";

createRoot(
  "app",
  jd.div({ className: "min-h-screen bg-gray-50 font-sans" }, [
    jd.div({ className: "max-w-2xl mx-auto px-6 py-8" }, [
      jd.h1({ className: "text-3xl font-bold text-gray-900 mb-3" }, ["Vite + Just DOM"]),
      jd.p({ className: "text-gray-600 leading-relaxed" }, [
        "Edit ",
        jd.code({ className: "bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" }, ["src/main.js"]),
        " to get started. Add plugins in ",
        jd.code({ className: "bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" }, ["src/jd.config.js"]),
        ".",
      ]),
${daisyButtonLine}    ]),
  ]),
);
`
  }
  return `import "./style.css";
import { createRoot } from "just-dom";
import { jd } from "./jd.config.js";

createRoot(
  "app",
  jd.div({ className: "page" }, [
    jd.h1({}, ["Vite + Just DOM"]),
    jd.p({}, [
      "Edit ",
      jd.code({}, ["src/main.js"]),
      " to get started. Add plugins in ",
      jd.code({}, ["src/jd.config.js"]),
      ".",
    ]),
  ]),
);
`
}

function buildStyleCss(cssChoice) {
  if (cssChoice === "tailwind") {
    return `@import "tailwindcss";\n`
  }
  if (cssChoice === "tailwind-daisyui") {
    return `@import "tailwindcss";\n@plugin "daisyui/index.js";\n`
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

/**
 * Single-screen keynav: radio (◯/●) or multi-select (◇/◆).
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

  let cursor = 0
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
        resolve(state[Math.min(defaultIndex, state.length - 1)]?.id ?? items[0].id)
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
        toggle()
      } else if (key === "\x1b[A") {
        cursor = (cursor - 1 + state.length) % state.length
      } else if (key === "\x1b[B") {
        cursor = (cursor + 1) % state.length
      }
      render()
    }

    process.stdin.on("data", onKey)
  })
}

// ─── Choices resolution ──────────────────────────────────────────────────────

async function resolveChoices(parsed) {
  let useTypescript = parsed.useTypescript
  let selectedPlugins = parsed.selectedPlugins
  let cssChoice = parsed.cssChoice

  const canPrompt = input.isTTY && output.isTTY && !parsed.yes

  if (canPrompt) {
    const needLang = useTypescript === undefined
    const needCss = cssChoice === undefined
    const needPlugins = selectedPlugins === undefined
    if (needLang || needCss || needPlugins) {
      console.log("\n  create-just-dom — a few choices\n")
    }
    try {
      if (needLang) {
        const langId = await promptKeynavScreen({
          title: "Language",
          hint: "↑↓ navigate · space to select · enter confirm",
          kind: "radio",
          defaultIndex: 0,
          items: [
            { id: "typescript", label: "TypeScript (vanilla-ts template)" },
            { id: "javascript", label: "JavaScript (vanilla template)" },
          ],
        })
        useTypescript = langId === "typescript"
      }
      if (needCss) {
        cssChoice = await promptKeynavScreen({
          title: "CSS framework",
          hint: "↑↓ navigate · space to select · enter confirm",
          kind: "radio",
          defaultIndex: 0,
          items: CSS_OPTIONS.map((o) => ({ id: o.id, label: o.label })),
        })
      }
      if (needPlugins) {
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

  const cwd = process.cwd()
  const { projectName, usePnpm } = parsed
  assertValidProjectName(projectName)

  const { useTypescript, selectedPlugins, cssChoice } =
    await resolveChoices(parsed)

  const projectDir = resolve(cwd, projectName)
  if (existsSync(projectDir)) {
    throw new Error(
      `Directory already exists: ${projectDir}\nChoose another name or remove the folder.`
    )
  }

  const viteTemplate = useTypescript ? "vanilla-ts" : "vanilla"
  const langLabel = useTypescript ? "vanilla-ts" : "vanilla (JavaScript)"
  console.log(`\n  Creating Vite (${langLabel}) project "${projectName}"…\n`)
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

  patchIndexHtml(projectDir, projectName)

  const parts = [useTypescript ? "TypeScript" : "JavaScript"]
  if (extraPkgs.length > 0) parts.push(`plugins: ${extraPkgs.join(", ")}`)
  if (cssChoice !== "none") {
    const cssLabel =
      CSS_OPTIONS.find((o) => o.id === cssChoice)?.label ?? cssChoice
    parts.push(cssLabel)
  }
  console.log(`\n  Done. (${parts.join(" · ")})\n`)
  console.log(`    cd ${projectName}`)
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
