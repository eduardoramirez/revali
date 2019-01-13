import {GraphQLFieldConfigArgumentMap, GraphQLInputFieldConfig, GraphQLInputType} from 'graphql'

import {getArgConfig} from 'revali/arg'
import {buildInputType} from 'revali/typeHelpers'
import {AnyConstructor, Maybe} from 'revali/types'
import {resolveThunk, Thunk} from 'revali/utils'
import {WrapperOrType} from 'revali/wrappers/Wrapper'

export function buildArg(
  source: AnyConstructor<any>,
  field: string,
  type: WrapperOrType<any, GraphQLInputType>
): Maybe<Thunk<GraphQLFieldConfigArgumentMap>> {
  const confThunk = getArgConfig(source, field)
  if (!confThunk) {
    return undefined
  }

  return () => {
    const config = resolveThunk(confThunk)
    return {
      [config.name]: {
        type: buildInputType(type, true),
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
