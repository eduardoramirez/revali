import {unionType} from '../../../wrappers/unionType'
import {Field} from '../../Field'

class A {
  public foo!: string
}

class B {
  public bar!: string
}

const AUnionType = unionType<A | B>({
  name: 'AUnionType',
  types: [A, B],
})

class Foo {
  @Field({type: AUnionType})
  public foo!: number
}
