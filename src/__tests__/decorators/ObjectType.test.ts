import 'jest'

import {InterfaceType} from '../../index'
import {getImplementers} from '../../metadata'
import {Field} from '../Field'
import {Implements} from '../Implements'
import {ObjectType} from '../ObjectType'

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
