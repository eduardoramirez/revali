import {GraphQLList} from 'graphql'

import {compileType} from 'revali/compiler'
import {isWrapper, Wrapper, WrapperOrType} from 'revali/wrappers/Wrapper'

export function list<T>(type: WrapperOrType<T>): Wrapper<T[], GraphQLList<any>> {
  const currentType = compileType(type, true)
  const transformOutput = isWrapper(type) && type.transformOutput
  return {
    graphQLType: new GraphQLList(currentType),
    transformOutput: transformOutput
      ? (values: T[]) => values.map(transformOutput.bind(type))
      : undefined,
    type: [],
  }
}
