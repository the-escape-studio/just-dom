import type { Effect } from "./effect"
import type { Signal, SignalPair, SignalSetter } from "./types"

let activeEffect: Effect | null = null
const effectStack: Effect[] = []

export function trackRead(subs: Set<Effect>): void {
  if (activeEffect !== null) {
    subs.add(activeEffect)
    activeEffect.deps.add(subs)
  }
}

export function pushEffect(e: Effect): void {
  effectStack.push(e)
  activeEffect = e
}

export function popEffect(): void {
  effectStack.pop()
  activeEffect = effectStack[effectStack.length - 1] ?? null
}

export function createSignal<T>(initial: T): SignalPair<T> {
  let value = initial
  const subscribers = new Set<Effect>()

  const get: Signal<T> = () => {
    trackRead(subscribers)
    return value
  }

  const set: SignalSetter<T> = (next) => {
    const nextVal = typeof next === "function"
      ? (next as (prev: T) => T)(value)
      : next
    if (Object.is(nextVal, value)) return
    value = nextVal
    for (const e of [...subscribers]) {
      e.run()
    }
  }

  return [get, set]
}
