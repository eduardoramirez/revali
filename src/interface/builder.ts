import {GraphQLInterfaceType} from 'graphql'
import {memoize} from 'lodash'

import {buildFieldConfigMap} from 'revali/field'
import {getImplementers} from 'revali/implements'
import {getInterfaceTypeConfig, isInterfaceType} from 'revali/interface'
import {buildObjectType} from 'revali/object'
import {AnyConstructor} from 'revali/types'
import {findConstructor} from 'revali/utils'

export const buildInterfaceType = memoize(
  (source: AnyConstructor<any>): GraphQLInterfaceType => {
    const config = getInterfaceTypeConfig(source)
    if (!config || !isInterfaceType(source)) {
      throw new Error(`Interface type config not found for ${source.name}`)
    }
    const {name, description} = config
    return new GraphQLInterfaceType({
      name: name || source.name,
      fields: buildFieldConfigMap(source),
      description,
      resolveType: (instance: {}) => {
        const implementers = getImplementers(source) || []
        const type = findConstructor(instance, implementers)
        if (!type) {
          const ctorName =
            (instance && instance.constructor && instance.constructor.name) || 'Unknown'
          throw new Error(
            `Error resolving type for ${source.name}: ${ctorName} not found in implementations`
          )
        }
        return buildObjectType(type)
      },
    })
  }
)
