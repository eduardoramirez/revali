import 'jest'

import {Args} from 'revali/decorators'
import {registrar} from 'revali/metadata'

describe('Args', () => {
  it('marks the class as args in the registrar', () => {
    @Args()
    class Test {}

    expect(registrar.isArgsType(Test)).toEqual(true)
  })
})
