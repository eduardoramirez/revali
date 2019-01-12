import 'jest'

import {Implements} from 'revali/implements'
import {buildInterfaceType, InterfaceType} from 'revali/interface'
import {buildObjectType, ObjectType} from 'revali/object'

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
