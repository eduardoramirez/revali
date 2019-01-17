import 'jest'

import {InterfaceType} from 'revali/decorators'
import {Graph} from 'revali/graph'

describe('InterfaceType', () => {
  it('calls the registry with the right parameters', () => {
    const spy = jest.spyOn(Graph.prototype, 'createInterface')

    @InterfaceType()
    class TestInterface {}

    expect(spy).toBeCalledWith(TestInterface, {name: 'TestInterface'})
    spy.mockRestore()
  })
})
