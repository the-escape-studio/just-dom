import { effect } from "./effect"
import {
  clearRange,
  createDomRange,
  insertNodesBeforeEnd,
  renderableToNodes,
  type Renderable,
} from "./dom-range"
import type { Signal } from "./types"

export type WhenBranches = {
  then: () => Renderable
  else?: () => Renderable
}

export type WhenOptions = {
  cache?: boolean
}

type Branch = "then" | "else"

export function when(
  condition: Signal<unknown>,
  render: () => Renderable,
  options?: WhenOptions
): DocumentFragment
export function when(
  condition: Signal<unknown>,
  branches: WhenBranches,
  options?: WhenOptions
): DocumentFragment
export function when(
  condition: Signal<unknown>,
  renderOrBranches: (() => Renderable) | WhenBranches,
  options: WhenOptions = {}
): DocumentFragment {
  const { fragment, range } = createDomRange()
  const branches = typeof renderOrBranches === "function"
    ? { then: renderOrBranches }
    : renderOrBranches
  const cache = options.cache ?? false
  const cached = new Map<Branch, Node[]>()
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

    const branch: Branch = condition() ? "then" : "else"
    const render = branch === "then" ? branches.then : branches.else

    clearRange(range)
    if (!render) return

    let nodes = cached.get(branch)
    if (!nodes || !cache) {
      nodes = renderableToNodes(render())
      if (cache) cached.set(branch, nodes)
    }

    insertNodesBeforeEnd(range, nodes)
  })

  return fragment
}
