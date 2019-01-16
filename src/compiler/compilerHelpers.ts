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
import {registrar} from 'revali/metadata'
import {Constructor} from 'revali/types'
import {isWrapper, resolveWrapper, WrapperOrType} from 'revali/wrappers/Wrapper'

interface CompileTypeDefinitions {
  (target: WrapperOrType<any, GraphQLType>, nonNull?: false): GraphQLType

  (target: WrapperOrType<any, GraphQLType>, nonNull: true): GraphQLNonNull<GraphQLType>

  (target: WrapperOrType<any, GraphQLType>, nonNull?: boolean):
    | GraphQLType
    | GraphQLNonNull<GraphQLType>
}

export const compileType = ((
  target: WrapperOrType<any, GraphQLType>,
  nonNull?: boolean
): GraphQLType | GraphQLNonNull<GraphQLType> => {
  if (isWrapper(target)) {
    return resolveWrapper(target, nonNull)
  }

  let type
  if (registrar.isInputObjectType(target)) {
    type = compileInputObjectType(target)
  }

  if (registrar.isObjectType(target)) {
    type = compileObjectType(target)
  }

  if (registrar.isInterfaceType(target)) {
    type = compileInterfaceType(target)
  }

  if (type) {
    return nonNull ? new GraphQLNonNull(type) : type
  }

  throw new Error(`Type not found for ${target.name}`)
}) as CompileTypeDefinitions

export const compileNamedType = (
  target: WrapperOrType<any, GraphQLNamedType>
): GraphQLNamedType => {
  const type = compileType(target)
  if (!type || !isNamedType(type)) {
    throw new Error(`Named type not found for ${(target as Constructor<any>).name}`)
  }
  return type
}

export const compileNamedTypes = (
  targets: Array<WrapperOrType<any, GraphQLNamedType>>
): GraphQLNamedType[] => {
  return targets.map(compileNamedType)
}

export const compileOutputType = (
  target: WrapperOrType<any, GraphQLOutputType>,
  nonNull?: boolean
): GraphQLOutputType => {
  const type = compileType(target, nonNull)
  if (!type || !isOutputType(type)) {
    throw new Error(`Output type not found for ${(target as Constructor<any>).name}`)
  }
  return type
}

export const compileInputType = (
  target: WrapperOrType<any, GraphQLInputType>,
  nonNull?: boolean
): GraphQLInputType => {
  const type = compileType(target, nonNull)
  if (!type || !isInputType(type)) {
    throw new Error(`Input type not found for ${(target as Constructor<any>).name}`)
  }
  return type
}
