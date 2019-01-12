import 'reflect-metadata'

import {GraphQLInputType, Thunk} from 'graphql'

import {hasArg, storeArgConfig} from 'revali/arg'
import {Omit} from 'revali/types'
import {resolveThunk, resolveType} from 'revali/utils'
import {WrapperOrType} from 'revali/wrappers/Wrapper'

export interface ArgConfig<TValue> {
  type: WrapperOrType<TValue, GraphQLInputType>
  defaultValue?: TValue
  description?: string
  name: string // Unfortunately, decorators don't emit the param name
}

export function Arg<TValue>(
  name: string,
  config?: Thunk<Partial<Omit<ArgConfig<TValue>, 'name'>>>
): ParameterDecorator {
  return (prototype: object, key: string | symbol) => {
    const keyAsString = key.toString()

    if (hasArg(prototype, keyAsString)) {
      // TODO: better error message
      throw new Error('error, only one arg. Use @Args if multiple')
    }

    storeArgConfig(prototype, keyAsString, () => {
      const resolved = config ? resolveThunk(config) : {}

      const defaultValue = resolved.defaultValue
      const type = resolveType(resolved.type, prototype, keyAsString)

      return {...resolved, defaultValue, type, name}
    })
  }
}
