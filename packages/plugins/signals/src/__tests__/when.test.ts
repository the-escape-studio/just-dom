import { createSignal } from "../signal"
import { when } from "../when"

describe("when", () => {
  test("renders the then branch when condition is true", () => {
    const [visible] = createSignal(true)
    const node = when(visible, () => document.createElement("span"))
    const host = document.createElement("div")

    host.appendChild(node)

    expect(host.querySelectorAll("span")).toHaveLength(1)
  })

  test("toggles a branch without touching static siblings", () => {
    const [visible, setVisible] = createSignal(false)
    const host = document.createElement("div")
    const before = document.createElement("p")
    const after = document.createElement("button")
    before.textContent = "before"
    after.textContent = "after"

    host.appendChild(before)
    host.appendChild(when(visible, () => {
      const panel = document.createElement("section")
      panel.textContent = "panel"
      return panel
    }))
    host.appendChild(after)

    expect(host.textContent).toBe("beforeafter")

    setVisible(true)
    expect(host.textContent).toBe("beforepanelafter")
    expect(host.firstChild).toBe(before)
    expect(host.lastChild).toBe(after)

    setVisible(false)
    expect(host.textContent).toBe("beforeafter")
    expect(host.firstChild).toBe(before)
    expect(host.lastChild).toBe(after)
  })

  test("renders else branch objects", () => {
    const [visible, setVisible] = createSignal(false)
    const host = document.createElement("div")

    host.appendChild(when(visible, {
      then: () => "yes",
      else: () => "no",
    }))

    expect(host.textContent).toBe("no")
    setVisible(true)
    expect(host.textContent).toBe("yes")
  })

  test("can cache branch nodes and move them back", () => {
    const [visible, setVisible] = createSignal(true)
    const input = document.createElement("input")
    input.value = "initial"
    const host = document.createElement("div")

    host.appendChild(when(visible, () => input, { cache: true }))

    expect(host.querySelector("input")).toBe(input)
    input.value = "edited"

    setVisible(false)
    expect(host.querySelector("input")).toBeNull()

    setVisible(true)
    expect(host.querySelector("input")).toBe(input)
    expect(input.value).toBe("edited")
  })

  test("recreates branch nodes when cache is not enabled", () => {
    const [visible, setVisible] = createSignal(true)
    const host = document.createElement("div")
    let renders = 0

    host.appendChild(when(visible, () => {
      renders++
      const input = document.createElement("input")
      input.value = String(renders)
      return input
    }))

    const first = host.querySelector("input")
    expect(first?.value).toBe("1")

    setVisible(false)
    setVisible(true)

    const second = host.querySelector("input")
    expect(second).not.toBe(first)
    expect(second?.value).toBe("2")
  })

  test("self-disposes after its anchored region is removed from the document", async () => {
    const [visible, setVisible] = createSignal(false)
    const host = document.createElement("div")
    let renders = 0

    host.appendChild(when(visible, () => {
      renders++
      return document.createElement("span")
    }))
    document.body.appendChild(host)
    await Promise.resolve()

    setVisible(true)
    expect(renders).toBe(1)

    host.remove()
    setVisible(false)
    setVisible(true)

    expect(renders).toBe(1)
  })
})
