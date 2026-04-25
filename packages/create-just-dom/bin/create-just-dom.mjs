#!/usr/bin/env node
/**
 * create-just-dom — Vite + just-dom scaffold
 *
 * Flags (optional; otherwise prompts when TTY):
 *   --ts | --js          Language template
 *   --router | --no-router   Install @just-dom/router
 *   --pnpm               Use pnpm in the new project
 *   -y, --yes            Skip prompts (defaults: TypeScript + router)
 *   -h, --help           Show help
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  rmdirSync,
  writeFileSync,
} from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { join, resolve } from "node:path";

function printHelp() {
  console.log(`
create-just-dom — New Vite project with just-dom and src/jd.config

Usage:
  npm create just-dom@latest [project-name] [options]

Options:
  --ts, --typescript     Use TypeScript (vanilla-ts template)
  --js, --javascript     Use JavaScript (vanilla template)
  --router               Install @just-dom/router and add a starter route table
  --no-router            Only install just-dom (no router package)
  --pnpm                 Use pnpm add inside the new folder (default: npm)
  -y, --yes              Non-interactive: TypeScript + try router (no prompts)
  -h, --help             Show this help

Examples:
  npm create just-dom@latest
  npm create just-dom@latest my-app -- --js --no-router
  npm create just-dom@latest my-app -- --ts --router --pnpm
`);
}

function parseArgs(argv) {
  const rest = argv.slice(2);
  let usePnpm = false;
  let useTypescript = undefined;
  let wantRouter = undefined;
  let yes = false;
  let help = false;
  const positional = [];
  for (const a of rest) {
    if (a === "--pnpm") {
      usePnpm = true;
    } else if (a === "--ts" || a === "--typescript") {
      useTypescript = true;
    } else if (a === "--js" || a === "--javascript") {
      useTypescript = false;
    } else if (a === "--router") {
      wantRouter = true;
    } else if (a === "--no-router") {
      wantRouter = false;
    } else if (a === "-y" || a === "--yes") {
      yes = true;
    } else if (a === "-h" || a === "--help") {
      help = true;
    } else if (!a.startsWith("-")) {
      positional.push(a);
    }
  }
  return {
    projectName: positional[0] ?? "just-dom-app",
    usePnpm,
    useTypescript,
    wantRouter,
    yes,
    help,
  };
}

function assertValidProjectName(name) {
  if (!name || typeof name !== "string") {
    throw new Error("Invalid project name.");
  }
  if (name === "." || name === "..") {
    throw new Error(`Invalid project name: "${name}"`);
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    throw new Error(
      `Project name "${name}" contains invalid characters. Use letters, numbers, ".", "-", or "_".`,
    );
  }
}

function patchIndexHtml(projectDir, title) {
  const indexPath = join(projectDir, "index.html");
  if (!existsSync(indexPath)) {
    return;
  }
  let html = readFileSync(indexPath, "utf8");
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${title.replace(/</g, "")}<\/title>`,
  );
  writeFileSync(indexPath, html, "utf8");
}

function removeStarterFiles(projectDir, useTypescript) {
  const src = join(projectDir, "src");
  const counter = useTypescript ? "counter.ts" : "counter.js";
  const paths = [
    join(src, counter),
    join(src, "assets", "vite.svg"),
    join(src, "assets", useTypescript ? "typescript.svg" : "javascript.svg"),
    join(src, "assets", "hero.png"),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      rmSync(p);
    }
  }
  const assetsDir = join(src, "assets");
  if (existsSync(assetsDir)) {
    try {
      if (readdirSync(assetsDir).length === 0) {
        rmdirSync(assetsDir);
      }
    } catch {
      // ignore
    }
  }
}

const JD_CONFIG_WITH_ROUTER_TS = `import DOM, { withPlugins } from "just-dom";
import { createRouterPlugin } from "@just-dom/router";

export const router = createRouterPlugin();
export const jd = withPlugins(DOM, [router]);

export type Jd = typeof jd;
`;

const JD_CONFIG_WITH_ROUTER_JS = `import DOM, { withPlugins } from "just-dom";
import { createRouterPlugin } from "@just-dom/router";

export const router = createRouterPlugin();
export const jd = withPlugins(DOM, [router]);
`;

const JD_CONFIG_BASE_TS = `import DOM, { withPlugins } from "just-dom";

/**
 * Central app DOM — add official plugins (e.g. \`@just-dom/router\`) here.
 * @see https://just-dom.vercel.app/docs/jd-config
 */
