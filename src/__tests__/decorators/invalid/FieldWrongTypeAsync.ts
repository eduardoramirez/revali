import {Field} from '../../Field'

class A {
  public a!: string
}

class Test {
  @Field({type: A})
  public async test() {
    return null
  }
}
