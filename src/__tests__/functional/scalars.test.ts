import {
  getIntrospectionQuery,
  graphql,
  GraphQLScalarType,
  GraphQLSchema,
  printSchema,
} from 'graphql'

import {
  Arg,
  compileSchema,
  Field,
  ObjectType,
  scalarType,
  TSGraphQLBoolean,
  TSGraphQLFloat,
  TSGraphQLID,
  TSGraphQLInt,
  TSGraphQLString,
} from 'revali/index'
import {wrapScalar} from 'revali/wrappers/Wrapper'

const CustomScalar = scalarType<string, string>({
  name: 'Custom',
  description: 'My custom scalar wohoo',
  parseLiteral: () => 'did parseLiteral',
  parseValue: () => 'did parseValue',
  serialize: () => 'did serialize',
})

const ObjectScalar = new GraphQLScalarType({
  name: 'ObjectScalar',
  parseLiteral: () => ({
    value: 'did parseLiteral',
  }),
  parseValue: () => ({
    value: 'did parseValue',
  }),
  serialize: obj => obj.value,
})

class CustomObjectType {
  public value!: string
}
const ObjectScalarType = wrapScalar<CustomObjectType>(ObjectScalar)

describe('Scalars', () => {
  let schema: GraphQLSchema
  let scalarArg: any

  beforeAll(() => {
    @ObjectType()
    class SampleObject {
      @Field({type: TSGraphQLID})
      public idField!: string

      @Field()
      public implicitFloatField!: number

      @Field({type: TSGraphQLFloat})
      public explicitFloatField!: number

      @Field({type: TSGraphQLInt})
      public intField!: number

      @Field()
      public implicitStringField!: string

      @Field({type: TSGraphQLString})
      public explicitStringField!: string

      @Field()
      public implicitBooleanField!: boolean

      @Field({type: TSGraphQLBoolean})
      public explicitBooleanField!: boolean

      @Field({type: CustomScalar})
      public customScalarField!: string
    }

    @ObjectType()
    class Query {
      @Field({type: SampleObject})
      public mainQuery(): SampleObject {
        return {} as any
      }

      @Field({type: CustomScalar})
      public returnScalar(): string {
        return 'returnScalar'
      }

      @Field({type: TSGraphQLBoolean, arg: CustomScalar})
      public argScalar(@Arg('scalar') scalar: string): boolean {
        scalarArg = scalar
        return true
      }

      @Field({type: TSGraphQLBoolean, arg: ObjectScalarType})
      public objectArgScalar(@Arg('scalar') scalar: CustomObjectType): boolean {
        scalarArg = scalar
        return true
      }
    }

    schema = compileSchema({Query})
  })

  afterEach(() => {
    scalarArg = undefined
  })

  it('generates scalars correctly', async () => {
    const {errors} = await graphql(schema, getIntrospectionQuery())
    expect(errors).toBeFalsy()
    expect(printSchema(schema)).toMatchSnapshot()
  })

  it('should properly serialize data', async () => {
    const query = `query {
        returnScalar
      }`
    const result = await graphql(schema, query)
    const returnScalar = result.data!.returnScalar

    expect(returnScalar).toEqual('did serialize')
  })

  it('should properly parse args', async () => {
    const query = `query {
        argScalar(scalar: "test")
      }`

    const result = await graphql(schema, query)

    expect(result).toHaveProperty('data', {
      argScalar: true,
    })
    expect(result.errors).toBeFalsy()
    expect(scalarArg!).toEqual('did parseLiteral')
  })

  it('should properly parse scalar object', async () => {
    const query = `query {
        objectArgScalar(scalar: "test")
      }`
    await graphql(schema, query)

    expect(scalarArg!).toEqual({value: 'did parseLiteral'})
  })
})
