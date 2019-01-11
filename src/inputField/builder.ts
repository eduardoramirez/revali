import {GraphQLInputFieldConfig, GraphQLInputFieldConfigMap} from 'graphql'
import {mapValues} from 'lodash'

import {getInputFieldConfig, InputFieldConfig} from 'revali/inputField'
import {buildInputType} from 'revali/typeHelpers'
import {AnyConstructor} from 'revali/types'
import {getConstructorChain, resolveThunk, Thunk} from 'revali/utils'

export function buildInputFieldConfigMap(
  source: AnyConstructor<any>
): Thunk<GraphQLInputFieldConfigMap> {
  return () => {
    const chain = getConstructorChain(source)

    const allFields: {[key: string]: InputFieldConfig<any>} = chain
      .map(getInputFieldConfig)
      .filter(config => !!config)
      .map(config => mapValues(config, resolveThunk))
      .reduce((obj, config) => ({...obj, ...config}), {})

    return mapValues(allFields, config => {
      return {
        type: buildInputType(config.type, true),
        description: config.description,
        defaultValue: config.defaultValue,
      } as GraphQLInputFieldConfig
    })
  }
}
