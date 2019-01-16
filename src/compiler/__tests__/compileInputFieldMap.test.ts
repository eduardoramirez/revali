import {GraphQLNonNull, GraphQLString} from 'graphql'
import 'jest'
import {size} from 'lodash'

import {compileInputFieldConfigMap} from 'revali/compiler'
import {InputField, InputObjectType} from 'revali/decorators'
import {resolveThunk} from 'revali/utils'
import {compileInputObjectType} from '../compileInputObject'

describe('compileInputFieldMap', () => {
  it('creates the inputField map', () => {
    @InputObjectType()
    class SomeType {
      @InputField()
      public foo!: string
    }

    class TestWithInputFields {
      @InputField()
      public bar!: string

      @InputField({type: SomeType})
      public baz!: SomeType
    }

    const config = resolveThunk(compileInputFieldConfigMap(TestWithInputFields))
    expect(size(config)).toEqual(2)
    expect(config.bar).toHaveProperty('type', new GraphQLNonNull(GraphQLString))
    expect(config.baz).toHaveProperty('type', new GraphQLNonNull(compileInputObjectType(SomeType)))
  })
})
