import 'reflect-metadata'

import {getObjectTypeConfig, storeObjectTypeConfig} from 'revali/object'
import {AnyConstructor} from 'revali/types'

const isInputObjectTypeKey = Symbol('is-input-object-type')

export const storeIsInputObjectType = (target: AnyConstructor<any>) => {
  Reflect.defineMetadata(isInputObjectTypeKey, true, target)
}

export const isInputObjectType = (target: AnyConstructor<any>) => {
  return Reflect.getMetadata(isInputObjectTypeKey, target)
}

export const getInputObjectTypeConfig = getObjectTypeConfig

export const storeInputObjectTypeConfig = storeObjectTypeConfig
