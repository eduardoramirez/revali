import {GraphQLUnionType} from 'graphql'

import {compileObjectType} from 'revali/compiler'
import {AnyConstructor} from 'revali/types'
import {findConstructor} from 'revali/utils'
import {Wrapper} from 'revali/wrappers/Wrapper'

export interface UnionTypeConfig<T> {
  types: Array<AnyConstructor<T>>
  name: string
  description?: string
}

export function unionType<T>(config: UnionTypeConfig<T>): Wrapper<T, GraphQLUnionType> {
  const graphQLType = new GraphQLUnionType({
    ...config,
    types: config.types.map(compileObjectType),
    resolveType: (instance: {}) => {
      const type = findConstructor(instance, config.types)
      if (!type) {
        // This should be impossible
        throw new Error(`Source not instance of passed types for ${config.name}`)
      }
      return compileObjectType(type)
    },
  })
  return {
    graphQLType,
    type: (null as any) as T,
  }
}
