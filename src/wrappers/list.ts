import {GraphQLList} from 'graphql'

import {buildType} from 'revali/typeHelpers'
import {isWrapper, Wrapper, WrapperOrType} from 'revali/wrappers/Wrapper'

export function list<T>(type: WrapperOrType<T>): Wrapper<T[], GraphQLList<any>> {
  const currentType = buildType(type, true)
  const transformOutput = isWrapper(type) && type.transformOutput
  return {
    graphQLType: new GraphQLList(currentType),
    transformOutput: transformOutput
      ? (values: T[]) => values.map(transformOutput.bind(type))
      : undefined,
    type: [],
  }
}
