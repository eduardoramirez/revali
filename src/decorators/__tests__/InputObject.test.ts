import 'jest'

import {InputObjectType} from 'revali/decorators'
import {registrar} from 'revali/metadata'

describe('InputObjectType', () => {
  it('writes the input object metadata to the registry', () => {
    @InputObjectType()
    class TestInputObject {}

    expect(registrar.getInputObjectMetadata(TestInputObject)).toHaveProperty(
      'name',
      'TestInputObject'
    )
  })
})
