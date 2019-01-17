import {GraphQLSchema} from 'graphql'

import {compileNamedTypes, compileObjectType} from 'revali/compiler'
import {graph, isObjectNode} from 'revali/graph'
import {AnyConstructor} from 'revali/types'

export interface CompileSchemaOptions {
  Query: AnyConstructor<any>
  Mutation?: AnyConstructor<any>
}

export function compileSchema({Query, Mutation}: CompileSchemaOptions) {
  const queryNode = graph.getOutputTypeNode(Query)
  if (!queryNode) {
    // TODO: better error msg
    throw new Error()
  } else if (!isObjectNode(queryNode)) {
    // TODO: better error msg
    throw new Error()
  }

  const query = compileObjectType(queryNode)

  let mutation
  let mutationNode
  if (Mutation) {
    mutationNode = graph.getOutputTypeNode(Mutation)
    if (!mutationNode) {
      // TODO: better error msg
      throw new Error()
    } else if (!isObjectNode(mutationNode)) {
      // TODO: better error msg
      throw new Error()
    }

    mutation = compileObjectType(mutationNode)
  }

  const roots = mutationNode ? [queryNode, mutationNode] : [queryNode]

  const types = compileNamedTypes(graph.getUnreachableWriteableNodes(roots))

  return new GraphQLSchema({
    query,
    mutation,
    types,
  })
}
