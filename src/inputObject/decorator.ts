import {storeInputObjectTypeConfig, storeIsInputObjectType} from 'revali/inputObject'
import {EmptyConstructor} from 'revali/types'

export interface InputObjectTypeConfig<TSource, TContext> {
  name?: string
  description?: string
}

export function InputObjectType<TSource, TContext>(
  config: InputObjectTypeConfig<TSource, TContext> = {}
) {
  return (target: EmptyConstructor<TSource>) => {
    storeIsInputObjectType(target)
    storeInputObjectTypeConfig(target, {...config, name: config.name || target.name})
  }
}
