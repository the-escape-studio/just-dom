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
import { createSignal, computed, reactive, effect, when, each } from "@just-dom/signals";

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

### `when(condition, render)`

Creates an anchored DOM region that renders a branch while `condition()` is truthy. Static siblings around the region are left untouched.

```ts
const [show, setShow] = createSignal(false);

DOM.section({}, [
  DOM.h2({}, ["Static title"]),
  when(show, () => DOM.p({}, ["Visible"])),
  DOM.button({ onclick: () => setShow((v) => !v) }, ["Toggle"]),
]);
```

Use object branches for an `else` case:

```ts
when(show, {
  then: () => DOM.p({}, ["Visible"]),
  else: () => DOM.p({}, ["Hidden"]),
});
```

Pass `{ cache: true }` to keep branch nodes and move them back later instead of recreating them.

The anchored region self-cleans after it is removed from the live document.

### `each(items, key, renderItem)`

Renders a keyed list. Existing nodes are moved when the array order changes, so event listeners, refs, input state, and child DOM identity are preserved.

`renderItem` receives an item signal and an index signal. Use `item()` inside nested `reactive()` or `effect()` calls when item data should update without recreating the node:

```ts
const [todos, setTodos] = createSignal([
  { id: "a", label: "Write docs" },
  { id: "b", label: "Ship package" },
]);

DOM.ul({}, [
  each(
    todos,
    (todo) => todo.id,
    (todo, index) => DOM.li({}, [
      reactive(() => `${index() + 1}. ${todo().label}`),
    ]),
  ),
]);
```

The anchored list region self-cleans after it is removed from the live document.

## Limits

- **No deep reactivity** — mutating object properties does not trigger updates; replace the reference.
- **No batching** — two setters in sequence run effects twice (V1).
- **`effect(fn)` dispose is manual** — the bare form without `el` returns a dispose function you must call. Use `effect(el, fn)` inside a callback ref for automatic cleanup.
- **`computed` is eager** — recalculates on dependency change even if nothing reads the result.
- **`each` requires stable unique keys** — duplicate keys throw, and key changes are treated as remove + add.

## Documentation

Full docs at [just-dom.vercel.app/docs/official-plugins/signals](https://just-dom.vercel.app/docs/official-plugins/signals).
