import {GraphQLSchema} from 'graphql'

import {buildObjectType} from 'revali/object'
import {AnyConstructor} from 'revali/types'

export interface CompileSchemaOptions {
  Query: AnyConstructor<any>
  Mutation?: AnyConstructor<any>
}

export function compileSchema({Query, Mutation}: CompileSchemaOptions) {
  const query = buildObjectType(Query)
  const mutation = Mutation ? buildObjectType(Mutation) : undefined
  return new GraphQLSchema({query, mutation})
}
