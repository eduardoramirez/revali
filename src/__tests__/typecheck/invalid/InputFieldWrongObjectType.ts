import {InputField} from 'revali/index'

class A {
  public a!: string
}

class B {
  public b!: string
}

class Args {
  @InputField({type: A})
  public foo() {
    return B
  }
}
