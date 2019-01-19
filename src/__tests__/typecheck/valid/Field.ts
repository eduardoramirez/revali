import {GraphQLResolveInfo} from 'graphql'

import {
  Field,
  fieldDecoratorForContext,
  nullable,
  TSGraphQLID,
  TSGraphQLInt,
  TSGraphQLString,
} from 'revali/index'
import {Maybe} from 'revali/types'

class Data {
  public value!: string
}

class SomeArgs {
  public a!: string
  public b!: number
  public c!: boolean
}

class Context {
  public isAuthorized!: boolean
}

const ScopedField = fieldDecoratorForContext(Context)

class SomeType {
  @Field()
  public string!: string

  @Field()
  public boolean!: boolean

  @Field()
  public number!: number

  @Field({type: nullable(TSGraphQLInt)})
  public nullableInt: Maybe<number>

  @Field({type: TSGraphQLID})
  public id!: Promise<string | number>

  @Field({type: Data})
  public async data() {
    return new Data()
  }

  @Field({type: Data, context: Context})
  public async dataWithContext() {
    return new Data()
  }

  @Field({type: Data})
  public dataNoContext(args: {}, context: undefined, info: GraphQLResolveInfo) {
    return new Data()
  }

  @ScopedField({type: TSGraphQLString})
  public async scoped(args: {}, context: Context) {
    return ''
  }

  @Field({
    type: nullable(Data),
    args: SomeArgs,
    description: 'some data',
    deprecationReason: 'old',
    context: Context,
  })
  public async oldData(args: SomeArgs, context: Context) {
    return null
  }
}
