import {GraphQLInterfaceType} from 'graphql'
import {memoize} from 'lodash'

import {compileFieldConfigMap, compileObjectType} from 'revali/compiler'
import {InterfaceNode} from 'revali/graph'

export const compileInterfaceType = memoize(
  ({implementerNodes, fieldNodes, metadata}: InterfaceNode): GraphQLInterfaceType => {
    const {name, description} = metadata
    const type = new GraphQLInterfaceType({
      name,
      description,
      fields: compileFieldConfigMap(fieldNodes),
      resolveType: (instance: {}) => {
        const implementorNode = implementerNodes.find(({target}) => instance instanceof target)
        if (!implementorNode) {
          const ctorName =
            (instance && instance.constructor && instance.constructor.name) || 'Unknown'
          throw new Error(
            `Error resolving type for ${name}: ${ctorName} not found in implementations`
          )
        }

        return compileObjectType(implementorNode)
      },
    })

    return type
  }
)
