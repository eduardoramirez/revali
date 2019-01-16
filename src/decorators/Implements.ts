import {FieldProperty} from 'revali/decorators/Field'
import {registrar} from 'revali/metadata'
import {AnyConstructor} from 'revali/types'

export type InterfaceImplementation<T> = {[key in keyof T]: FieldProperty<any, T[key], any>}

export function Implements<TIface>(iface: AnyConstructor<TIface>) {
  return <TType extends InterfaceImplementation<TIface>>(target: AnyConstructor<TType>) => {
    registrar.storeImplements(target, iface)
  }
}
