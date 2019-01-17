import {GraphQLObjectType} from 'graphql'
import {flatMap, memoize} from 'lodash'

import {compileFieldConfigMap, compileInterfaceType} from 'revali/compiler'
import {ObjectNode} from 'revali/graph'

export const compileObjectType = memoize(
  ({implementNodes, metadata, fieldNodes}: ObjectNode): GraphQLObjectType => {
    const inheritedFieldNodes = flatMap(
      implementNodes,
      ({interfaceNode}) => interfaceNode.fieldNodes
    )

    const allFieldNodes = [...fieldNodes, ...inheritedFieldNodes]

    const {name, description} = metadata
    const type = new GraphQLObjectType({
      name,
      description,
      interfaces: implementNodes.map(({interfaceNode}) => compileInterfaceType(interfaceNode)),
      fields: compileFieldConfigMap(allFieldNodes),
    })

    return type
  }
)
