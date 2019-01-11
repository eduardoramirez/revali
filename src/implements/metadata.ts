import 'reflect-metadata'

import {uniq} from 'lodash'

import {AnyConstructor, Maybe} from 'revali/types'

const implementsKey = Symbol('implements')
const implementersKey = Symbol('implementers')

export const getImplements = (target: AnyConstructor<any>): Maybe<Array<AnyConstructor<any>>> => {
  return Reflect.getMetadata(implementsKey, target)
}

export const getImplementers = (iface: AnyConstructor<any>): Maybe<Array<AnyConstructor<any>>> => {
  return Reflect.getMetadata(implementersKey, iface)
}

export const storeImplements = (target: AnyConstructor<any>, iface: AnyConstructor<any>) => {
  const currentImplements = getImplements(target) || []
  const currentImplementers = getImplementers(iface) || []
  Reflect.defineMetadata(implementsKey, uniq([...currentImplements, iface]), target)
  Reflect.defineMetadata(implementersKey, uniq([...currentImplementers, target]), iface)
}
