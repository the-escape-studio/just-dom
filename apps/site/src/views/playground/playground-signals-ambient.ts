/**
 * Monaco extraLib for `@just-dom/signals` in the playground.
 * Keep in sync with runtime bindings in `PlaygroundView.tsx`.
 */
export const PLAYGROUND_SIGNALS_TYPES = `
/** A readable reactive value. Calling it reads the current value and subscribes the caller. */
type Signal<T> = () => T;

/** Accepts either a new value or an updater function. */
type SignalSetter<T> = (next: T | ((prev: T) => T)) => void;

/** Cleanup function returned by \`effect()\`. */
type EffectDispose = () => void;

/**
 * Creates a reactive primitive.
 * Returns \`[get, set]\`: call \`get()\` to read, \`set(next)\` to update.
 * Writing the same value (Object.is equality) is a no-op.
 */
declare function createSignal<T>(initial: T): [Signal<T>, SignalSetter<T>];

/**
 * Runs \`fn\` immediately and re-runs it whenever any signal read inside changes.
 * Returns a dispose function — call it to stop the effect and free subscriptions.
 * \`fn\` may return a cleanup callback that runs before each re-execution.
 *
 * When \`el\` is provided the effect self-disposes automatically once the element
 * is removed from the live document (same one-tick lag as \`reactive\`).
 * The returned dispose can still be called early for explicit teardown.
 */
declare function effect(fn: () => void | (() => void)): EffectDispose;
declare function effect(el: Element, fn: () => void | (() => void)): EffectDispose;

/**
 * Returns a read-only signal whose value is derived from \`fn\`.
 * Re-runs automatically when its dependencies change.
 */
declare function computed<T>(fn: () => T): Signal<T>;

/**
 * Creates a \`Text\` node whose content stays in sync with \`signal()\`.
 * Pass it as a child of any DOM element — no extra wiring needed.
 * Self-cleans when the node is removed from the live document.
 */
declare function reactive(signal: () => unknown): Text;
`.trim();
