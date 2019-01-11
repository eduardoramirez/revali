import 'reflect-metadata'

import {InterfaceTypeConfig} from 'revali/interface'
import {AnyConstructor} from 'revali/types'

const interfaceKey = Symbol('interface')

export const getInterfaceTypeConfig = (target: AnyConstructor<any>) => {
  return Reflect.getMetadata(interfaceKey, target)
}

export const isInterfaceType = (target: AnyConstructor<any>) => {
  return !!getInterfaceTypeConfig(target)
}

export const storeInterfaceTypeConfig = (
  target: AnyConstructor<any>,
  config: InterfaceTypeConfig
) => {
  Reflect.defineMetadata(interfaceKey, config, target)
}
