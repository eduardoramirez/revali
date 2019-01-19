import {getIntrospectionQuery, graphql, GraphQLSchema, printSchema} from 'graphql'

import {
  Arg,
  Args,
  compileSchema,
  Field,
  InputField,
  InputObjectType,
  list,
  nullable,
  ObjectType,
  TSGraphQLBoolean,
  TSGraphQLFloat,
  TSGraphQLInt,
  TSGraphQLString,
} from 'revali/index'

describe('Resolvers', () => {
  let schema: GraphQLSchema

  beforeAll(() => {
    @InputObjectType()
    class SampleInput {
      @InputField()
      public field!: string

      @InputField({defaultValue: 'defaultStringFieldDefaultValue'})
      public defaultStringField!: string

      @InputField()
      public implicitDefaultStringField: string = 'implicitDefaultStringFieldDefaultValue'
    }

    @InputObjectType()
    class SmallSampleInput {
      @InputField()
      public field!: string

      private on = true
      public isCreated() {
        return this.on
      }
    }

    @Args()
    class SampleArgs {
      @InputField()
      public stringArg!: string

      @InputField({type: nullable(TSGraphQLInt)})
      public numberArg: number | undefined

      @InputField({type: SampleInput})
      public inputObjectArg!: SampleInput

      @InputField({defaultValue: 'defaultStringArgDefaultValue'})
      public defaultStringArg!: string

      @InputField()
      public implicitDefaultStringArg: string = 'implicitDefaultStringArgDefaultValue'
    }

    @Args()
    class SimpleArg {
      @InputField({type: nullable(TSGraphQLString)})
      public stringArg: string | undefined

      @InputField({type: TSGraphQLInt})
      public numberArg!: number

      private on = true
      public isCreated() {
        return this.on
      }
    }

    @Args()
    class ArgMethodFieldArgs {
      @InputField()
      public stringArg!: string

      @InputField()
      public booleanArg!: boolean

      @InputField()
      public numberArg!: number

      @InputField({type: SampleInput})
      public inputArg!: SampleInput

      @InputField({type: nullable(TSGraphQLString)})
      public explicitNullableArg: string | undefined

      @InputField({type: list(TSGraphQLString)})
      public stringArrayArg!: string[]
    }

    @ObjectType()
    class SampleObject {
      @Field()
      public normalField!: string

      @Field()
      public resolverFieldWithArgs!: string

      private rando = Math.random()

      private notExposeField = 'secret'

      @Field({type: TSGraphQLString})
      public simpleMethodField(): string {
        return 'simpleMethodField'
      }

      @Field({type: TSGraphQLInt, arg: TSGraphQLInt})
      public methodFieldWithArg(@Arg('methodArg') methodArg: number): number {
        return methodArg * 13
      }

      @Field({type: TSGraphQLInt, args: SimpleArg})
      public methodReturnsArg({numberArg}: SimpleArg): number {
        return numberArg
      }

      @Field({type: TSGraphQLString})
      public objectSecretField(): string {
        return this.notExposeField
      }

      @Field({type: TSGraphQLFloat, args: ArgMethodFieldArgs})
      public argMethodField({numberArg}: ArgMethodFieldArgs): number {
        return numberArg
      }

      @Field({type: TSGraphQLBoolean, args: SimpleArg})
      public methodIsArgsCreated(args: SimpleArg): boolean {
        return args.isCreated() ? true : false
      }

      @Field({type: TSGraphQLFloat})
      public fingerprintMethod(): number {
        return this.rando
      }

      @Field({type: TSGraphQLBoolean, arg: SmallSampleInput})
      public methodWithInputArg(@Arg('inp') inp: SmallSampleInput): boolean {
        if (inp.isCreated()) {
          return true
        } else {
          return false
        }
      }
    }

    @ObjectType()
    class CtxResponse {
      @Field()
      public isContext!: boolean
    }

    class Context {
      public isContext!: string
    }

    @ObjectType()
    class Query {
      @Field({type: TSGraphQLBoolean})
      public lambdaQuery(): boolean {
        return true
      }

      @Field({type: TSGraphQLBoolean})
      public classQuery(): boolean {
        return true
      }

      @Field({type: nullable(TSGraphQLString)})
      public nullableStringQuery(): string | null {
        return Math.random() > 0.5 ? 'explicitStringQuery' : null
      }

      @Field({type: list(TSGraphQLString)})
      public implicitStringArrayQuery(): string[] {
        return []
      }

      @Field({type: list(nullable(TSGraphQLString))})
      public explicitNullableItemArrayQuery(): Array<string | undefined> {
        return []
      }

      @Field({type: nullable(list(nullable(TSGraphQLString)))})
      public explicitNullableArrayWithNullableItemsQuery(): Array<string | undefined> | undefined {
        return []
      }

      @Field({type: TSGraphQLString})
      public async promiseStringQuery(): Promise<string> {
        return 'promiseStringQuery'
      }

      @Field({type: SampleObject})
      public sampleObject(): SampleObject {
        return new SampleObject()
      }

      @Field({type: SampleObject})
      public async asyncObjectQuery(): Promise<SampleObject> {
        return new SampleObject()
      }

      @Field({type: TSGraphQLString, arg: TSGraphQLString})
      public argQuery(@Arg('arg1') arg1: string): any {
        return arg1
      }

      @Field({type: TSGraphQLString, args: SampleArgs})
      public argsQuery({stringArg}: SampleArgs): any {
        return stringArg
      }

      @Field({type: CtxResponse, context: Context})
      public queryWithRootContext(_: any, ctx: Context): CtxResponse {
        const resp = new CtxResponse()
        resp.isContext = ctx.isContext === 'yes'
        return resp
      }
    }

    schema = compileSchema({Query})
  })

  it('generates schema with field resolvers correctly', async () => {
    const {errors} = await graphql(schema, getIntrospectionQuery())
    expect(errors).toBeFalsy()
    expect(printSchema(schema)).toMatchSnapshot()
  })

  it('should return value from object method resolver', async () => {
    const query = `query {
        sampleObject {
          simpleMethodField
        }
      }`

    const result = await graphql(schema, query)
    expect(result).toHaveProperty('data', {
      sampleObject: {
        simpleMethodField: 'simpleMethodField',
      },
    })
  })

  it('should return value from object method resolver with arg', async () => {
    const query = `query {
        sampleObject {
          methodFieldWithArg(methodArg: 10)
        }
      }`

    const result = await graphql(schema, query)
    expect(result).toHaveProperty('data', {
      sampleObject: {
        methodFieldWithArg: 130,
      },
    })
  })

  it('should return value from field resolver with field access', async () => {
    const query = `query {
        sampleObject {
          objectSecretField
        }
      }`

    const result = await graphql(schema, query)
    expect(result).toHaveProperty('data', {
      sampleObject: {
        objectSecretField: 'secret',
      },
    })
  })

  it('should return value from field resolver arg', async () => {
    const value = 21
    const query = `query {
        sampleObject {
          methodReturnsArg(numberArg: ${value})
        }
      }`

    const result = await graphql(schema, query)
    expect(result).toHaveProperty('data', {
      sampleObject: {
        methodReturnsArg: value,
      },
    })
  })

  it('should create new instances of object type for consecutive queries', async () => {
    const query = `query {
        sampleObject {
          fingerprintMethod
        }
      }`

    const result1 = await graphql(schema, query)
    const result2 = await graphql(schema, query)

    expect(result1).toHaveProperty('data')
    expect(result2).toHaveProperty('data')

    const resolverFieldResult1 = result1.data!.sampleObject.fingerprintMethod
    const resolverFieldResult2 = result2.data!.sampleObject.fingerprintMethod
    expect(resolverFieldResult1).not.toEqual(resolverFieldResult2)
  })

  it('should create instance of input object', async () => {
    const query = `query {
      sampleObject {
        methodWithInputArg(inp: { field: "hello" })
      }
    }`

    const result = await graphql(schema, query)
    expect(result).toHaveProperty('data', {
      sampleObject: {
        methodWithInputArg: true,
      },
    })
  })

  it('should create instance of args object', async () => {
    const query = `query {
      sampleObject {
        methodIsArgsCreated(numberArg: 1)
      }
    }`

    const result = await graphql(schema, query)
    expect(result).toHaveProperty('data', {
      sampleObject: {
        methodIsArgsCreated: true,
      },
    })
  })

  it('should inject context object to resolver', async () => {
    const query = `query {
      queryWithRootContext {
        isContext
      }
    }`

    const context = {isContext: 'yes'}

    const result = await graphql(schema, query, null, context)
    expect(result).toHaveProperty('data', {
      queryWithRootContext: {
        isContext: true,
      },
    })
  })
})
