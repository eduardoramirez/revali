import {GraphQLInputFieldConfig, GraphQLInputFieldConfigMap, Thunk} from 'graphql'

import {compileInputType} from 'revali/compiler'
import {InputFieldNode} from 'revali/graph'
import {resolveThunk} from 'revali/utils'

export function compileInputFieldConfigMap(
  nodes: InputFieldNode[]
): Thunk<GraphQLInputFieldConfigMap> {
  return () => {
    const inputFieldMetadataList = nodes.map(({metadata}) => resolveThunk(metadata))

    return inputFieldMetadataList.reduce(
      (map, {type, description, defaultValue, name}) => {
        map[name] = {
          description,
          defaultValue,
          type: compileInputType(type, true),
        } as GraphQLInputFieldConfig

        return map
      },
      {} as GraphQLInputFieldConfigMap
    )
  }
}
