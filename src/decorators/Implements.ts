import {FieldProperty} from 'revali/decorators/Field'
import {graph} from 'revali/graph'
import {AnyConstructor} from 'revali/types'

export type InterfaceImplementation<T> = {[key in keyof T]: FieldProperty<any, T[key], any>}

export function Implements<TIface>(iface: AnyConstructor<TIface>) {
  return <TType extends InterfaceImplementation<TIface>>(target: AnyConstructor<TType>) => {
    graph.createImplement(target, iface)
  }
}
