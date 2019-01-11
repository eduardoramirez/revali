import 'reflect-metadata'

import {ObjectTypeConfig} from 'revali/object'
import {AnyConstructor, Maybe} from 'revali/types'

const isObjectTypeKey = Symbol('is-object-type')
const objectTypeKey = Symbol('object-type')

export const storeIsObjectType = (target: AnyConstructor<any>) => {
  Reflect.defineMetadata(isObjectTypeKey, true, target)
}

export const isObjectType = (target: AnyConstructor<any>) => {
  return Reflect.getMetadata(isObjectTypeKey, target)
}

export const getObjectTypeConfig = (target: AnyConstructor<any>): Maybe<ObjectTypeConfig> => {
  return Reflect.getMetadata(objectTypeKey, target)
}

export const hasObjectTypeConfig = (target: AnyConstructor<any>) => !!getObjectTypeConfig(target)

export const storeObjectTypeConfig = (target: AnyConstructor<any>, config: ObjectTypeConfig) => {
  Reflect.defineMetadata(objectTypeKey, config, target)
}
