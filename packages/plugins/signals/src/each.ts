import { effect } from "./effect"
import {
  createDomRange,
  insertNodesBeforeEnd,
  removeNodes,
  renderableToNodes,
  type Renderable,
} from "./dom-range"
import { createSignal } from "./signal"
import type { Signal, SignalSetter } from "./types"

export type EachKey = string | number | symbol

type EachEntry<T> = {
  nodes: Node[]
  setItem: SignalSetter<T>
  setIndex: SignalSetter<number>
}

export function each<T, K extends EachKey>(
  items: Signal<readonly T[]>,
  key: (item: T, index: number) => K,
  renderItem: (item: Signal<T>, index: Signal<number>) => Renderable
): DocumentFragment {
  const { fragment, range } = createDomRange()
  const entries = new Map<K, EachEntry<T>>()
  let dispose: (() => void) | null = null
  let wasConnected = false
  queueMicrotask(() => {
    if (range.start.isConnected) wasConnected = true
  })

  dispose = effect(() => {
    if (wasConnected && !range.start.isConnected) {
      dispose?.()
      return
    }
    if (range.start.isConnected) wasConnected = true

    const nextItems = items()
    const seen = new Set<K>()

    nextItems.forEach((item, index) => {
      const itemKey = key(item, index)
      if (seen.has(itemKey)) {
        throw new Error(`Duplicate key in each(): ${String(itemKey)}`)
      }
      seen.add(itemKey)

      let entry = entries.get(itemKey)
      if (!entry) {
        const [itemSignal, setItem] = createSignal(item)
        const [indexSignal, setIndex] = createSignal(index)
        const nodes = renderableToNodes(renderItem(itemSignal, indexSignal))
        entry = { nodes, setItem, setIndex }
        entries.set(itemKey, entry)
      } else {
        entry.setItem(item)
        entry.setIndex(index)
      }

      insertNodesBeforeEnd(range, entry.nodes)
    })

    for (const [itemKey, entry] of entries) {
      if (seen.has(itemKey)) continue
      removeNodes(entry.nodes)
      entries.delete(itemKey)
    }
  })

  return fragment
}
