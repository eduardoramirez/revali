import 'jest'

import {Args} from 'revali/decorators'
import {Graph} from 'revali/graph'

describe('Args', () => {
  it('marks the class as args in the registrar', () => {
    const createArgsSpy = jest.spyOn(Graph.prototype, 'createArgs')

    @Args()
    class Test {}

    expect(createArgsSpy).toBeCalledWith(Test)

    createArgsSpy.mockRestore()
  })
})