export const jd = withPlugins(DOM, []);

export type Jd = typeof jd;
`;

const JD_CONFIG_BASE_JS = `import DOM, { withPlugins } from "just-dom";

/**
 * Central app DOM — add official plugins (e.g. \`@just-dom/router\`) here.
 * @see https://just-dom.vercel.app/docs/jd-config
 */
export const jd = withPlugins(DOM, []);
`;

function mainTsWithRouter(cfgExt) {
  const cfg = `jd.config.${cfgExt}`;
  const cfgImport = cfgExt === "ts" ? "./jd.config" : "./jd.config.js";
  return `import "./style.css";
import { createRoot } from "just-dom";
import { defineRoutes } from "@just-dom/router";
import { jd } from "${cfgImport}";

const routes = defineRoutes([
  {
    layout: ({ outlet }) =>
      jd.div({ className: "page" }, [
        jd.nav({ className: "nav" }, [
          jd.routerLink({ href: "/" }, ["Home"]),
          jd.routerLink({ href: "/about" }, ["About"]),
        ]),
        outlet,
      ]),
    children: [
      {
        index: true,
        element: () =>
          jd.main({}, [
            jd.h1({}, ["Vite + Just DOM"]),
            jd.p({}, [
              "Edit ",
              jd.code({}, ["src/main.${cfgExt}"]),
              " for routes and ",
              jd.code({}, ["src/${cfg}"]),
              " for plugins.",
            ]),
          ]),
      },
      {
        path: "about",
        element: () =>
          jd.main({}, [
            jd.h1({}, ["About"]),
            jd.p({}, ["This page lives in the same route table as Home."]),
          ]),
      },
      {
        path: "*",
        element: () => jd.main({}, [jd.h1({}, ["Not found"])]),
      },
    ],
  },
]);

createRoot("app", jd.div({ className: "root" }, [jd.router(routes)]));
`;
}

function mainJsWithRouter(cfgExt) {
  const cfg = `jd.config.${cfgExt}`;
  const cfgImport = "./jd.config.js";
  return `import "./style.css";
import { createRoot } from "just-dom";
import { defineRoutes } from "@just-dom/router";
import { jd } from "${cfgImport}";

const routes = defineRoutes([
  {
    layout: ({ outlet }) =>
      jd.div({ className: "page" }, [
        jd.nav({ className: "nav" }, [
          jd.routerLink({ href: "/" }, ["Home"]),
          jd.routerLink({ href: "/about" }, ["About"]),
        ]),
        outlet,
      ]),
    children: [
      {
        index: true,
        element: () =>
          jd.main({}, [
            jd.h1({}, ["Vite + Just DOM"]),
            jd.p({}, [
              "Edit ",
              jd.code({}, ["src/main.js"]),
              " and ",
              jd.code({}, ["src/${cfg}"]),
              ".",
            ]),
          ]),
      },
      {
        path: "about",
        element: () =>
          jd.main({}, [
            jd.h1({}, ["About"]),
            jd.p({}, ["Same route table as Home."]),
          ]),
      },
      {
        path: "*",
        element: () => jd.main({}, [jd.h1({}, ["Not found"])]),
      },
    ],
  },
]);

createRoot("app", jd.div({ className: "root" }, [jd.router(routes)]));
`;
}

function mainTsBase(cfgExt) {
  const cfg = `jd.config.${cfgExt}`;
  const cfgImport = cfgExt === "ts" ? "./jd.config" : "./jd.config.js";
  return `import "./style.css";
