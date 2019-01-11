import {FieldProperty} from 'revali/field'
import {storeImplements} from 'revali/implements'
import {AnyConstructor} from 'revali/types'

export type InterfaceImplementation<T> = {[key in keyof T]: FieldProperty<any, T[key], any>}

export function Implements<TIface>(iface: AnyConstructor<TIface>) {
  return <TType extends InterfaceImplementation<TIface>>(target: AnyConstructor<TType>) => {
    storeImplements(target, iface)
  }
}
