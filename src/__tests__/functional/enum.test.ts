import {getIntrospectionQuery, graphql, printSchema} from 'graphql'

import {ObjectType} from 'revali/decorators'
import {Arg, compileSchema, enumType, Field, InputField, InputObjectType} from 'revali/index'
import {TSGraphQLBoolean} from 'revali/wrappers/scalars'

describe('Enums', () => {
  it('generates correct output for enums', async () => {
    enum NumberEnum {
      One = 1,
      Two,
      Three,
      Four,
    }
    const NumberEnumType = enumType(NumberEnum, {name: 'NumberEnum'})

    enum StringEnum {
      One = 'ONE',
      Two = 'TWO',
      Three = 'THREE',
    }
    const StringEnumType = enumType(StringEnum, {
      name: 'StringEnum',
      description: 'custom string enum',
    })

    @InputObjectType()
    class NumberEnumInput {
      @InputField({type: NumberEnumType})
      public numberEnumField!: NumberEnum
    }

    @InputObjectType()
    class StringEnumInput {
      @InputField({type: StringEnumType})
      public stringEnumField!: StringEnum
    }

    @ObjectType()
    class Query {
      @Field({type: NumberEnumType, arg: NumberEnumInput})
      public getNumberEnumValue(@Arg('input') input: NumberEnumInput): NumberEnum {
        return NumberEnum.Two
      }

      @Field({type: StringEnumType, arg: StringEnumInput})
      public getStringEnumValue(@Arg('input') input: StringEnumInput): StringEnum {
        return StringEnum.Two
      }

      @Field({type: TSGraphQLBoolean, arg: NumberEnumType})
      public isNumberEnumEqualOne(@Arg('enum') numberEnum: NumberEnum): boolean {
        return numberEnum === NumberEnum.One
      }

      @Field({type: TSGraphQLBoolean, arg: StringEnumType})
      public isStringEnumEqualOne(@Arg('enum') stringEnum: StringEnum): boolean {
        return stringEnum === StringEnum.One
      }
    }

    const schema = compileSchema({Query})
    const {errors} = await graphql(schema, getIntrospectionQuery())
    expect(errors).toBeFalsy()
    expect(printSchema(schema)).toMatchSnapshot()
  })
})
