import {
  GraphQLFieldConfigArgumentMap,
  GraphQLInputFieldConfig,
  GraphQLInputType,
  Thunk,
} from 'graphql'

import {compileInputFieldConfigMap, compileInputType} from 'revali/compiler'
import {ArgNode, ArgsNode} from 'revali/graph'
import {WrapperOrNode} from 'revali/wrappers/Wrapper'

export function compileArg(
  {metadata}: ArgNode,
  type: WrapperOrNode<any, GraphQLInputType>
): Thunk<GraphQLFieldConfigArgumentMap> {
  return () => {
    const {description, defaultValue, name} = metadata
    return {
      [name]: {
        description,
        defaultValue,
        type: compileInputType(type, true),
      } as GraphQLInputFieldConfig,
    }
  }
}

export function compileArgs({inputFields, target}: ArgsNode): Thunk<GraphQLFieldConfigArgumentMap> {
  if (inputFields.length === 0) {
    throw new Error(`No args found. Are you missing @InputField decorators on ${target.name}?`)
  }
  return compileInputFieldConfigMap(inputFields)
}
