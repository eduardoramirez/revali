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

import {Field} from 'revali/field'
import {InputField} from 'revali/inputField'
import {InputObjectType} from 'revali/inputObject'
import {InterfaceType} from 'revali/interface'
import {ObjectType} from 'revali/object'
import {buildInputType, buildNamedType, buildOutputType, buildType} from 'revali/typeHelpers'
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

describe('typeHelpers', () => {
  describe('getType', () => {
    it('should never return GraphQLNonNull if nonNull is false', () => {
      expect(isNonNullType(buildType(AnObjectType))).toBeFalsy()
      expect(isNonNullType(buildType(AnInputObjectType))).toBeFalsy()
      expect(isNonNullType(buildType(AnInterfaceType))).toBeFalsy()
      expect(isNonNullType(buildType(ANullableType))).toBeFalsy()
      expect(isNonNullType(buildType(TSGraphQLString))).toBeFalsy()
    })

    it('should return GraphQLNonNull if nonNull true and type not nullable', () => {
      expect(isNonNullType(buildType(ANullableType, true))).toBeFalsy()

      expect(isNonNullType(buildType(AnObjectType, true))).toBeTruthy()
      expect(isNonNullType(buildType(AnInputObjectType, true))).toBeTruthy()
      expect(isNonNullType(buildType(AnInterfaceType, true))).toBeTruthy()
      expect(isNonNullType(buildType(TSGraphQLString, true))).toBeTruthy()
    })
  })

  describe('getInputType', () => {
    it('should correctly return input types', () => {
      expect(isEnumType(buildInputType(AnEnumType))).toBeTruthy()
      expect(isScalarType(buildInputType(TSGraphQLString))).toBeTruthy()
      expect(isInputObjectType(buildInputType(AnInputObjectType))).toBeTruthy()
      expect(isListType(buildInputType(AListType))).toBeTruthy()
      expect(isNonNullType(buildInputType(TSGraphQLString, true))).toBeTruthy()
    })

    it('should throw if not an input type', () => {
      expect(() => buildInputType(AnObjectType)).toThrow()
    })
  })

  describe('getOutputType', () => {
    it('should correctly return output types', () => {
      expect(isEnumType(buildOutputType(AnEnumType))).toBeTruthy()
      expect(isScalarType(buildOutputType(TSGraphQLString))).toBeTruthy()
      expect(isObjectType(buildOutputType(AnObjectType))).toBeTruthy()
      expect(isListType(buildOutputType(AListType))).toBeTruthy()
      expect(isInterfaceType(buildOutputType(AnInterfaceType))).toBeTruthy()
      expect(isNonNullType(buildOutputType(TSGraphQLString, true))).toBeTruthy()
    })

    it('should throw if not an output type', () => {
      expect(() => buildOutputType(AnInputObjectType)).toThrow()
    })
  })

  describe('getNamedType', () => {
    it('should correctly return named types', () => {
      expect(isEnumType(buildNamedType(AnEnumType))).toBeTruthy()
      expect(isScalarType(buildNamedType(TSGraphQLString))).toBeTruthy()
      expect(isObjectType(buildNamedType(AnObjectType))).toBeTruthy()
      expect(isInputObjectType(buildNamedType(AnInputObjectType))).toBeTruthy()
      expect(isUnionType(buildNamedType(AUnionType))).toBeTruthy()
      expect(isInterfaceType(buildNamedType(AnInterfaceType))).toBeTruthy()
    })
  })
})
