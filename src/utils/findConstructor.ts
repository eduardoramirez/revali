import {AnyConstructor} from 'revali/types'

export function findConstructor(instance: any, constructors: Array<AnyConstructor<any>>) {
  for (const ctor of constructors) {
    if (instance instanceof ctor) {
      return ctor
    }
  }
  return null
}
