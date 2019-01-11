import {TSGraphQLBoolean, TSGraphQLFloat, TSGraphQLString} from 'revali/wrappers/scalars'

export function wrapperForPrimitive(type: typeof String | typeof Boolean | typeof Number) {
  switch (type) {
    case String:
      return TSGraphQLString
    case Boolean:
      return TSGraphQLBoolean
    case Number:
      return TSGraphQLFloat
  }
  return undefined
}
