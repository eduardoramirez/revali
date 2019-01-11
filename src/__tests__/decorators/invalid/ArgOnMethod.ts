import {TSGraphQLString} from '../../..'
import {Arg} from '../../Arg'

class Args {
  @Arg({type: TSGraphQLString})
  public foo() {
    return ''
  }
}
