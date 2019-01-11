import {Implements} from '../../Implements'

class SomeInterface {
  public a!: string
  public b!: number
}

@Implements(SomeInterface)
class Foo {
  public a!: string
  public b!: string
}
