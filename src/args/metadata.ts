import 'reflect-metadata'

import {getInputFieldConfig, hasInputFieldConfig} from 'revali/inputField'
import {EmptyConstructor} from 'revali/types'

const isArgsKey = Symbol('isArgs')

export const getArgsConfig = getInputFieldConfig
export const hasArgs = hasInputFieldConfig

export const isArgs = (target: EmptyConstructor<any>) => {
  return !!Reflect.getMetadata(isArgsKey, target)
}

export const storeIsArgs = (target: EmptyConstructor<any>) => {
  Reflect.defineMetadata(isArgsKey, true, target)
}
