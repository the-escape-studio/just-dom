import { effect } from "./effect"

export function reactive(signal: () => unknown): Text {
  const node = document.createTextNode(String(signal()))
  let dispose: (() => void) | null = null
  let wasConnected = false

  dispose = effect(() => {
    // Self-cleanup: once the node was part of the live document and is now gone, stop the effect.
    // We track `wasConnected` because `isConnected` is false for both "not yet inserted" and
    // "was removed" — the two cases must be treated differently.
    if (wasConnected && !node.isConnected) {
      dispose?.()
      return
    }
    if (node.isConnected) wasConnected = true
    const v = String(signal())
    if (node.nodeValue !== v) node.nodeValue = v
  })

  return node
}
