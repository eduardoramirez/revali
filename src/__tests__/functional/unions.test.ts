import {getIntrospectionQuery, graphql, GraphQLSchema, printSchema} from 'graphql'

import {compileSchema, Field, ObjectType, unionType} from 'revali/index'

describe('Unions', () => {
  let schema: GraphQLSchema

  beforeAll(() => {
    @ObjectType()
    class ObjectOne {
      @Field()
      public fieldOne!: string
    }
    @ObjectType()
    class ObjectTwo {
      @Field()
      public fieldTwo!: string
    }
    @ObjectType()
    class ObjectThree {
      @Field()
      public fieldThree!: string
    }

    const OneTwoThreeUnion = unionType<ObjectOne | ObjectTwo | ObjectThree>({
      name: 'OneTwoThreeUnion',
      description: 'OneTwoThreeUnion description',
      types: [ObjectOne, ObjectTwo, ObjectThree],
    })

    @ObjectType()
    class ObjectUnion {
      @Field({type: OneTwoThreeUnion})
      public unionField!: ObjectOne | ObjectTwo | ObjectThree
    }

    @ObjectType()
    class Query {
      @Field({type: OneTwoThreeUnion})
      public getObjectOneFromUnion(): ObjectTwo {
        const oneInstance = new ObjectTwo()
        oneInstance.fieldTwo = 'fieldTwo'
        return oneInstance
      }

      @Field({type: ObjectUnion})
      public getObjectWithUnion(): ObjectUnion {
        const oneInstance = new ObjectTwo()
        oneInstance.fieldTwo = 'fieldTwo'
        return {
          unionField: oneInstance,
        }
      }
    }

    schema = compileSchema({Query})
  })

  it('generates union types correctly', async () => {
    const {errors} = await graphql(schema, getIntrospectionQuery())
    expect(errors).toBeFalsy()
    expect(printSchema(schema)).toMatchSnapshot()
  })

  it('should correctly recognize returned object type on query returning union', async () => {
    const query = `query {
        getObjectOneFromUnion {
          __typename
          ... on ObjectOne {
            fieldOne
          }
          ... on ObjectTwo {
            fieldTwo
          }
        }
      }`

    const result = await graphql(schema, query)
    const data = result.data!.getObjectOneFromUnion
    expect(data.__typename).toEqual('ObjectTwo')
    expect(data.fieldTwo).toEqual('fieldTwo')
    expect(data.fieldOne).toBeUndefined()
  })

  it('should correctly recognize returned object type from union on object field', async () => {
    const query = `query {
        getObjectWithUnion {
          unionField {
            __typename
            ... on ObjectOne {
              fieldOne
            }
            ... on ObjectTwo {
              fieldTwo
            }
          }
        }
      }`

    const result = await graphql(schema, query)
    const unionFieldData = result.data!.getObjectWithUnion.unionField

    expect(unionFieldData.__typename).toEqual('ObjectTwo')
    expect(unionFieldData.fieldTwo).toEqual('fieldTwo')
    expect(unionFieldData.fieldOne).toBeUndefined()
  })
})
