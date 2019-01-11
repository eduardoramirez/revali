import 'reflect-metadata'

import {FieldConfig} from 'revali/field'
import {AnyConstructor, Maybe, ObjectLiteral} from 'revali/types'
import {Thunk} from 'revali/utils'

const fieldKey = Symbol('field')

export function getFieldConfig(
  target: AnyConstructor<any>
): Maybe<{[key: string]: Thunk<FieldConfig<any, any, any>>}> {
  return Reflect.getMetadata(fieldKey, target.prototype)
}

export function storeFieldConfig(
  prototype: ObjectLiteral,
  name: string,
  config: Thunk<FieldConfig<any, any, any>>
) {
  const currentFields = Reflect.getMetadata(fieldKey, prototype)
  Reflect.defineMetadata(fieldKey, {...currentFields, [name]: config}, prototype)
}
