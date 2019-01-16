import 'jest'

import {Implements, InterfaceType, ObjectType} from 'revali/decorators'
import {registrar} from 'revali/metadata'

describe('Implements', () => {
  it('updates the interface and object with implementers/interfaces', () => {
    @InterfaceType()
    class TestIface {}

    @ObjectType()
    @Implements(TestIface)
    class TestImplementer {}

    expect(registrar.getObjectMetadata(TestImplementer)).toHaveProperty('interfaces', [TestIface])
    expect(registrar.getInterfaceMetadata(TestIface)).toHaveProperty('implementers', [
      TestImplementer,
    ])
  })
})
