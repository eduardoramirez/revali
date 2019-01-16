import 'jest'

import {InterfaceType} from 'revali/decorators'
import {registrar} from 'revali/metadata'

describe('InterfaceType', () => {
  it('writes the interface metadata to the registry', () => {
    @InterfaceType()
    class TestInterface {}

    expect(registrar.getInterfaceMetadata(TestInterface)).toHaveProperty('name', 'TestInterface')
  })
})
