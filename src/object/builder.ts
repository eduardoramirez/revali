import {GraphQLObjectType} from 'graphql'
import {memoize} from 'lodash'

import {buildFieldConfigMap} from 'revali/field'
import {getImplements} from 'revali/implements'
import {buildInterfaceType} from 'revali/interface'
import {getObjectTypeConfig, isObjectType} from 'revali/object'
import {AnyConstructor} from 'revali/types'

export const buildObjectType = memoize(
  (source: AnyConstructor<any>): GraphQLObjectType => {
    const config = getObjectTypeConfig(source)
    if (!config || !isObjectType(source)) {
      throw new Error(`Object type config not found for ${source.name}`)
    }
    const {name, description} = config
    const interfaces = getImplements(source) || []
    return new GraphQLObjectType({
      name: name || source.name,
      interfaces: interfaces.map(buildInterfaceType),
      fields: buildFieldConfigMap(source),
      description,
    })
  }
)
