import {GraphQLInterfaceType} from 'graphql'
import {memoize} from 'lodash'

import {compileFieldConfigMap, compileObjectType} from 'revali/compiler'
import {registrar} from 'revali/metadata'
import {AnyConstructor} from 'revali/types'
import {findConstructor} from 'revali/utils'

export const compileInterfaceType = memoize(
  (source: AnyConstructor<any>): GraphQLInterfaceType => {
    const metadata = registrar.getInterfaceMetadata(source)
    if (!metadata || !registrar.isInterfaceType(source)) {
      throw new Error(`Interface type config not found for ${source.name}`)
    }

    const {name, description, implementers} = metadata
    const type = new GraphQLInterfaceType({
      name: name || source.name,
      fields: compileFieldConfigMap(source),
      description,
      resolveType: (instance: {}) => {
        const implementorCtor = findConstructor(instance, implementers)
        if (!implementorCtor) {
          const ctorName =
            (instance && instance.constructor && instance.constructor.name) || 'Unknown'
          throw new Error(
            `Error resolving type for ${source.name}: ${ctorName} not found in implementations`
          )
        }
        return compileObjectType(implementorCtor)
      },
    })

    registrar.markInterfaceCompiled(source)

    return type
  }
)
