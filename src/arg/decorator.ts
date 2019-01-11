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
) {
  return <TName extends string>(prototype: Record<TName, TValue>, key: TName) => {
    if (hasArg(prototype, key)) {
      throw new Error('error, only one arg. Use @Args if multiple')
    }

    storeArgConfig(prototype, key, () => {
      const resolved = config ? resolveThunk(config) : {}

      const defaultValue = resolved.defaultValue
      const type = resolveType(resolved.type, prototype, key)

      return {...resolved, defaultValue, type, name}
    })
  }
}
