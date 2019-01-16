import {GraphQLSchema} from 'graphql'

import {compileNamedTypes, compileObjectType} from 'revali/compiler'
import {registrar} from 'revali/metadata'
import {AnyConstructor} from 'revali/types'

export interface CompileSchemaOptions {
  Query: AnyConstructor<any>
  Mutation?: AnyConstructor<any>
}

export function compileSchema({Query, Mutation}: CompileSchemaOptions) {
  const query = compileObjectType(Query)
  const mutation = Mutation ? compileObjectType(Mutation) : undefined

  const types = compileNamedTypes(registrar.getUnreachableTypes())

  return new GraphQLSchema({query, mutation, types})
}
