import {GraphQLScalarType, GraphQLString} from 'graphql'
import 'jest'

import {nullable} from 'revali/wrappers/nullable'
import {Wrapper} from 'revali/wrappers/Wrapper'

const output = 'OUTPUT'

const wrapper: Wrapper<string, GraphQLScalarType> = {
  graphQLType: GraphQLString,
  type: '',
  transformOutput: () => output,
}

describe('nullable', () => {
  it('should call transform output for non null falsy values', () => {
    const wrapped = nullable(wrapper)
    expect(wrapped.transformOutput!('')).toEqual(output)
  })
})
