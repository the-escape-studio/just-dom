---
name: just-dom
description: "Guides end users of the just-dom library—Vite scaffold via npm create just-dom@latest, jd.config, withPlugins/definePlugin, DOM factories, createRoot, refs, fragments, and scoped @just-dom packages (router, signals, lucide). For a new app from scratch, lead with the create-just-dom CLI before manual setup. App structure: PascalCase reusable UI units, one per kebab-case file under components/. Use when building or explaining a just-dom app, jd.config, plugins, routing, signals, or Lucide icons."
---

# just-dom (libreria, CLI, plugin)

## Progetto da zero — cosa fare per primissima cosa

Se l’utente chiede di **creare un progetto just-dom da zero**, **partire sempre dalla CLI ufficiale**: far eseguire (o proporre e poi eseguire, secondo le regole dell’ambiente) **`npm create just-dom@latest`** con il nome cartella appropriato, oppure **`.`** se la directory è vuota.

- **Non** impostare a mano Vite + `just-dom` + `jd.config` come flusso predefinito se la CLI può farlo, salvo che l’utente chieda esplicitamente integrazione in un repo esistente, vincoli che escludono lo scaffold, o dopo che la CLI è stata proposta e rifiutata.
- Dopo lo scaffold: `cd` nella cartella del progetto, dipendenze se serve, **`npm run dev`** (o equivalente), poi implementare le feature richieste usando **`jd`** da `jd.config`.

Ordine tipico del comando:

```bash
npm create just-dom@latest <nome-cartella>
# oppure, directory corrente vuota:
npm create just-dom@latest .
```

Per automatismi / non interattivo, usare i flag nella sezione **CLI `create-just-dom`** qui sotto.

## Documentazione

