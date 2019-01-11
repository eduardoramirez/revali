import 'reflect-metadata'

import {InputFieldConfig} from 'revali/inputField'
import {AnyConstructor, Maybe, ObjectLiteral} from 'revali/types'
import {Thunk} from 'revali/utils'

const inputFieldKey = Symbol('input-field')

export function storeInputFieldConfig(
  prototype: ObjectLiteral,
  name: string,
  config: Thunk<InputFieldConfig<any>>
) {
  const currentFields = Reflect.getMetadata(inputFieldKey, prototype)
  Reflect.defineMetadata(inputFieldKey, {...currentFields, [name]: config}, prototype)
}

export function getInputFieldConfig(
  target: AnyConstructor<any>
): Maybe<{[key: string]: Thunk<InputFieldConfig<any>>}> {
  return Reflect.getMetadata(inputFieldKey, target.prototype)
}

export function hasInputFieldConfig(target: AnyConstructor<any>) {
  return !!getInputFieldConfig(target)
}
