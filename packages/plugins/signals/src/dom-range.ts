export type Renderable = Node | string | null | undefined

export type DomRange = {
  start: Comment
  end: Comment
}

export function createDomRange(): { fragment: DocumentFragment; range: DomRange } {
  const fragment = document.createDocumentFragment()
  const start = document.createComment("jd:start")
  const end = document.createComment("jd:end")

  fragment.appendChild(start)
  fragment.appendChild(end)

  return { fragment, range: { start, end } }
}

export function renderableToNodes(value: Renderable): Node[] {
  if (value == null) return []
  if (typeof value === "string") return [document.createTextNode(value)]
  if (value.nodeType === 11) return Array.from(value.childNodes)
  return [value]
}

export function insertBeforeEnd(range: DomRange, node: Node): void {
  const parent = range.end.parentNode
  if (!parent) return
  parent.insertBefore(node, range.end)
}

export function insertNodesBeforeEnd(range: DomRange, nodes: readonly Node[]): void {
  for (const node of nodes) {
    insertBeforeEnd(range, node)
  }
}

export function clearRange(range: DomRange): void {
  const parent = range.start.parentNode
  if (!parent || parent !== range.end.parentNode) return

  let node = range.start.nextSibling
  while (node && node !== range.end) {
    const next = node.nextSibling
    parent.removeChild(node)
    node = next
  }
}

export function removeNodes(nodes: readonly Node[]): void {
  for (const node of nodes) {
    node.parentNode?.removeChild(node)
  }
}