import { createRoot } from "just-dom";
import { jd } from "${cfgImport}";

createRoot(
  "app",
  jd.div({ className: "page" }, [
    jd.h1({}, ["Vite + Just DOM"]),
    jd.p({}, [
      "Configure plugins in ",
      jd.code({}, ["src/${cfg}"]),
      ". Add ",
      jd.code({}, ["@just-dom/router"]),
      " and follow ",
      jd.a(
        { href: "https://just-dom.vercel.app/docs/official-plugins/router", target: "_blank" },
        ["the router docs"],
      ),
      ".",
    ]),
  ]),
);
`;
}

function mainJsBase(cfgExt) {
  const cfg = `jd.config.${cfgExt}`;
  const cfgImport = "./jd.config.js";
  return `import "./style.css";
import { createRoot } from "just-dom";
import { jd } from "${cfgImport}";

createRoot(
  "app",
  jd.div({ className: "page" }, [
    jd.h1({}, ["Vite + Just DOM"]),
    jd.p({}, [
      "Configure plugins in ",
      jd.code({}, ["src/${cfg}"]),
      ". Add ",
      jd.code({}, ["@just-dom/router"]),
      " from the docs: ",
      jd.a(
        { href: "https://just-dom.vercel.app/docs/official-plugins/router", target: "_blank" },
        ["Router plugin"],
      ),
      ".",
    ]),
  ]),
);
`;
}

const STYLE_CSS = `:root {
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

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.nav a {
  color: #2563eb;
  text-decoration: none;
}

.nav a:hover {
  text-decoration: underline;
}
`;

function readme({ withRouter, useTypescript }) {
  const mainFile = useTypescript ? "src/main.ts" : "src/main.js";
  const cfgFile = useTypescript ? "src/jd.config.ts" : "src/jd.config.js";
  const routerNote = withRouter
    ? "- **Router:** included — see `" +
      mainFile +
      "` and `@just-dom/router`"
    : "- **Router:** not installed — add `@just-dom/router` when you need it ([docs](https://just-dom.vercel.app/docs/official-plugins/router))";
  const lang = useTypescript ? "TypeScript" : "JavaScript";
  return `# Vite + Just DOM (${lang})

Created with [\`create-just-dom\`](https://www.npmjs.com/package/create-just-dom).

- **Docs:** [just-dom.vercel.app](https://just-dom.vercel.app)
- **App module:** \`${cfgFile}\` — add plugins with \`withPlugins\` here
${routerNote}
- **Entry:** \`${mainFile}\`

## Scripts

\`\`\`bash
npm run dev
npm run build
npm run preview
\`\`\`
`;
}

