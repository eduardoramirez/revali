import {Thunk} from 'graphql'

import {registrar} from 'revali/metadata'
import {ObjectLiteral, Omit} from 'revali/types'
import {resolveThunk} from 'revali/utils'

export interface ArgOptions<TValue> {
  defaultValue?: TValue
  description?: string
  name: string // Unfortunately, decorators don't emit the param name
}

export function Arg<TValue>(
  name: string,
  config?: Thunk<Partial<Omit<ArgOptions<TValue>, 'name'>>>
): ParameterDecorator {
  return (prototype: ObjectLiteral, key: string | symbol) => {
    if (typeof key === 'symbol') {
      // TODO: better error message
      throw new Error('Arg: symbol is not supported')
    }

    if (registrar.hasArg(prototype, key)) {
      // TODO: better error message
      throw new Error('error, only one arg. Use @Args if multiple')
    }

    registrar.storeArgMetadata(prototype, key, () => {
      const resolved = config ? resolveThunk(config) : {}
      const defaultValue = resolved.defaultValue
      return {...resolved, defaultValue, name}
    })
  }
}
