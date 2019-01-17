import 'jest'

import {Arg} from 'revali/decorators'
import {Graph} from 'revali/graph'

describe('Arg', () => {
  it('sets the config in the registrar', () => {
    const createArgSpy = jest.spyOn(Graph.prototype, 'createArg')

    class Test {
      public foo(@Arg('bar') bar: string): string {
        return ''
      }
    }

    expect(createArgSpy).toBeCalled()

    const callParams = createArgSpy.mock.calls[0]
    expect(callParams).toHaveLength(3)
    expect(callParams[0]).toBe(Test)
    expect(callParams[1]).toBe('foo')
    expect(callParams[2]).toHaveProperty('name', 'bar')

    createArgSpy.mockRestore()
  })
})
