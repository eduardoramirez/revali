import {Implements} from 'revali/index'

class SomeInterface {
  public a!: string
  public b!: number
}

@Implements(SomeInterface)
class Foo {
  public a!: string
}
