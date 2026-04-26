/**
 * @jest-environment jsdom
 */
import { createSignal } from "../signal"
import { reactive } from "../reactive"

describe("reactive", () => {
  test("creates a Text node with the signal's initial value", () => {
    const [count] = createSignal(42)
    const node = reactive(count)
    expect(node).toBeInstanceOf(Text)
    expect(node.nodeValue).toBe("42")
  })

  test("updates nodeValue when signal changes", () => {
    const [count, setCount] = createSignal(0)
    const node = reactive(count)
    expect(node.nodeValue).toBe("0")
    setCount(1)
    expect(node.nodeValue).toBe("1")
    setCount(99)
    expect(node.nodeValue).toBe("99")
  })

  test("works with derived (arrow function) signal", () => {
    const [name, setName] = createSignal("world")
    const node = reactive(() => `Hello ${name()}`)
    expect(node.nodeValue).toBe("Hello world")
    setName("just-dom")
    expect(node.nodeValue).toBe("Hello just-dom")
  })

  test("can be appended to a real DOM element", () => {
    const [label, setLabel] = createSignal("start")
    const node = reactive(label)
    const div = document.createElement("div")
    div.appendChild(node)
    expect(div.textContent).toBe("start")
    setLabel("end")
    expect(div.textContent).toBe("end")
  })

  test("self-cleans when removed from DOM", () => {
    const [count, setCount] = createSignal(0)
    const node = reactive(count)
    const div = document.createElement("div")
    document.body.appendChild(div)
    div.appendChild(node)

    setCount(1)
    expect(node.nodeValue).toBe("1")

    div.removeChild(node)

    // After removal, signal updates must not throw and self-cleanup fires
    setCount(2)
    // nodeValue is stale (self-cleaned), no error thrown
    expect(node.nodeValue).toBe("1")
  })
})
