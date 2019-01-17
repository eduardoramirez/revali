import 'jest'

import {Implements, InterfaceType, ObjectType} from 'revali/decorators'
import {Graph} from 'revali/graph'

describe('Implements', () => {
  it('updates the interface and object with implementers/interfaces', () => {
    const spy = jest.spyOn(Graph.prototype, 'createImplement')

    @InterfaceType()
    class TestIface {}

    @ObjectType()
    @Implements(TestIface)
    class TestImplementer {}

    expect(spy).toBeCalledWith(TestImplementer, TestIface)
    spy.mockRestore()
  })
})
