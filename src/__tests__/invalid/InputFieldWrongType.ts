import {InputField, TSGraphQLString} from 'revali/index'
class Args {
  @InputField({type: TSGraphQLString})
  public foo!: number
}
