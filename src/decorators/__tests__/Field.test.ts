import 'jest'

import {Field} from 'revali/decorators'
import {Graph} from 'revali/graph'
import {resolveThunk} from 'revali/utils'
import {TSGraphQLString} from 'revali/wrappers/scalars'

describe('Field', () => {
  it('calls the right method on the registry', () => {
    const spy = jest.spyOn(Graph.prototype, 'createField')

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

    expect(spy).toHaveBeenCalledTimes(4)

    let callParams = spy.mock.calls[0]
    expect(callParams).toHaveLength(2)
    expect(callParams[0]).toBe(TestWithFields)
    let metadata = resolveThunk(callParams[1])
    expect(metadata).toHaveProperty('name', 'foo')
    expect(metadata).toHaveProperty('type', TSGraphQLString)

    callParams = spy.mock.calls[1]
    expect(callParams).toHaveLength(2)
    expect(callParams[0]).toBe(TestWithFields)
    metadata = resolveThunk(callParams[1])
    expect(metadata).toHaveProperty('name', 'bar')
    expect(metadata).toHaveProperty('type', TestType)

    callParams = spy.mock.calls[2]
    expect(callParams).toHaveLength(2)
    expect(callParams[0]).toBe(TestWithFields)
    metadata = resolveThunk(callParams[1])
    expect(metadata).toHaveProperty('name', 'baz')
    expect(metadata).toHaveProperty('type', TSGraphQLString)

    callParams = spy.mock.calls[3]
    expect(callParams).toHaveLength(2)
    expect(callParams[0]).toBe(TestWithFields)
    metadata = resolveThunk(callParams[1])
    expect(metadata).toHaveProperty('name', 'biz')
    expect(metadata).toHaveProperty('type', TSGraphQLString)

    spy.mockRestore()
  })
})
