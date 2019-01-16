import {GraphQLInputFieldConfig, GraphQLInputFieldConfigMap, Thunk} from 'graphql'

import {compileInputType} from 'revali/compiler'
import {InputFieldMetadata, registrar} from 'revali/metadata'
import {AnyConstructor} from 'revali/types'
import {getConstructorChain, resolveThunk} from 'revali/utils'

export function compileInputFieldConfigMap(
  source: AnyConstructor<any>
): Thunk<GraphQLInputFieldConfigMap> {
  return () => {
    const chain = getConstructorChain(source)

    const inputFieldMetadataList: InputFieldMetadata[] = chain
      .map(target => registrar.getInputFieldMetadataList(target))
      .reduce((acc, configList) => acc.concat(...configList)) // flatten
      .map(resolveThunk)

    return inputFieldMetadataList.reduce(
      (map, config) => {
        map[config.name] = {
          type: compileInputType(config.type, true),
          description: config.description,
          defaultValue: config.defaultValue,
        } as GraphQLInputFieldConfig

        return map
      },
      {} as GraphQLInputFieldConfigMap
    )
  }
}
