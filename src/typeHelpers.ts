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

import {buildInputObjectType, isInputObjectType} from 'revali/inputObject'
import {buildInterfaceType, isInterfaceType} from 'revali/interface'
import {buildObjectType, isObjectType} from 'revali/object'
import {Constructor} from 'revali/types'
import {isWrapper, resolveWrapper, WrapperOrType} from 'revali/wrappers/Wrapper'

export function buildType(target: WrapperOrType<any, GraphQLType>, nonNull?: false): GraphQLType
export function buildType(
  target: WrapperOrType<any, GraphQLType>,
  nonNull: true
): GraphQLNonNull<GraphQLType>
export function buildType(
  target: WrapperOrType<any, GraphQLType>,
  nonNull?: boolean
): GraphQLType | GraphQLNonNull<GraphQLType>
export function buildType(
  target: WrapperOrType<any, GraphQLType>,
  nonNull?: boolean
): GraphQLType | GraphQLNonNull<GraphQLType> {
  if (isWrapper(target)) {
    return resolveWrapper(target, nonNull)
  }

  let type
  if (isInputObjectType(target)) {
    type = buildInputObjectType(target)
  }

  if (isObjectType(target)) {
    type = buildObjectType(target)
  }

  if (isInterfaceType(target)) {
    type = buildInterfaceType(target)
  }

  if (type) {
    return nonNull ? new GraphQLNonNull(type) : type
  }

  throw new Error(`Type not found for ${target.name}`)
}

export const buildNamedType = (target: WrapperOrType<any, GraphQLNamedType>): GraphQLNamedType => {
  const type = buildType(target)
  if (!type || !isNamedType(type)) {
    throw new Error(`Named type not found for ${(target as Constructor<any>).name}`)
  }
  return type
}

export const buildNamedTypes = (
  targets: Array<WrapperOrType<any, GraphQLNamedType>>
): GraphQLNamedType[] => {
  return targets.map(buildNamedType)
}

export const buildOutputType = (
  target: WrapperOrType<any, GraphQLOutputType>,
  nonNull?: boolean
): GraphQLOutputType => {
  const type = buildType(target, nonNull)
  if (!type || !isOutputType(type)) {
    throw new Error(`Output type not found for ${(target as Constructor<any>).name}`)
  }
  return type
}

export const buildInputType = (
  target: WrapperOrType<any, GraphQLInputType>,
  nonNull?: boolean
): GraphQLInputType => {
  const type = buildType(target, nonNull)
  if (!type || !isInputType(type)) {
    throw new Error(`Input type not found for ${(target as Constructor<any>).name}`)
  }
  return type
}
