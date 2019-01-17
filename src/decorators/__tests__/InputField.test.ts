import 'jest'

import {InputField} from 'revali/decorators'
import {Graph} from 'revali/graph'
import {resolveThunk} from 'revali/utils'
import {TSGraphQLString} from 'revali/wrappers/scalars'

describe('InputField', () => {
  it('calls the right method on the registry', () => {
    const spy = jest.spyOn(Graph.prototype, 'createInputField')

    class TestType {}

    class TestWithInputFields {
      @InputField()
      public foo!: string

      @InputField()
      public baz: string = 'a'

      @InputField({type: TestType})
      public bar!: TestType
    }

    expect(spy).toHaveBeenCalledTimes(3)

    let callParams = spy.mock.calls[0]
    expect(callParams).toHaveLength(2)
    expect(callParams[0]).toBe(TestWithInputFields)
    let metadata = resolveThunk(callParams[1])
    expect(metadata).toHaveProperty('name', 'foo')
    expect(metadata).toHaveProperty('type', TSGraphQLString)

    callParams = spy.mock.calls[1]
    expect(callParams).toHaveLength(2)
    expect(callParams[0]).toBe(TestWithInputFields)
    metadata = resolveThunk(callParams[1])
    expect(metadata).toHaveProperty('name', 'baz')
    expect(metadata).toHaveProperty('type', TSGraphQLString)
    expect(metadata).toHaveProperty('defaultValue', 'a')

    callParams = spy.mock.calls[2]
    expect(callParams).toHaveLength(2)
    expect(callParams[0]).toBe(TestWithInputFields)
    metadata = resolveThunk(callParams[1])
    expect(metadata).toHaveProperty('name', 'bar')
    expect(metadata).toHaveProperty('type', TestType)

    spy.mockRestore()
  })
})
