import 'jest'

import {Field} from 'revali/decorators'
import {registrar} from 'revali/metadata'
import {resolveThunk} from 'revali/utils'
import {TSGraphQLString} from 'revali/wrappers/scalars'

describe('Field', () => {
  it('creates a field list in the registry', () => {
    class TestType {}

    class TestWithFields {
      @Field()
      public foo!: string

      @Field({type: TestType})
      public bar!: TestType

      @Field({type: TSGraphQLString})
      public baz(): string {
        return ''
      }

      @Field({type: TSGraphQLString})
      public biz(): Promise<string> {
        return Promise.resolve('')
      }
    }

    const fieldConfigList = registrar.getFieldMetadataList(TestWithFields)
    expect(fieldConfigList).toHaveLength(4)
    expect(resolveThunk(fieldConfigList[0])).toEqual({
      type: TSGraphQLString,
      name: 'foo',
    })
    expect(resolveThunk(fieldConfigList[1])).toEqual({type: TestType, name: 'bar'})
    expect(resolveThunk(fieldConfigList[2])).toEqual({type: TSGraphQLString, name: 'baz'})
    expect(resolveThunk(fieldConfigList[3])).toEqual({type: TSGraphQLString, name: 'biz'})
  })
})
