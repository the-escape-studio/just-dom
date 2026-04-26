export type Signal<T> = () => T

export type SignalSetter<T> = (next: T | ((prev: T) => T)) => void

export type SignalPair<T> = [Signal<T>, SignalSetter<T>]

export type EffectDispose = () => void

export type EffectFn = () => void | (() => void)
