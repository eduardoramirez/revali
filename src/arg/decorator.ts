import 'reflect-metadata'

import {Thunk} from 'graphql'

import {hasArgPrototype, storeArgConfig} from 'revali/arg'
import {ObjectLiteral, Omit} from 'revali/types'
import {resolveThunk} from 'revali/utils'

export interface ArgConfig<TValue> {
  defaultValue?: TValue
  description?: string
  name: string // Unfortunately, decorators don't emit the param name
}

export function Arg<TValue>(
  name: string,
  config?: Thunk<Partial<Omit<ArgConfig<TValue>, 'name'>>>
): ParameterDecorator {
  return (prototype: ObjectLiteral, key: string | symbol) => {
    const keyAsString = key.toString()

    if (hasArgPrototype(prototype, keyAsString)) {
      // TODO: better error message
      throw new Error('error, only one arg. Use @Args if multiple')
    }

    storeArgConfig(prototype, keyAsString, () => {
      const resolved = config ? resolveThunk(config) : {}

      const defaultValue = resolved.defaultValue

      return {...resolved, defaultValue, name}
    })
  }
}
