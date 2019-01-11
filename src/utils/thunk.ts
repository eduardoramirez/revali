import {ObjectLiteral} from 'revali/types'

export type Thunk<T> = T | (() => T)

export function resolveThunk<T>(thunk: Thunk<T>): T {
  return typeof thunk === 'function' ? (thunk as () => T)() : thunk
}

export function mergeThunks<T extends ObjectLiteral>(...thunks: Array<Thunk<T>>): Thunk<T> {
  return () => {
    // TODO: fix any's here
    return thunks
      .map(resolveThunk)
      .reduce((merged, value) => ({...(merged as any), ...(value as any)}))
  }
}
