import { createSignal } from "../signal"
import { each } from "../each"
import { reactive } from "../reactive"

type Item = {
  id: string
  label: string
}

describe("each", () => {
  test("renders the initial list", () => {
    const [items] = createSignal<Item[]>([
      { id: "a", label: "Alpha" },
      { id: "b", label: "Beta" },
    ])
    const host = document.createElement("ul")

    host.appendChild(each(
      items,
      (item) => item.id,
      (item) => {
        const li = document.createElement("li")
        li.appendChild(reactive(() => item().label))
        return li
      }
    ))

    expect(host.textContent).toBe("AlphaBeta")
    expect(host.querySelectorAll("li")).toHaveLength(2)
  })

  test("updates existing keyed nodes through item signals", () => {
    const [items, setItems] = createSignal<Item[]>([
      { id: "a", label: "Alpha" },
    ])
    const host = document.createElement("ul")

    host.appendChild(each(
      items,
      (item) => item.id,
      (item) => {
        const li = document.createElement("li")
        li.appendChild(reactive(() => item().label))
        return li
      }
    ))

    const li = host.querySelector("li")
    setItems([{ id: "a", label: "Updated" }])

    expect(host.querySelector("li")).toBe(li)
    expect(host.textContent).toBe("Updated")
  })

  test("reorders by moving existing nodes", () => {
    const [items, setItems] = createSignal<Item[]>([
      { id: "a", label: "A" },
      { id: "b", label: "B" },
      { id: "c", label: "C" },
    ])
    const host = document.createElement("ul")

    host.appendChild(each(
      items,
      (item) => item.id,
      (item) => {
        const li = document.createElement("li")
        li.dataset.id = item().id
        li.appendChild(reactive(() => item().label))
        return li
      }
    ))

    const a = host.querySelector('[data-id="a"]')
    const b = host.querySelector('[data-id="b"]')
    const c = host.querySelector('[data-id="c"]')

    setItems([
      { id: "c", label: "C" },
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ])

    expect(host.textContent).toBe("CAB")
    expect(host.querySelector('[data-id="a"]')).toBe(a)
    expect(host.querySelector('[data-id="b"]')).toBe(b)
    expect(host.querySelector('[data-id="c"]')).toBe(c)
  })

  test("adds and removes keyed nodes", () => {
    const [items, setItems] = createSignal<Item[]>([
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ])
    const host = document.createElement("ul")

    host.appendChild(each(
      items,
      (item) => item.id,
      (item) => {
        const li = document.createElement("li")
        li.dataset.id = item().id
        li.appendChild(reactive(() => item().label))
        return li
      }
    ))

    const b = host.querySelector('[data-id="b"]')

    setItems([
      { id: "b", label: "B" },
      { id: "c", label: "C" },
    ])

    expect(host.textContent).toBe("BC")
    expect(host.querySelector('[data-id="a"]')).toBeNull()
    expect(host.querySelector('[data-id="b"]')).toBe(b)
    expect(host.querySelector('[data-id="c"]')).not.toBeNull()
  })

  test("updates the index signal", () => {
    const [items, setItems] = createSignal<Item[]>([
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ])
    const host = document.createElement("ul")

    host.appendChild(each(
      items,
      (item) => item.id,
      (_item, index) => {
        const li = document.createElement("li")
        li.appendChild(reactive(index))
        return li
      }
    ))

    expect(host.textContent).toBe("01")

    setItems([
      { id: "b", label: "B" },
      { id: "a", label: "A" },
    ])

    expect(host.textContent).toBe("01")
  })

  test("throws on duplicate keys", () => {
    const [items, setItems] = createSignal<Item[]>([
      { id: "a", label: "A" },
    ])
    const host = document.createElement("ul")

    host.appendChild(each(
      items,
      (item) => item.id,
      (item) => document.createTextNode(item().label)
    ))

    expect(() => {
      setItems([
        { id: "a", label: "A" },
        { id: "a", label: "A2" },
      ])
    }).toThrow("Duplicate key in each(): a")
  })

  test("self-disposes after its anchored region is removed from the document", async () => {
    const [items, setItems] = createSignal<Item[]>([
      { id: "a", label: "A" },
    ])
    const host = document.createElement("ul")
    let renders = 0

    host.appendChild(each(
      items,
      (item) => item.id,
      (item) => {
        renders++
        return document.createTextNode(item().label)
      }
    ))
    document.body.appendChild(host)
    await Promise.resolve()

    expect(renders).toBe(1)

    host.remove()
    setItems([
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ])
    setItems([
      { id: "a", label: "A" },
      { id: "b", label: "B" },
      { id: "c", label: "C" },
    ])

    expect(renders).toBe(1)
  })
})
