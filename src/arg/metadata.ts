import 'reflect-metadata'

import {ArgConfig} from 'revali/arg'
import {ObjectLiteral} from 'revali/types'
import {Thunk} from 'revali/utils'

const argsKey = Symbol('args')

export function storeArgConfig(
  prototype: ObjectLiteral,
  key: string,
  config: Thunk<ArgConfig<any>>
) {
  Reflect.defineMetadata(argsKey, config, prototype, key)
}

export function hasArg(prototype: ObjectLiteral, key: string): boolean {
  return !!Reflect.getMetadata(argsKey, prototype, key)
}

export function getArgConfig(prototype: ObjectLiteral, key: string): Thunk<ArgConfig<any>> {
  return Reflect.getMetadata(argsKey, prototype, key)
}
