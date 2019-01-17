import {addAlias} from 'module-alias'
addAlias('revali', __dirname)

// Decorators
export {
  Arg,
  Args,
  Field,
  Implements,
  InputField,
  InputObjectType,
  InterfaceType,
  ObjectType,
} from 'revali/decorators'

// Helpers for composing types
export {enumType, EnumTypeCase} from 'revali/wrappers/enumType'
export {unionType} from 'revali/wrappers/unionType'
export {scalarType} from 'revali/wrappers/scalarType'
export {list} from 'revali/wrappers/list'
export {nullable} from 'revali/wrappers/nullable'

// Built-in scalar types
export {
  TSGraphQLBoolean,
  TSGraphQLFloat,
  TSGraphQLID,
  TSGraphQLInt,
  TSGraphQLString,
} from 'revali/wrappers/scalars'

// Library utilities
export {fieldDecoratorForContext} from 'revali/decorators'
export {unsafeWrapType, wrapScalar} from 'revali/wrappers/Wrapper'

// Compiler to graphql-js
export {compileSchema} from 'revali/compileSchema'
