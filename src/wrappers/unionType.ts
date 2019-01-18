import {GraphQLUnionType} from 'graphql'

import {compileObjectType} from 'revali/compiler'
import {graph, isObjectNode} from 'revali/graph'
import {AnyConstructor} from 'revali/types'
import {Wrapper} from 'revali/wrappers/Wrapper'

export interface UnionTypeConfig<T> {
  types: Array<AnyConstructor<T>>
  name: string
  description?: string
}

export function unionType<T>(config: UnionTypeConfig<T>): Wrapper<T, GraphQLUnionType> {
  const unionTypeNodes = config.types.map(target => {
    const node = graph.getNode(target)
    if (!isObjectNode(node)) {
      throw new Error(`Unexpected use of unionType. ${target.name} must be an ObjectType.`)
    }
    return node
  })

  const graphQLType = new GraphQLUnionType({
    ...config,
    types: unionTypeNodes.map(compileObjectType),
    resolveType: (instance: {}) => {
      const nodeOfType = unionTypeNodes.find(({target}) => instance instanceof target)

      if (!nodeOfType) {
        // This should be impossible
        throw new Error(`Source not instance of passed types for ${config.name}`)
      }
      return compileObjectType(nodeOfType)
    },
  })
  return {
    graphQLType,
    type: (null as any) as T,
  }
}
