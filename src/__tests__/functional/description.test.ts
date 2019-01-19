import {getIntrospectionQuery, graphql, printSchema} from 'graphql'
import 'jest'

import {
  Arg,
  Args,
  compileSchema,
  Field,
  InputField,
  InputObjectType,
  ObjectType,
  TSGraphQLString,
} from 'revali/index'

describe('Description', () => {
  it('generates description messages on types', async () => {
    // create sample definitions

    @ObjectType({description: 'sample object description'})
    class SampleObject {
      @Field({type: TSGraphQLString})
      public normalField!: string

      @Field({type: TSGraphQLString, description: 'sample object field description'})
      public describedField!: string

      @Field({type: TSGraphQLString, description: 'sample object getter field description'})
      get describedGetterField(): string {
        return 'describedGetterField'
      }

      @Field({
        type: TSGraphQLString,
        arg: TSGraphQLString,
        description: 'sample object method field description',
      })
      public methodField(
        @Arg('arg', {description: 'sample object method arg description'}) arg: string
      ): string {
        return 'methodField'
      }
    }

    @InputObjectType({description: 'sample input description'})
    class SampleInput {
      @InputField()
      public normalField!: string

      @InputField({description: 'sample input field description'})
      public describedField!: string
    }

    @Args()
    class SampleArguments {
      @InputField()
      public normalField!: string

      @InputField({description: 'sample argument field description'})
      public describedField!: string
    }

    @Args()
    class DescribeArgs {
      @InputField()
      public normalArg!: string

      @InputField({description: 'sample query arg description'})
      public describedArg!: string
    }

    @ObjectType()
    class Query {
      @Field({type: TSGraphQLString})
      public normalQuery(): string {
        return 'normalQuery'
      }

      @Field({type: TSGraphQLString, args: DescribeArgs, description: 'sample query description'})
      public describedQuery({normalArg, describedArg}: DescribeArgs): string {
        return 'describedQuery'
      }

      @Field({type: TSGraphQLString, args: SampleArguments})
      public argumentedQuery(args: SampleArguments): string {
        return 'argumentedQuery'
      }

      @Field({type: TSGraphQLString, arg: SampleInput})
      public inputQuery(@Arg('input') input: SampleInput): string {
        return 'inputQuery'
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

      @Field({
        type: TSGraphQLString,
        args: DescribeArgs,
        description: 'sample mutation description',
      })
      public describedMutation({normalArg, describedArg}: DescribeArgs): string {
        return 'describedMutation'
      }

      @Field({type: TSGraphQLString, args: SampleArguments})
      public argumentedMutation(args: SampleArguments): string {
        return 'argumentedMutation'
      }

      @Field({type: TSGraphQLString, arg: SampleInput})
      public inputMutation(@Arg('input') input: SampleInput): string {
        return 'inputMutation'
      }
    }

    const schema = compileSchema({
      Query,
      Mutation,
    })

    const {errors} = await graphql(schema, getIntrospectionQuery())
    expect(errors).toBeFalsy()
    expect(printSchema(schema)).toMatchSnapshot()
  })
})
