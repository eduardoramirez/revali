import {TSGraphQLID} from '../../..'
import {Arg} from '../../Arg'

class Data {
  public foo!: number
}

class Args {
  @Arg()
  public string!: string

  @Arg()
  public int: number = 4

  @Arg()
  public bool!: boolean

  @Arg({type: TSGraphQLID})
  public id!: string | number

  @Arg({type: Data})
  public data!: Data
}
