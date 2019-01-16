import 'jest'

import {InputField} from 'revali/decorators'
import {registrar} from 'revali/metadata'
import {resolveThunk} from 'revali/utils'
import {TSGraphQLString} from 'revali/wrappers/scalars'

describe('InputField', () => {
  it('creates an input field list in the registry', () => {
    class TestType {}

    class TestWithInputFields {
      @InputField()
      public foo!: string

      @InputField({type: TestType})
      public bar!: TestType
    }

    const inputFieldConfigList = registrar.getInputFieldMetadataList(TestWithInputFields)
    expect(inputFieldConfigList).toHaveLength(2)
    expect(resolveThunk(inputFieldConfigList[0])).toEqual({type: TSGraphQLString, name: 'foo'})
    expect(resolveThunk(inputFieldConfigList[1])).toEqual({type: TestType, name: 'bar'})
  })

  it('retrieves default value of input field defined in prototype', () => {
    class TestWithInputFields {
      @InputField()
      public foo: string = 'bar'
    }

    const inputFieldConfigList = registrar.getInputFieldMetadataList(TestWithInputFields)
    expect(inputFieldConfigList).toHaveLength(1)
    expect(resolveThunk(inputFieldConfigList[0])).toEqual({
      type: TSGraphQLString,
      name: 'foo',
      defaultValue: 'bar',
    })
  })
})
