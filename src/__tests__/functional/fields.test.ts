import {getIntrospectionQuery, graphql, printSchema} from 'graphql'

import {compileSchema, Field, list, nullable, ObjectType, TSGraphQLString} from 'revali/index'

describe('Fields', () => {
  it('generates a schema for valid fields', async () => {
    @ObjectType()
    class SampleNestedObject {
      @Field()
      public stringField!: string
    }

    @ObjectType()
    class SampleObject {
      @Field()
      public implicitStringField!: string

      @Field({type: SampleNestedObject})
      public objectField!: SampleNestedObject

      @Field({type: nullable(TSGraphQLString)})
      public explicitNullableStringField: string | undefined

      @Field({type: list(TSGraphQLString)})
      public implicitStringArrayField!: string[]

      @Field({type: nullable(list(TSGraphQLString))})
      public nullableArrayFieldNew: string[] | undefined

      @Field({type: nullable(list(SampleNestedObject))})
      public nullableObjectArrayField: SampleNestedObject[] | undefined

      @Field({type: nullable(list(nullable(TSGraphQLString)))})
      public arrayWithNullableItemField: Array<string | undefined> | undefined

      @Field({type: list(nullable(TSGraphQLString))})
      public nonnullArrayWithNullableItemField!: Array<string | undefined>
    }

    @ObjectType()
    class Query {
      @Field({type: SampleObject})
      public sampleQuery(): SampleObject {
        return {} as SampleObject
      }
    }

    const schema = compileSchema({Query})
    const {errors} = await graphql(schema, getIntrospectionQuery())
    expect(errors).toBeFalsy()
    expect(printSchema(schema)).toMatchSnapshot()
  })
})
