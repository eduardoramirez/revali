import {GraphQLFieldConfigArgumentMap, GraphQLInputFieldConfig} from 'graphql'

import {getArgConfig} from 'revali/arg'
import {buildInputType} from 'revali/typeHelpers'
import {AnyConstructor, Maybe} from 'revali/types'
import {resolveThunk, Thunk} from 'revali/utils'

export function buildArg(
  source: AnyConstructor<any>,
  field: string
): Maybe<Thunk<GraphQLFieldConfigArgumentMap>> {
  const confThunk = getArgConfig(source, field)
  if (!confThunk) {
    return undefined
  }

  return () => {
    const config = resolveThunk(confThunk)
    return {
      [config.name]: {
        type: buildInputType(config.type, true),
        description: config.description,
        defaultValue: config.defaultValue,
      } as GraphQLInputFieldConfig,
    }
  }
}

export function getArgName(source: AnyConstructor<any>, field: string): string | undefined {
  const confThunk = getArgConfig(source, field)
  if (!confThunk) {
    return undefined
  }

  const config = resolveThunk(confThunk)
  return config.name
}