function run(cmd, args, options) {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(" ")} (exit ${result.status})`);
  }
}

function tryInstallRouterDeps(projectDir, usePnpm) {
  if (usePnpm) {
    const r = spawnSync("pnpm", ["add", "just-dom", "@just-dom/router"], {
      cwd: projectDir,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    return r.status === 0;
  }
  const r = spawnSync("npm", ["install", "just-dom", "@just-dom/router"], {
    cwd: projectDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  return r.status === 0;
}

function installJustDomOnly(projectDir, usePnpm) {
  if (usePnpm) {
    run("pnpm", ["add", "just-dom"], { cwd: projectDir });
  } else {
    run("npm", ["install", "just-dom"], { cwd: projectDir });
  }
}

async function resolveChoices(parsed) {
  let useTypescript = parsed.useTypescript;
  let wantRouter = parsed.wantRouter;

  const canPrompt =
    input.isTTY && output.isTTY && !parsed.yes;

  if (canPrompt && (useTypescript === undefined || wantRouter === undefined)) {
    const rl = createInterface({ input, output });
    try {
      console.log("\n  create-just-dom — a few choices (Enter = default)\n");
      if (useTypescript === undefined) {
        const a = (
          await rl.question("  Use TypeScript? [Y/n] ")
        )
          .trim()
          .toLowerCase();
        useTypescript =
          !a || a === "y" || a === "yes" || a === "ts" || a === "typescript";
      }
      if (wantRouter === undefined) {
        const a = (
          await rl.question("  Install @just-dom/router (SPA links + routes)? [Y/n] ")
        )
          .trim()
          .toLowerCase();
        wantRouter = !a || a === "y" || a === "yes";
      }
    } finally {
      rl.close();
    }
  }

  if (useTypescript === undefined) {
    useTypescript = true;
  }
  if (wantRouter === undefined) {
    wantRouter = true;
  }

  return { useTypescript, wantRouter };
}

async function main() {
  const parsed = parseArgs(process.argv);
  if (parsed.help) {
    printHelp();
    return;
  }

  const cwd = process.cwd();
  const { projectName, usePnpm, yes: skipPrompts } = parsed;
  assertValidProjectName(projectName);

  const { useTypescript, wantRouter } = await resolveChoices(parsed);

  const projectDir = resolve(cwd, projectName);
  if (existsSync(projectDir)) {
    throw new Error(
      `Directory already exists: ${projectDir}\nChoose another name or remove the folder.`,
    );
  }

  const viteTemplate = useTypescript ? "vanilla-ts" : "vanilla";
  const langLabel = useTypescript ? "vanilla-ts" : "vanilla (JavaScript)";
  console.log(`\n  Creating Vite (${langLabel}) project "${projectName}"…\n`);
  run("npm", ["create", "vite@latest", projectName, "--", "--template", viteTemplate], {
    cwd,
  });

  let withRouter = false;
  console.log("\n  Adding just-dom…\n");
  if (wantRouter) {
    console.log("  (trying @just-dom/router as well)\n");
    withRouter = tryInstallRouterDeps(projectDir, usePnpm);
    if (!withRouter) {
      console.warn(
        "\n  Note: @just-dom/router could not be installed from the registry (not published yet or offline).",
      );
      console.warn("  Installing just-dom only. You can add the router later.\n");
      installJustDomOnly(projectDir, usePnpm);
    }
  } else {
    installJustDomOnly(projectDir, usePnpm);
  }

  removeStarterFiles(projectDir, useTypescript);

  const ext = useTypescript ? "ts" : "js";
  const cfgName = `jd.config.${ext}`;
  const mainName = `main.${ext}`;

  let jdBody;
  let mainBody;
  if (withRouter) {
    jdBody = useTypescript ? JD_CONFIG_WITH_ROUTER_TS : JD_CONFIG_WITH_ROUTER_JS;
    mainBody = useTypescript ? mainTsWithRouter(ext) : mainJsWithRouter(ext);
  } else {
    jdBody = useTypescript ? JD_CONFIG_BASE_TS : JD_CONFIG_BASE_JS;
    mainBody = useTypescript ? mainTsBase(ext) : mainJsBase(ext);
  }

  writeFileSync(join(projectDir, "src", cfgName), jdBody, "utf8");
  writeFileSync(join(projectDir, "src", mainName), mainBody, "utf8");
  writeFileSync(join(projectDir, "src", "style.css"), STYLE_CSS, "utf8");
  writeFileSync(
    join(projectDir, "README.md"),
    readme({ withRouter, useTypescript }),
    "utf8",
  );

  patchIndexHtml(projectDir, projectName);

  console.log(`\n  Done. (${useTypescript ? "TypeScript" : "JavaScript"}${withRouter ? ", with router" : ", no router"})\n`);
  console.log(`    cd ${projectName}`);
  if (usePnpm) {
    console.log("    pnpm install   # if the Vite template left the tree incomplete");
    console.log("    pnpm dev\n");
  } else {
    console.log("    npm install    # if the Vite template left the tree incomplete");
    console.log("    npm run dev\n");
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
