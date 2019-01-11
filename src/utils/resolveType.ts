import {GraphQLType} from 'graphql'
import {isFunction} from 'lodash'

import {ObjectLiteral} from 'revali/types'
import {wrapperForPrimitive} from 'revali/utils'
import {WrapperOrType} from 'revali/wrappers/Wrapper'

export function resolveType<T, G extends GraphQLType>(
  configType: WrapperOrType<T, G> | undefined,
  prototype: ObjectLiteral,
  key: string
): WrapperOrType<T, G> {
  if (configType) {
    return configType
  }
  const fieldType = isFunction(prototype[key])
    ? Reflect.getMetadata('design:returntype', prototype, key)
    : Reflect.getMetadata('design:type', prototype, key)
  const type = wrapperForPrimitive(fieldType) as any
  if (!type) {
    const name = prototype.constructor ? prototype.constructor.name : ''
    throw new Error(
      `Type option not supplied and type of ${name}#${key} is not retrievable by reflection`
    )
  }
  return type
}
