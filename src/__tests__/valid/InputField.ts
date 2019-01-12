import {InputField, TSGraphQLID} from 'revali/index'

class Data {
  public foo!: number
}

class Args {
  @InputField()
  public string!: string

  @InputField()
  public int: number = 4

  @InputField()
  public bool!: boolean

  @InputField({type: TSGraphQLID})
  public id!: string | number

  @InputField({type: Data})
  public data!: Data
}
