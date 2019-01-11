import {GraphQLScalarType, GraphQLScalarTypeConfig} from 'graphql'

import {Wrapper} from 'revali/wrappers/Wrapper'

export function scalarType<TInternal, TExternal>(
  config: GraphQLScalarTypeConfig<TInternal, TExternal>
): Wrapper<TInternal, GraphQLScalarType> {
  return {
    graphQLType: new GraphQLScalarType(config),
    type: (null as any) as TInternal,
  }
}
