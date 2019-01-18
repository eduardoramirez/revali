import {Field, TSGraphQLString} from 'revali/index'
class Context {
  public blah!: string
}

class Foo {
  @Field({type: TSGraphQLString, context: Context})
  public foo(args: {}, context: Foo) {
    return ''
  }
}
