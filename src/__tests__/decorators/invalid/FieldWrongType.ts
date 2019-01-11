import {TSGraphQLString} from '../../..'
import {Field} from '../../Field'

class Foo {
  @Field({type: TSGraphQLString})
  public foo!: number
}
