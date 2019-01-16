import {GraphQLInputObjectType} from 'graphql'
import {memoize} from 'lodash'

import {compileInputFieldConfigMap} from 'revali/compiler'
import {registrar} from 'revali/metadata'
import {AnyConstructor} from 'revali/types'

export const compileInputObjectType = memoize(
  (source: AnyConstructor<any>): GraphQLInputObjectType => {
    const metadata = registrar.getInputObjectMetadata(source)
    if (!metadata || !registrar.isInputObjectType(source)) {
      throw new Error(`Input object type config not found for ${source.name}`)
    }

    const {name, description} = metadata
    const type = new GraphQLInputObjectType({
      name: name || source.name,
      fields: compileInputFieldConfigMap(source),
      description,
    })

    registrar.markInputObjectCompiled(source)

    return type
  }
)
