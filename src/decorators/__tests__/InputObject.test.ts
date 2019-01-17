import 'jest'

import {InputObjectType} from 'revali/decorators'
import {Graph} from 'revali/graph'

describe('InputObjectType', () => {
  it('calls the write registry fucntion', () => {
    const spy = jest.spyOn(Graph.prototype, 'createInputObject')

    @InputObjectType()
    class TestInputObject {}

    expect(spy).toBeCalledWith(TestInputObject, {name: 'TestInputObject'})
    spy.mockRestore()
  })
})
