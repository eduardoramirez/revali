import {
  GraphQLFieldConfigArgumentMap,
  GraphQLInputFieldConfig,
  GraphQLInputType,
  Thunk,
} from 'graphql'

import {compileInputFieldConfigMap, compileInputType} from 'revali/compiler'
import {registrar} from 'revali/metadata'
import {AnyConstructor, EmptyConstructor, Maybe} from 'revali/types'
import {resolveThunk} from 'revali/utils'
import {WrapperOrType} from 'revali/wrappers/Wrapper'

export function compileArg(
  source: AnyConstructor<any>,
  field: string,
  type: WrapperOrType<any, GraphQLInputType>
): Maybe<Thunk<GraphQLFieldConfigArgumentMap>> {
  const metadataThunk = registrar.getArgMetadata(source, field)
  if (!metadataThunk) {
    return undefined
  }

  return () => {
    const config = resolveThunk(metadataThunk)
    return {
      [config.name]: {
        type: compileInputType(type, true),
        description: config.description,
        defaultValue: config.defaultValue,
      } as GraphQLInputFieldConfig,
    }
  }
}

export function getArgName(source: AnyConstructor<any>, field: string): Maybe<string> {
  const metadataThunk = registrar.getArgMetadata(source, field)
  if (!metadataThunk) {
    return undefined
  }

  return resolveThunk(metadataThunk).name
}

export function compileArgs(target: EmptyConstructor<any>): Thunk<GraphQLFieldConfigArgumentMap> {
  if (!registrar.isArgsType(target)) {
    throw new Error(`Args not found for ${target.name}. Are you missing the @Args decorator?`)
  }
  if (!registrar.hasInputFields(target)) {
    throw new Error(`No args found. Are you missing @InputField decorators on ${target.name}?`)
  }
  return compileInputFieldConfigMap(target)
}
