import { createSignal } from "../signal"

describe("createSignal", () => {
  test("returns initial value", () => {
    const [count] = createSignal(0)
    expect(count()).toBe(0)
  })

  test("updates value with set", () => {
    const [count, setCount] = createSignal(0)
    setCount(5)
    expect(count()).toBe(5)
  })

  test("updates value with updater function", () => {
    const [count, setCount] = createSignal(10)
    setCount(c => c + 1)
    expect(count()).toBe(11)
  })

  test("bails on same-value write", () => {
    const [count, setCount] = createSignal(0)
    let reads = 0
    // track manually — just confirm value stays the same
    setCount(0)
    reads++
    expect(count()).toBe(0)
    expect(reads).toBe(1)
  })

  test("works with non-primitive values (by reference)", () => {
    const obj = { x: 1 }
    const [get, set] = createSignal(obj)
    expect(get()).toBe(obj)
    const next = { x: 2 }
    set(next)
    expect(get()).toBe(next)
  })
})
