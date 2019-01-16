import {AnyConstructor, Maybe} from 'revali/types'

export function findConstructor(
  instance: any,
  constructors: Array<AnyConstructor<any>>
): Maybe<AnyConstructor<any>> {
  for (const ctor of constructors) {
    if (instance instanceof ctor) {
      return ctor
    }
  }
  return null
}
