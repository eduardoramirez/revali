import {GraphQLObjectType} from 'graphql'
import 'jest'
import {size} from 'lodash'

import {compileObjectType} from 'revali/compiler'
import {Field, ObjectType} from 'revali/decorators'

describe('compileObject', () => {
  it('creates the inputField map', () => {
    @ObjectType()
    class SomeType {
      @Field()
      public foo!: string
    }

    const type = compileObjectType(SomeType)
    expect(type).toBeTruthy()
    expect(type).toBeInstanceOf(GraphQLObjectType)
    expect(size(type.getFields())).toEqual(1)
  })
})
