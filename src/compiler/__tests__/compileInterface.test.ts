import {GraphQLInterfaceType} from 'graphql'
import 'jest'
import {size} from 'lodash'

import {compileInterfaceType} from 'revali/compiler'
import {Field, InterfaceType} from 'revali/decorators'

describe('compileInterface', () => {
  it('creates the inputField map', () => {
    @InterfaceType()
    class SomeType {
      @Field()
      public foo!: string
    }

    const type = compileInterfaceType(SomeType)
    expect(type).toBeTruthy()
    expect(type).toBeInstanceOf(GraphQLInterfaceType)
    expect(size(type.getFields())).toEqual(1)
  })
})