- **Sito ufficiale:** [just-dom.vercel.app](https://just-dom.vercel.app) — guide, API reference, plugin.
- **Codice sorgente (riferimento):** [github.com/the-escape-studio/just-dom](https://github.com/the-escape-studio/just-dom)

Per approfondire firme, errori ed esempi, usare le pagine **/docs/** sul sito (es. [Getting Started](https://just-dom.vercel.app/docs/getting-started), [jd.config](https://just-dom.vercel.app/docs/jd-config)).

## Libreria — in sintesi

- **Niente virtual DOM**: si costruisce il **DOM reale**. Nessuna dipendenza runtime aggiuntiva sul core; bundle compatto (ordine di grandezza ~20KB nella doc).
- **Import:** `import DOM from "just-dom"` (default = fabbriche per ogni tag); named: `createRoot`, `createRef`, `createElement`, `withPlugins`, `definePlugin`, `createElFromHTMLString`, tipi, ecc.
- **Figli (`children`):** array di `Node | string | null | undefined` oppure una singola `string`. `null`/`undefined` nell’array utile per **render condizionale**.

### Oggetto `props` unificato

- Attributi nativi (`className`, `href`, …).
- **`style`:** `Partial<CSSStyleDeclaration>`.
- **Eventi:** **`on*`** (`onclick`, `oninput`, …).
- **`data-*`:** chiavi stringa (es. `"data-id"`).
- **`ref`:** oggetto `JDRef<T>` oppure callback `(el) => void`.
- **Attributi booleani:** `true` imposta, `false` rimuove.

### `createRoot`

- `createRoot(container: string | HTMLElement, rootEl: HTMLElement): void` — montaggio nel container (id o elemento).
- **Errore** se l’id non esiste, l’elemento non si trova, o il riferimento è `null`.
- Con plugin: importare **`createRoot`** da `"just-dom"` e costruire l’albero con **`jd`** da `./jd.config`.

### Ref

- **`createRef<"tag">()`:** `.current` tipizzato; `null` fino al mount.
- **Callback ref:** eseguita in modo sincrono dopo gli attributi, **prima** dei figli; adatta a setup una tantum o a `effect` di `@just-dom/signals` legato al nodo.

### `DOM.fragment`

- `DocumentFragment` per raggruppare nodi **senza** elemento wrapper aggiuntivo.

### `createElFromHTMLString`

- Parsing HTML nel browser; utili soprattutto i nodi figli del **body** (il contenuto `head` non viene usato come descritto in doc).
- Restituisce un `DocumentFragment`; dopo `appendChild` sul fragment, i figli si spostano nel DOM parent (comportamento standard).

### Fabbriche tag, SVG e MathML

- **HTML + MathML:** `DOM.<tag>` (es. `DOM.div`, `DOM.math`).
- **SVG:** root **`DOM.svg`**; altri tag: prefisso **`svg`** + CamelCase (es. `DOM.svgCircle`). Per `<a>` in SVG usare **`DOM.svgA`** per non confonderlo con `DOM.a` HTML.
- **`createElement(tag, props, children, namespace?)`:** per tag **condivisi** tra HTML e SVG/MathML (`"a"`, `"script"`, …), il quarto argomento **`"svg"`** / **`"mathml"`** fissa il namespace corretto.

### Plugin

- **`withPlugins(DOM, plugins)`:** copia superficiale di `DOM` + merge di ogni `plugin.extend()` — l’oggetto **`DOM` importato non viene mutato**.
- **`definePlugin({ name, extend })`:** i metodi esposti da **`extend`** devono essere **funzioni**.

## `jd.config` — convenzione app

- Non c’è caricamento magico del file: è un **modulo** che l’app importa esplicitamente.
- Tenere il file **piccolo**: solo `just-dom`, plugin, eventuali costanti condivise. **Evitare** di importare `main`, la tabella route o schermate che importano a loro volta `jd.config` (rischio **import circolari**).
- Pattern tipico:

```ts
import DOM, { withPlugins } from "just-dom";
import { createRouterPlugin } from "@just-dom/router";

const router = createRouterPlugin();
export const jd = withPlugins(DOM, [router]);
export type Jd = typeof jd;
```

- **`main`:** `createRoot` da `"just-dom"`, **`jd`** da `./jd.config`.
- **Altri moduli UI:** **`import { jd } from "<path>/jd.config"`** — non usare solo `DOM` se servono metodi dei plugin.
- **Router:** `defineRoutes` di solito in `main` (o in file non importati da `jd.config`). Pattern `homePage(jd)` solo per spezzare dipendenze circolari (spiegato nella doc App setup).

## TypeScript

- Tipi inclusi in `just-dom`; **nessun** `@types/just-dom` separato.
- Ogni `DOM.<tag>` restituisce l’**elemento specifico**.
- **`export type Jd = typeof jd`** per funzioni helper che devono vedere tutti i plugin.
- Tipi esportati utili: `JDAllTags`, `JDTagsMap`, `JDCreateElementOptions<T>`, `JDCreateElementChildren`, `JDRef<T>`, `JDom`, `JDElementNamespace`, `JD_NAMESPACES`, `elementIsSvgOrMathML`, ecc. (vedi [TypeScript](https://just-dom.vercel.app/docs/typescript)).

## Best practice — componenti nelle app

1. **PascalCase** per le unità riusabili (funzioni che restituiscono `HTMLElement` o alberi just-dom): es. `Header`, `TodoItem`.
2. **Un componente per file** sotto **`components/`**, nome file in **kebab-case** (es. `components/header.ts`, `components/todo-list.ts`), con **export** riutilizzabili.

## CLI `create-just-dom`

```bash
npm create just-dom@latest [my-app|.|path]
```

- **Interattivo (TTY):** **Linguaggio** (TS/JS) → **CSS** (nessuno, Tailwind v4, Tailwind+DaisyUI) → **Plugin** (multi-select). **↑/↓**, **Space**, **Enter**.
- **Non interattivo:** `--yes` / `-y` o flag espliciti.

| Flag                                             | Effetto                                                   |
| ------------------------------------------------ | --------------------------------------------------------- |
| `--ts` / `--typescript`                          | template Vite `vanilla-ts`                                |
| `--js` / `--javascript`                          | template `vanilla` (.js)                                  |
| `--plugins=<list>`                               | `router`, `signals`, `lucide` (comma-separated)           |
| `--no-plugins`                                   | solo `just-dom`                                           |
| `--css=none` \| `tailwind` \| `tailwind-daisyui` | stack CSS                                                 |
| `--no-css`                                       | come `--css=none`                                         |
| `--pnpm`                                         | usa `pnpm add` nel progetto nuovo                         |
| `-y` / `--yes`                                   | salta prompt (default: **TS**, nessun plugin, nessun CSS) |

Se **stdin non è TTY** e mancano flag: default **TypeScript**, nessun plugin, nessun CSS.

Lo scaffold usa **`npm create vite@latest`** in modalità non interattiva. Valori **`--plugins`** / **`--css`** non riconosciuti → warning in console e valore ignorato.

## Plugin ufficiali — punti operativi

| Pacchetto           | Registrazione tipica                                                                                                | Note                                                                                                                                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@just-dom/router`  | `createRouterPlugin()` in `jd.config`; **`defineRoutes([...])`** in `main` (o moduli che non importano `jd.config`) | Usare **`jd.routerLink`** per navigazione SPA (l’`a` HTML resta per link generici). Modalità **`hash`** utile senza fallback SPA lato server. Route: `path`, `index`, `layout`, `element`, `children`; **`path: "*"`** di solito ultimo tra fratelli. Peer: `just-dom`. |
| `@just-dom/signals` | import da `@just-dom/signals` dove serve                                                                            | **`createSignal`**, **`computed`**, **`reactive`**, **`effect`** (forma `effect(el, fn)` per legare il ciclo di vita al nodo). Scrittura dello stesso valore → nessun re-run degli effetti.                                                                             |
| `@just-dom/lucide`  | `createLucidePlugin({ icons: { … } })` oppure plugin “full set” come negli starter                                  | **`jd.lucide("NomeIcona", options)`**. Per bundle ridotti: solo le icone importate da `lucide` nel config del plugin.                                                                                                                                                   |

Registrare i plugin **solo** in **`jd.config`** tramite `withPlugins`.

## Cosa evitare

- Confondere **altre CLI** di tooling del sito doc con **`create-just-dom`** — il comando per un nuovo progetto è **`npm create just-dom@latest`**.
- Usare **`DOM`** al posto di **`jd`** nei file dell’app quando sono attivi plugin: si perdono i metodi aggiunti (`routerLink`, `lucide`, ecc.).
- Avviare un nuovo progetto appena con **`npm create vite@latest`** ignorando **`npm create just-dom@latest`** quando serve proprio lo scaffold just-dom.
- Costruire SVG a mano ignorando le fabbriche **`DOM.svg`**, **`DOM.svgCircle`**, ecc., senza una ragione precisa.
