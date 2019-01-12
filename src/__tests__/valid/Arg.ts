import {Arg, TSGraphQLID} from 'revali/index'

class Data {
  public foo!: number
}

class Args {
  public clazz(@Arg('id', {type: Data}) id: Data): string {
    return ''
  }

  public str(@Arg('id') id: string): string {
    return ''
  }

  public wrapper(@Arg('id', {type: TSGraphQLID}) id: string | number): string {
    return ''
  }
}
