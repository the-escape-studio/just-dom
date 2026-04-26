import { pushEffect, popEffect } from "./signal"
import type { EffectDispose, EffectFn } from "./types"

export class Effect {
  deps: Set<Set<Effect>> = new Set()
  private fn: EffectFn
  private cleanup: (() => void) | void = undefined

  constructor(fn: EffectFn) {
    this.fn = fn
    this.run()
  }

  run(): void {
    this.cleanup?.()
    this.cleanup = undefined
    for (const dep of this.deps) dep.delete(this)
    this.deps.clear()

    pushEffect(this)
    try {
      this.cleanup = this.fn()
    } finally {
      popEffect()
    }
  }

  dispose(): void {
    this.cleanup?.()
    this.cleanup = undefined
    for (const dep of this.deps) dep.delete(this)
    this.deps.clear()
  }
}

export function effect(fn: EffectFn): EffectDispose
export function effect(el: Element, fn: EffectFn): EffectDispose
export function effect(fnOrEl: EffectFn | Element, fn?: EffectFn): EffectDispose {
  if (fnOrEl instanceof Element) {
    const el = fnOrEl
    let wasConnected = false
    let dispose: EffectDispose | null = null
    dispose = effect(() => {
      if (wasConnected && !el.isConnected) {
        dispose?.()
        return
      }
      if (el.isConnected) wasConnected = true
      fn!()
    })
    return dispose
  }
  const e = new Effect(fnOrEl)
  return () => e.dispose()
}
