import {Arg, Field, TSGraphQLString} from 'revali/index'

class Data {
  public foo!: number
}

class Args {
  @Field({type: TSGraphQLString, arg: Data})
  public clazz(@Arg('id') id: Data): string {
    return ''
  }

  @Field({type: TSGraphQLString, arg: TSGraphQLString})
  public str(@Arg('id') id: string): string {
    return ''
  }

  @Field({type: TSGraphQLString, arg: TSGraphQLString})
  public wrapper(@Arg('id') id: string | number): string {
    return ''
  }
}
