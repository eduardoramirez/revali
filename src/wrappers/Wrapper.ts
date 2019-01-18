import {GraphQLNonNull, GraphQLScalarType, GraphQLType} from 'graphql'

import {graph, WriteableNode} from 'revali/graph'
import {AnyConstructor} from 'revali/types'

export interface Wrapper<T, G extends GraphQLType = GraphQLType> {
  graphQLType: G
  type: T
  transformOutput?: (output: T) => T
  nullable?: boolean
}

export type WrapperOrType<T, G extends GraphQLType = GraphQLType> =
  | Wrapper<T, G>
  | AnyConstructor<T>

export type WrapperOrNode<T, G extends GraphQLType = GraphQLType> = Wrapper<T, G> | WriteableNode

export function isWrapper<T, G extends GraphQLType>(
  x: WrapperOrType<T, G> | WrapperOrNode<T, G>
): x is Wrapper<T, G> {
  return 'graphQLType' in x && 'type' in x
}

export function convertToWrapperOrNode(wrapperOrType: WrapperOrType<any>): WrapperOrNode<any> {
  return graph.getWrapperOrNodeFromWrapperOrType(wrapperOrType)
}

export function resolveWrapper<T, G extends GraphQLType>(wrapper: Wrapper<T, G>, nonNull?: false): G
export function resolveWrapper<T, G extends GraphQLType>(
  wrapper: Wrapper<T, G>,
  nonNull?: boolean
): G | GraphQLNonNull<G>
export function resolveWrapper<T, G extends GraphQLType>(
  wrapper: Wrapper<T, G>,
  nonNull?: boolean
): G | GraphQLNonNull<G> {
  const type = wrapper.graphQLType
  return nonNull && !wrapper.nullable ? new GraphQLNonNull(type) : type
}

export function wrapScalar<T>(scalar: GraphQLScalarType): Wrapper<T, GraphQLScalarType> {
  return {
    graphQLType: scalar,
    type: (null as any) as T,
  }
}

export function unsafeWrapType<T extends GraphQLType>(type: T): Wrapper<any, T> {
  return {
    graphQLType: type,
    type: null as any,
  }
}
