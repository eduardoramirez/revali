import {GraphQLInputObjectType} from 'graphql'
import {memoize} from 'lodash'

import {compileInputFieldConfigMap} from 'revali/compiler'
import {InputObjectNode} from 'revali/graph'

export const compileInputObjectType = memoize(
  ({metadata, inputFields}: InputObjectNode): GraphQLInputObjectType => {
    const {name, description} = metadata
    const type = new GraphQLInputObjectType({
      name,
      description,
      fields: compileInputFieldConfigMap(inputFields),
    })

    return type
  }
)
