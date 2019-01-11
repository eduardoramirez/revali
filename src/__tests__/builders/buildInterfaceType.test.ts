import 'jest'

import {Implements} from '../../decorators/Implements'
import {InterfaceType} from '../../decorators/InterfaceType'
import {ObjectType} from '../../decorators/ObjectType'
import {buildInterfaceType} from '../buildInterfaceType'
import {buildObjectType} from '../buildObjectType'

describe('buildInterfaceType', () => {
  it('should throw if not an interface type', () => {
    class Foo {}
    expect(() => buildInterfaceType(Foo)).toThrow()
  })

  describe('resolveType', () => {
    @InterfaceType()
    class Foo {}

    @ObjectType()
    @Implements(Foo)
    class A {}

    @ObjectType()
    @Implements(Foo)
    class B {}

    const iface = buildInterfaceType(Foo)

    it('should resolve correct object type', () => {
      expect(iface.resolveType!(new A(), {}, null as any)).toEqual(buildObjectType(A))
      expect(iface.resolveType!(new B(), {}, null as any)).toEqual(buildObjectType(B))
    })

    it('should throw if source does not implement', () => {
      class C {}
      expect(() => iface.resolveType!(new C(), {}, null as any)).toThrow()
    })
  })
})
