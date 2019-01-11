import {Arg} from '../../Arg'

class A {
  public a!: string
}

class B {
  public b!: string
}

class Args {
  @Arg({type: A})
  public foo() {
    return B
  }
}
