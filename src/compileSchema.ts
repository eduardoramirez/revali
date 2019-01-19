import {GraphQLSchema} from 'graphql'

import {compileNamedTypes, compileObjectType} from 'revali/compiler'
import {graph, isObjectNode} from 'revali/graph'
import {AnyConstructor} from 'revali/types'

export interface CompileSchemaOptions {
  Query: AnyConstructor<any>
  Mutation?: AnyConstructor<any>
}

export function compileSchema({Query, Mutation}: CompileSchemaOptions) {
  const queryNode = graph.getNode(Query)
  if (!isObjectNode(queryNode)) {
    throw new Error('Query must be an ObectType')
  } else if (Query.name !== 'Query') {
    throw new Error(`Query ObjectType must be name 'Query'`)
  }

  const query = compileObjectType(queryNode)

  let mutation
  let mutationNode
  if (Mutation) {
    mutationNode = graph.getNode(Mutation)
    if (!isObjectNode(mutationNode)) {
      throw new Error('Mutation must be an ObectType')
    } else if (Mutation.name !== 'Mutation') {
      throw new Error(`Mutation ObjectType must be name 'Mutation'`)
    }

    mutation = compileObjectType(mutationNode)
  }

  const roots = mutationNode ? [queryNode, mutationNode] : [queryNode]

  const types = compileNamedTypes(graph.getUnreachableNodes(roots))

  const schema = new GraphQLSchema({
    query,
    mutation,
    types,
  })

  // TODO: check if schema is valid
  // const schema = this.generateFromMetadataSync(options)
  // const {errors} = await graphql(schema, getIntrospectionQuery())
  // if (errors) {
  //   throw new GeneratingSchemaError(errors)
  // }

  graph.clear()

  return schema
}
