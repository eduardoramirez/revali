import 'jest'

import {Field} from 'revali/field'
import {getImplementers, Implements} from 'revali/implements'
import {InterfaceType} from 'revali/interface'
import {ObjectType} from 'revali/object'

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

describe('ObjectType', () => {
  it('should save implementers for superclasses', () => {
    const implementers = getImplementers(Foo)
    expect(implementers).toBeTruthy()
    expect(implementers).toHaveLength(2)
    expect(implementers).toContain(B)
  })
})
