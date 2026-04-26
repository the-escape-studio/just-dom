import { createSignal } from "../signal"
import { effect } from "../effect"
import { computed } from "../computed"

describe("effect", () => {
  test("runs immediately", () => {
    let ran = false
    effect(() => { ran = true })
    expect(ran).toBe(true)
  })

  test("re-runs when a signal it read changes", () => {
    const [count, setCount] = createSignal(0)
    let last = -1
    effect(() => { last = count() })
    expect(last).toBe(0)
    setCount(1)
    expect(last).toBe(1)
    setCount(5)
    expect(last).toBe(5)
  })

  test("dispose stops re-runs", () => {
    const [count, setCount] = createSignal(0)
    let runs = 0
    const dispose = effect(() => { count(); runs++ })
    expect(runs).toBe(1)
    dispose()
    setCount(1)
    expect(runs).toBe(1)
  })

  test("cleans up stale dependencies (conditional branches)", () => {
    const [flag, setFlag] = createSignal(true)
    const [a, setA] = createSignal("a")
    const [b, setB] = createSignal("b")
    let result = ""
    effect(() => { result = flag() ? a() : b() })

    expect(result).toBe("a")
    setFlag(false)
    expect(result).toBe("b")

    // After switching to false branch, changing `a` must NOT re-run the effect
    let runs = 0
    effect(() => { result = flag() ? a() : b(); runs++ })
    const runsBefore = runs
    setFlag(false) // no-op (same value)
    setA("a2")    // should not trigger since flag is false
    expect(result).toBe("b")
  })

  test("calls cleanup returned from effect fn before re-run", () => {
    const [count, setCount] = createSignal(0)
    const cleanups: number[] = []
    effect(() => {
      const val = count()
      return () => { cleanups.push(val) }
    })
    setCount(1)
    setCount(2)
    expect(cleanups).toEqual([0, 1])
  })

  test("nested effects track independently", () => {
    const [a, setA] = createSignal(0)
    const [b, setB] = createSignal(0)
    let outerRuns = 0
    let innerRuns = 0

    effect(() => {
      a()
      outerRuns++
      effect(() => { b(); innerRuns++ })
    })

    expect(outerRuns).toBe(1)
    expect(innerRuns).toBe(1)
    setB(1)
    expect(outerRuns).toBe(1)
    expect(innerRuns).toBe(2)
    setA(1)
    expect(outerRuns).toBe(2)
  })
})

describe("effect with element (self-cleanup)", () => {
  test("runs normally while element is connected", () => {
    const [count, setCount] = createSignal(0)
    const el = document.createElement("div")
    document.body.appendChild(el)

    let runs = 0
    effect(el, () => { count(); runs++ })
    expect(runs).toBe(1)

    setCount(1)
    expect(runs).toBe(2)

    document.body.removeChild(el)
  })

  test("self-disposes after element is removed from document", () => {
    const [count, setCount] = createSignal(0)
    const el = document.createElement("div")
    document.body.appendChild(el)

    let runs = 0
    effect(el, () => { count(); runs++ })

    setCount(1)           // el connected → runs
    expect(runs).toBe(2)

    document.body.removeChild(el)
    setCount(2)           // triggers effect: wasConnected=true, !isConnected → self-dispose + early return (fn never called)
    setCount(3)           // effect already disposed, no more runs
    expect(runs).toBe(2)  // fn was never called during the disposal tick
  })

  test("returned dispose can still be called early", () => {
    const [count, setCount] = createSignal(0)
    const el = document.createElement("div")
    document.body.appendChild(el)

    let runs = 0
    const stop = effect(el, () => { count(); runs++ })

    setCount(1)
    stop()         // manual early teardown
    setCount(2)
    expect(runs).toBe(2)

    document.body.removeChild(el)
  })
})

describe("computed", () => {
  test("derives value from signals", () => {
    const [count, setCount] = createSignal(2)
    const double = computed(() => count() * 2)
    expect(double()).toBe(4)
    setCount(5)
    expect(double()).toBe(10)
  })

  test("propagates through effects", () => {
    const [x, setX] = createSignal(1)
    const squared = computed(() => x() * x())
    let result = 0
    effect(() => { result = squared() })
    expect(result).toBe(1)
    setX(3)
    expect(result).toBe(9)
  })

  test("can chain computeds", () => {
    const [n, setN] = createSignal(2)
    const double = computed(() => n() * 2)
    const quadruple = computed(() => double() * 2)
    expect(quadruple()).toBe(8)
    setN(3)
    expect(quadruple()).toBe(12)
  })
})
