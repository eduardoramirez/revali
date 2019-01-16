import {GraphQLObjectType} from 'graphql'
import {memoize} from 'lodash'

import {compileFieldConfigMap, compileInterfaceType} from 'revali/compiler'
import {registrar} from 'revali/metadata'
import {AnyConstructor} from 'revali/types'

export const compileObjectType = memoize(
  (source: AnyConstructor<any>): GraphQLObjectType => {
    const metadata = registrar.getObjectMetadata(source)
    if (!metadata || !registrar.isObjectType(source)) {
      throw new Error(`Object type config not found for ${source.name}`)
    }

    const {name, description, interfaces} = metadata
    const type = new GraphQLObjectType({
      name: name || source.name,
      interfaces: interfaces.map(compileInterfaceType),
      fields: compileFieldConfigMap(source),
      description,
    })

    registrar.markObjectCompiled(source)

    return type
  }
)
