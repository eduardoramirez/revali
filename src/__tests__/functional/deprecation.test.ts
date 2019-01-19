import {getIntrospectionQuery, graphql, printSchema} from 'graphql'
import 'jest'

import {compileSchema, Field, ObjectType, TSGraphQLString} from 'revali/index'

describe('Deprecation', () => {
  it('Generates correct deprecation comments and directives', async () => {
    @ObjectType()
    class SampleObject {
      @Field()
      public normalField!: string

      @Field({deprecationReason: 'sample object field deprecation reason'})
      public describedField!: string

      @Field({
        type: TSGraphQLString,
        deprecationReason: 'sample object getter field deprecation reason',
      })
      get describedGetterField(): string {
        return 'describedGetterField'
      }

      @Field({
        type: TSGraphQLString,
        deprecationReason: 'sample object method field deprecation reason',
      })
      public methodField(): string {
        return 'methodField'
      }
    }

    @ObjectType()
    class Query {
      @Field({type: TSGraphQLString})
      public normalQuery(): string {
        return 'normalQuery'
      }

      @Field({type: TSGraphQLString, deprecationReason: 'sample query deprecation reason'})
      public describedQuery(): string {
        return 'describedQuery'
      }

      @Field({type: SampleObject})
      public object(): SampleObject {
        return new SampleObject()
      }
    }

    @ObjectType()
    class Mutation {
      @Field({type: TSGraphQLString})
      public normalMutation(): string {
        return 'normalMutation'
      }

      @Field({type: TSGraphQLString, deprecationReason: 'sample mutation deprecation reason'})
      public describedMutation(): string {
        return 'describedMutation'
      }
    }

    const schema = compileSchema({Query, Mutation})
    const {errors} = await graphql(schema, getIntrospectionQuery())
    expect(errors).toBeFalsy()
    expect(printSchema(schema)).toMatchSnapshot()
  })
})
