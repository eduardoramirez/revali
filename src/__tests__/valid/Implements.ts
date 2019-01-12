import {Implements} from 'revali/index'

class Data {
  public data!: string
}

class SomeInterface {
  public string!: string
  public number!: number
  public bool!: boolean
  public data!: Data
}

class AnotherInterface {
  public foo!: string
}

@Implements(SomeInterface)
class A {
  public string!: string
  public number!: Promise<number>
  public bool(): boolean {
    return false
  }
  public data() {
    return Promise.resolve(new Data())
  }
}

@Implements(SomeInterface)
@Implements(AnotherInterface)
class B {
  public string!: string
  public number!: number
  public bool!: boolean
  public data!: Data
  public foo!: string
}
