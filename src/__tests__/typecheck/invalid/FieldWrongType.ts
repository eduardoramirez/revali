import {Field, TSGraphQLString} from 'revali/index'

class Foo {
  @Field({type: TSGraphQLString})
  public foo!: number
}
