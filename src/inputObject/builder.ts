import {GraphQLInputObjectType} from 'graphql'
import {memoize} from 'lodash'

import {buildInputFieldConfigMap} from 'revali/inputField'
import {getInputObjectTypeConfig, isInputObjectType} from 'revali/inputObject'
import {AnyConstructor} from 'revali/types'

export const buildInputObjectType = memoize(
  (source: AnyConstructor<any>): GraphQLInputObjectType => {
    const config = getInputObjectTypeConfig(source)
    if (!config || !isInputObjectType(source)) {
      throw new Error(`Input object type config not found for ${source.name}`)
    }
    const {name, description} = config
    return new GraphQLInputObjectType({
      name: name || source.name,
      fields: buildInputFieldConfigMap(source),
      description,
    })
  }
)
