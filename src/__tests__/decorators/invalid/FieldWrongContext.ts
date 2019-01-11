import {TSGraphQLString} from '../../..'
import {Field} from '../../Field'

class Context {
  public blah!: string
}

class Foo {
  @Field({type: TSGraphQLString, context: Context})
  public foo(args: {}, context: Foo) {
    return ''
  }
}
