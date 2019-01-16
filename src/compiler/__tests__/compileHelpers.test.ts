import {
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType,
  isUnionType,
} from 'graphql'
import 'jest'

import {compileInputType, compileNamedType, compileOutputType, compileType} from 'revali/compiler'
import {Field, InputField, InputObjectType, InterfaceType, ObjectType} from 'revali/decorators'
import {enumType} from 'revali/wrappers/enumType'
import {list} from 'revali/wrappers/list'
import {nullable} from 'revali/wrappers/nullable'
import {TSGraphQLString} from 'revali/wrappers/scalars'
import {unionType} from 'revali/wrappers/unionType'

@ObjectType()
class AnObjectType {
  @Field()
  public foo!: string
}

@ObjectType()
class AnotherObjectType {
  @Field()
  public bar!: string
}

@InputObjectType()
class AnInputObjectType {
  @InputField()
  public foo!: string
}

@InterfaceType()
class AnInterfaceType {
  @Field()
  public foo!: string
}

enum AnEnum {
  Foo,
}

const AnEnumType = enumType(AnEnum, {name: 'AnEnumType'})

const AUnionType = unionType<AnObjectType | AnotherObjectType>({
  name: 'AUnionType',
  types: [AnObjectType, AnotherObjectType],
})

const ANullableType = nullable(TSGraphQLString)
const AListType = list(TSGraphQLString)

describe('compileHelpers', () => {
  describe('compileType', () => {
    it('should never return GraphQLNonNull if nonNull is false', () => {
      expect(isNonNullType(compileType(AnObjectType))).toBeFalsy()
      expect(isNonNullType(compileType(AnInputObjectType))).toBeFalsy()
      expect(isNonNullType(compileType(AnInterfaceType))).toBeFalsy()
      expect(isNonNullType(compileType(ANullableType))).toBeFalsy()
      expect(isNonNullType(compileType(TSGraphQLString))).toBeFalsy()
    })

    it('should return GraphQLNonNull if nonNull true and type not nullable', () => {
      expect(isNonNullType(compileType(ANullableType, true))).toBeFalsy()

      expect(isNonNullType(compileType(AnObjectType, true))).toBeTruthy()
      expect(isNonNullType(compileType(AnInputObjectType, true))).toBeTruthy()
      expect(isNonNullType(compileType(AnInterfaceType, true))).toBeTruthy()
      expect(isNonNullType(compileType(TSGraphQLString, true))).toBeTruthy()
    })
  })

  describe('compileInputType', () => {
    it('should correctly return input types', () => {
      expect(isEnumType(compileInputType(AnEnumType))).toBeTruthy()
      expect(isScalarType(compileInputType(TSGraphQLString))).toBeTruthy()
      expect(isInputObjectType(compileInputType(AnInputObjectType))).toBeTruthy()
      expect(isListType(compileInputType(AListType))).toBeTruthy()
      expect(isNonNullType(compileInputType(TSGraphQLString, true))).toBeTruthy()
    })

    it('should throw if not an input type', () => {
      expect(() => compileInputType(AnObjectType)).toThrow()
    })
  })

  describe('compileOutputType', () => {
    it('should correctly return output types', () => {
      expect(isEnumType(compileOutputType(AnEnumType))).toBeTruthy()
      expect(isScalarType(compileOutputType(TSGraphQLString))).toBeTruthy()
      expect(isObjectType(compileOutputType(AnObjectType))).toBeTruthy()
      expect(isListType(compileOutputType(AListType))).toBeTruthy()
      expect(isInterfaceType(compileOutputType(AnInterfaceType))).toBeTruthy()
      expect(isNonNullType(compileOutputType(TSGraphQLString, true))).toBeTruthy()
    })

    it('should throw if not an output type', () => {
      expect(() => compileOutputType(AnInputObjectType)).toThrow()
    })
  })

  describe('compileNamedType', () => {
    it('should correctly return named types', () => {
      expect(isEnumType(compileNamedType(AnEnumType))).toBeTruthy()
      expect(isScalarType(compileNamedType(TSGraphQLString))).toBeTruthy()
      expect(isObjectType(compileNamedType(AnObjectType))).toBeTruthy()
      expect(isInputObjectType(compileNamedType(AnInputObjectType))).toBeTruthy()
      expect(isUnionType(compileNamedType(AUnionType))).toBeTruthy()
      expect(isInterfaceType(compileNamedType(AnInterfaceType))).toBeTruthy()
    })
  })
})
