# @just-dom/signals

Fine-grained reactive signals for [Just DOM](https://just-dom.vercel.app).

A single source of truth that keeps data and UI in sync automatically — no manual subscription lists, no full re-renders.

## Install

```bash
npm install @just-dom/signals
```

No peer dependencies.

## Usage

```ts
import DOM, { createRoot } from "just-dom";
import { createSignal, computed, reactive, effect } from "@just-dom/signals";

const [count, setCount] = createSignal(0);
const double = computed(() => count() * 2);

const app = DOM.div({}, [
  DOM.button({ onclick: () => setCount((c) => c - 1) }, ["-"]),
  DOM.span({}, [reactive(count)]),
  DOM.button({ onclick: () => setCount((c) => c + 1) }, ["+"]),
  DOM.p({}, ["doubled: ", reactive(double)]),
]);

createRoot("app", app);
```

## API

### `createSignal<T>(initial)`

Returns `[get, set]`. Reading `get()` inside an `effect` or `computed` subscribes automatically. Writing the same value (`Object.is`) is a no-op.

```ts
const [name, setName] = createSignal("world");
setName("just-dom");           // direct value
setName((prev) => prev + "!"); // updater function
```

### `effect(fn)` / `effect(el, fn)`

Runs `fn` immediately and re-runs it whenever any signal read inside changes.

```ts
// Manual dispose — call stop() when you remove the element
const stop = effect(() => {
  btn.className = active() ? "on" : "off";
});
stop();
```

Pass an element as first argument and the effect self-disposes automatically when that element leaves the live document:

```ts
DOM.button({
  ref: (el) => {
    effect(el, () => {
      el.className = active() ? "on" : "off";
      el.disabled  = !active();
    });
  },
  onclick: () => setActive((a) => !a),
}, ["Toggle"]);
```

`fn` may return a cleanup callback called before each re-run:

```ts
effect(() => {
  const id = setInterval(() => tick(), 1000);
  return () => clearInterval(id);
});
```

### `computed<T>(fn)`

A read-only signal derived from other signals. Updates eagerly when dependencies change.

```ts
const total = computed(() => price() * qty());
const vat   = computed(() => total() * 0.22);
```

### `reactive(signal)`

Creates a `Text` DOM node that stays in sync with `signal()`. Pass it as a Just DOM child — no wiring needed. Self-cleans when the node is removed from the live document.

```ts
DOM.p({}, ["Count: ", reactive(count)]);
DOM.h1({}, [reactive(() => `Hello, ${name()}`)]);
```

### Conditional rendering

Use `effect(el, fn)` inside a callback ref to surgically add or remove children without touching siblings:

```ts
let panel: HTMLElement | null = null;

DOM.div({
  ref: (el) => {
    effect(el, () => {
      const next = show() ? DOM.p({}, ["visible"]) : null;
      panel?.remove();
      panel = next;
      if (next) el.appendChild(next);
    });
  },
});
```

## Limits

- **No deep reactivity** — mutating object properties does not trigger updates; replace the reference.
- **No batching** — two setters in sequence run effects twice (V1).
- **`effect(fn)` dispose is manual** — the bare form without `el` returns a dispose function you must call. Use `effect(el, fn)` inside a callback ref for automatic cleanup.
- **`computed` is eager** — recalculates on dependency change even if nothing reads the result.

## Documentation

Full docs at [just-dom.vercel.app/docs/official-plugins/signals](https://just-dom.vercel.app/docs/official-plugins/signals).
