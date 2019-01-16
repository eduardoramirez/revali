import {GraphQLInputObjectType} from 'graphql'
import 'jest'
import {size} from 'lodash'

import {compileInputObjectType} from 'revali/compiler'
import {InputField, InputObjectType} from 'revali/decorators'

describe('compileInputObject', () => {
  it('creates the inputField map', () => {
    @InputObjectType()
    class SomeType {
      @InputField()
      public foo!: string
    }

    const type = compileInputObjectType(SomeType)
    expect(type).toBeTruthy()
    expect(type).toBeInstanceOf(GraphQLInputObjectType)
    expect(size(type.getFields())).toEqual(1)
  })
})
