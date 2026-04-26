import { createSignal } from "./signal"
import { Effect } from "./effect"
import type { Signal } from "./types"

export function computed<T>(fn: () => T): Signal<T> {
  const [get, set] = createSignal<T>(undefined as unknown as T)
  new Effect(() => set(fn()))
  return get
}
