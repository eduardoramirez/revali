import {GraphQLFieldConfigArgumentMap} from 'graphql'

import {hasArgs, isArgs} from 'revali/args'
import {buildInputFieldConfigMap} from 'revali/inputField'
import {EmptyConstructor} from 'revali/types'
import {Thunk} from 'revali/utils'

export function buildArgs(target: EmptyConstructor<any>): Thunk<GraphQLFieldConfigArgumentMap> {
  if (!isArgs(target)) {
    throw new Error(`Args not found for ${target.name}. Are you missing the @Args decorator?`)
  }
  if (!hasArgs(target)) {
    throw new Error(`No args found. Are you missing @InputField decorators on ${target.name}?`)
  }
  return buildInputFieldConfigMap(target)
}
