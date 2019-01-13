import 'reflect-metadata'

import {ArgConfig} from 'revali/arg'
import {AnyConstructor, ObjectLiteral} from 'revali/types'
import {Thunk} from 'revali/utils'

const argsKey = Symbol('arg')

export function storeArgConfig(
  prototype: ObjectLiteral,
  key: string,
  config: Thunk<ArgConfig<any>>
) {
  Reflect.defineMetadata(argsKey, config, prototype, key)
}

export function hasArgPrototype(prototype: ObjectLiteral, key: string): boolean {
  return !!Reflect.getMetadata(argsKey, prototype, key)
}

export function hasArg(target: AnyConstructor<any>, key: string): boolean {
  return !!Reflect.getMetadata(argsKey, target.prototype, key)
}

export function getArgConfig(target: AnyConstructor<any>, key: string): Thunk<ArgConfig<any>> {
  return Reflect.getMetadata(argsKey, target.prototype, key)
}
