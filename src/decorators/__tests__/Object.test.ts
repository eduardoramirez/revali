import 'jest'

import {ObjectType} from 'revali/decorators'
import {Graph} from 'revali/graph'

describe('ObjectType', () => {
  it('calls the registry with the right object params', () => {
    const spy = jest.spyOn(Graph.prototype, 'createObject')

    @ObjectType()
    class TestObject {}

    expect(spy).toBeCalledWith(TestObject, {name: 'TestObject'})
    spy.mockRestore()
  })
})
