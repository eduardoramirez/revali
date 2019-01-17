import {graphql} from 'graphql'
import 'jest'

import {Field, ObjectType} from 'revali/decorators'
import {compileSchema} from 'revali/index'
import {enumType, EnumTypeCase} from 'revali/wrappers/enumType'

enum IntEnum {
  Foo,
  Bar,
  FooBar,
}

describe('TSGraphQLEnumType', () => {
  it('should generate GraphQLEnumType with correct keys', () => {
    const PascalCase = enumType(IntEnum, {name: 'foo'})
    const pascalNames = PascalCase.graphQLType.getValues().map(({name}) => name)
    expect(pascalNames).toEqual(['Foo', 'Bar', 'FooBar'])

    const ConstantCase = enumType(IntEnum, {name: 'foo', changeCase: EnumTypeCase.Constant})
    const constantNames = ConstantCase.graphQLType.getValues().map(({name}) => name)
    expect(constantNames).toEqual(['FOO', 'BAR', 'FOO_BAR'])
  })

  it('should add config from additional', () => {
    const AnEnum = enumType(IntEnum, {
      name: 'AnEnum',
      additional: {
        Bar: {
          description: 'Description',
        },
      },
    })

    expect(AnEnum.graphQLType.getValue('Bar')!.description).toEqual('Description')
  })

  it('should successfully resolve in schema', async () => {
    const AnEnum = enumType(IntEnum, {
      name: 'AnEnum',
    })

    @ObjectType()
    class Query {
      @Field({type: AnEnum})
      public enumTest() {
        return IntEnum.FooBar
      }
    }

    const schema = compileSchema({Query})

    const result = await graphql(
      schema,
      `
        {
          enumTest
        }
      `
    )
    expect(result.errors).toBeFalsy()
    expect(result.data!.enumTest).toEqual('FooBar')
  })
})
