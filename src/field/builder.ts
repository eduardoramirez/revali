import {
  GraphQLFieldConfig,
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  GraphQLResolveInfo,
} from 'graphql'
import {mapValues, reduce} from 'lodash'

import {buildArg, getArgName, hasArg} from 'revali/arg'
import {buildArgs, isArgs} from 'revali/args'
import {getFieldConfig} from 'revali/field'
import {FieldConfig, FieldResolverMethod} from 'revali/field'
import {getImplements} from 'revali/implements'
import {getInputFieldConfig} from 'revali/inputField'
import {isInputObjectType} from 'revali/inputObject'
import {buildOutputType} from 'revali/typeHelpers'
import {
  AnyConstructor,
  EmptyConstructor,
  isEmptyConstructor,
  Maybe,
  MaybePromise,
  ObjectLiteral,
} from 'revali/types'
import {getConstructorChain, resolveThunk, Thunk} from 'revali/utils'
import {isWrapper} from 'revali/wrappers/Wrapper'

export type FieldResolver<TSource, TContext, TReturn, TArgs = {}> = (
  source: TSource,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => MaybePromise<TReturn>

export interface FieldConfigMap<TContext> {
  [key: string]: FieldConfig<TContext, any, any>
}

interface InputConstructorChildren {
  [key: string]: InputConstructorNode<any>
}

interface InputConstructorNode<T> {
  constructor: EmptyConstructor<T>
  children: InputConstructorChildren
}

export function buildFieldConfigMap(
  source: AnyConstructor<any>
): Thunk<GraphQLFieldConfigMap<any, any>> {
  return () => {
    const interfaces = getImplements(source) || []

    const chain = [...getConstructorChain(source), ...interfaces].reverse()

    const fields: FieldConfigMap<any> = chain
      .map(getFieldConfig)
      .filter(value => !!value)
      .map(config => mapValues(config, resolveThunk))
      .reduce((obj, config) => ({...obj, ...config}))

    return mapValues(
      fields,
      (config, field): GraphQLFieldConfig<any, any> => {
        return {
          ...config,
          type: buildOutputType(config.type, true),
          args: buildArgMap(source, config, field),
          resolve: buildResolver(source, config, field),
        }
      }
    )
  }
}

function buildArgMap(
  source: AnyConstructor<any>,
  config: FieldConfig<any, any, any>,
  field: string
): GraphQLFieldConfigArgumentMap | undefined {
  if (config.arg && config.args) {
    // TODO: better error message
    throw new Error('You can only define a single parameter arg with @Arg or ')
  }

  if (config.arg && hasArg(source, field)) {
    return resolveThunk(buildArg(source, field, config.arg)!)
  } else if (config.args && isArgs(config.args)) {
    return resolveThunk(buildArgs(config.args))
  }

  return undefined
}

function buildResolver(
  source: AnyConstructor<any>,
  config: FieldConfig<any, unknown, any>,
  field: string
): GraphQLFieldResolver<any, any> {
  const resolve = createResolver(source.prototype, field) || defaultResolver(field)
  const transformOutput = isWrapper(config.type) && config.type.transformOutput

  return ((src: any, args: ObjectLiteral, ...rest) => {
    const mappedArgs = mapArgsForResolver(source, config, field, args)

    const result = resolve(src, mappedArgs, ...rest)

    return transformOutput ? transformOutput(result) : result
  }) as GraphQLFieldResolver<any, any>
}

function defaultResolver(key: string): FieldResolver<any, any, any> {
  return (source: ObjectLiteral, ...rest: any[]) => {
    const resolve = createResolver(source, key)
    if (resolve) {
      return (resolve as any)(source, ...rest)
    }
    return source[key]
  }
}

function createResolver(
  prototype: ObjectLiteral,
  key: string
): Maybe<FieldResolver<any, any, any>> {
  if (typeof prototype[key] === 'function') {
    const resolverMethod = prototype[key] as FieldResolverMethod<any, any, any>
    return (source: any, ...rest) => resolverMethod.apply(source, rest)
  }
  return null
}

function mapArgsForResolver(
  source: AnyConstructor<any>,
  {arg, args}: FieldConfig<any, any>,
  field: string,
  passedInArgs: ObjectLiteral
): Maybe<ObjectLiteral | any> {
  if (arg && !isWrapper(arg) && isEmptyConstructor(arg) && isInputObjectType(arg)) {
    const inputConstructorTree = buildInputConstructorTree(arg)
    return inputConstructorTree
      ? instantiateInputConstructorTree(inputConstructorTree, passedInArgs)
      : null
  } else if (arg) {
    const argName = getArgName(source, field)!
    return passedInArgs[argName]
  } else if (args) {
    const inputConstructorTree = buildInputConstructorTree(args)
    return inputConstructorTree
      ? instantiateInputConstructorTree(inputConstructorTree, passedInArgs)
      : null
  }

  return null
}

function instantiateInputConstructorTree<T>(
  tree: InputConstructorNode<T>,
  values: ObjectLiteral
): T {
  const instantiatedValues = {...values}
  for (const key in tree.children) {
    if (!tree.children.hasOwnProperty(key)) {
      continue
    }
    if (values[key] != null) {
      instantiatedValues[key] = instantiateInputConstructorTree(tree.children[key], values[key])
    }
  }
  const instantiated: T = new tree.constructor()
  return Object.assign(instantiated, instantiatedValues)
}

function buildInputConstructorTree<T>(
  InputClass: EmptyConstructor<T>
): Maybe<InputConstructorNode<T>> {
  const configThunkMap = getInputFieldConfig(InputClass)
  if (!configThunkMap) {
    return null
  }

  const children = reduce(
    configThunkMap,
    (acc, configThunk, field) => {
      const {type} = resolveThunk(configThunk)

      if (!isWrapper(type) && isEmptyConstructor(type) && isInputObjectType(type)) {
        const tree = buildInputConstructorTree(type)
        if (tree) {
          acc[field] = tree
        }
      }

      return acc
    },
    {} as InputConstructorChildren
  )

  return {
    constructor: InputClass,
    children,
  }
}
