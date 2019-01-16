import 'jest'

import {Field, Implements, InterfaceType, ObjectType} from 'revali/decorators'
import {registrar} from 'revali/metadata'

describe('ObjectType', () => {
  it('writes the object metadata to the registry', () => {
    @ObjectType()
    class TestObject {}

    expect(registrar.getObjectMetadata(TestObject)).toHaveProperty('name', 'TestObject')
  })

  it('extracts interfaces from inheritance chain', () => {
    @InterfaceType()
    abstract class Foo {
      @Field()
      public foo!: string
    }

    @ObjectType()
    @Implements(Foo)
    class A {
      public foo!: string
    }

    @ObjectType()
    class B extends A {}

    expect(registrar.getInterfaceMetadata(Foo)).toHaveProperty('implementers', [A, B])
    expect(registrar.getObjectMetadata(B)).toHaveProperty('interfaces', [Foo])
  })
})
