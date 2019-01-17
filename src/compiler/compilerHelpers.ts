import {
  GraphQLInputType,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLOutputType,
  GraphQLType,
  isInputType,
  isNamedType,
  isOutputType,
} from 'graphql'

import {compileInputObjectType, compileInterfaceType, compileObjectType} from 'revali/compiler'
import {isInputObjectNode, isInterfaceNode, isObjectNode} from 'revali/graph'
import {isWrapper, resolveWrapper, WrapperOrNode} from 'revali/wrappers/Wrapper'

interface CompileTypeDefinitions {
  (target: WrapperOrNode<any, GraphQLType>, nonNull?: false): GraphQLType

  (target: WrapperOrNode<any, GraphQLType>, nonNull: true): GraphQLNonNull<GraphQLType>

  (target: WrapperOrNode<any, GraphQLType>, nonNull?: boolean):
    | GraphQLType
    | GraphQLNonNull<GraphQLType>
}

export const compileType = ((
  nodeOrWrapper: WrapperOrNode<any, GraphQLType>,
  nonNull?: boolean
): GraphQLType | GraphQLNonNull<GraphQLType> => {
  if (isWrapper(nodeOrWrapper)) {
    return resolveWrapper(nodeOrWrapper, nonNull)
  }

  let type
  if (isInputObjectNode(nodeOrWrapper)) {
    type = compileInputObjectType(nodeOrWrapper)
  }

  if (isObjectNode(nodeOrWrapper)) {
    type = compileObjectType(nodeOrWrapper)
  }

  if (isInterfaceNode(nodeOrWrapper)) {
    type = compileInterfaceType(nodeOrWrapper)
  }

  if (type) {
    return nonNull ? new GraphQLNonNull(type) : type
  }

  // TODO: better error
  throw new Error(`Type not found for`)
  // throw new Error(`Type not found for ${target.name}`)
}) as CompileTypeDefinitions

export const compileNamedType = (
  nodeOrWrapper: WrapperOrNode<any, GraphQLNamedType>
): GraphQLNamedType => {
  const type = compileType(nodeOrWrapper)
  if (!type || !isNamedType(type)) {
    // TODO: better error msg
    throw new Error(`Named type not found for`)
    // throw new Error(`Named type not found for ${(target as Constructor<any>).name}`)
  }
  return type
}

export const compileNamedTypes = (
  nodesOrWrappers: Array<WrapperOrNode<any, GraphQLNamedType>>
): GraphQLNamedType[] => {
  return nodesOrWrappers.map(compileNamedType)
}

export const compileOutputType = (
  nodeOrWrapper: WrapperOrNode<any, GraphQLOutputType>,
  nonNull?: boolean
): GraphQLOutputType => {
  const type = compileType(nodeOrWrapper, nonNull)
  if (!type || !isOutputType(type)) {
    // TODO: better error msg
    throw new Error(`Output type not found for`)
    // throw new Error(`Output type not found for ${(target as Constructor<any>).name}`)
  }
  return type
}

export const compileInputType = (
  nodeOrWrapper: WrapperOrNode<any, GraphQLInputType>,
  nonNull?: boolean
): GraphQLInputType => {
  const type = compileType(nodeOrWrapper, nonNull)
  if (!type || !isInputType(type)) {
    // TODO: better error msg
    throw new Error(`Input type not found for`)
    // throw new Error(`Input type not found for ${(target as Constructor<any>).name}`)
  }
  return type
}
