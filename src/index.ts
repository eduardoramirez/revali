import {addAlias} from 'module-alias'
addAlias('revali', __dirname)

// Decorators
export {Arg} from 'revali/arg'
export {Args} from 'revali/args'
export {Field} from 'revali/field'
export {Implements} from 'revali/implements'
export {InputField} from 'revali/inputField'
export {InputObjectType} from 'revali/inputObject'
export {InterfaceType} from 'revali/interface'
export {ObjectType} from 'revali/object'

// Helpers for composing types
export {enumType, EnumTypeCase} from 'revali/wrappers/enumType'
export {unionType} from 'revali/wrappers/unionType'
export {scalarType} from 'revali/wrappers/scalarType'

// Type wrapper utilities
export {list} from 'revali/wrappers/list'
export {nullable} from 'revali/wrappers/nullable'
export {unsafeWrapType, wrapScalar} from 'revali/wrappers/Wrapper'

// Built-in scalar types
export {
  TSGraphQLBoolean,
  TSGraphQLFloat,
  TSGraphQLID,
  TSGraphQLInt,
  TSGraphQLString,
} from 'revali/wrappers/scalars'

// Library utilities
export {fieldDecoratorForContext} from 'revali/field'

// Compiler to graphql-js
export {compileSchema} from 'revali/compileSchema'
