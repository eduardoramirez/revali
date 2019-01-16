import {
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  GraphQLResolveInfo,
  Thunk,
} from 'graphql'

import {compileArg, compileArgs, compileOutputType, getArgName} from 'revali/compiler'
import {FieldResolverMethod} from 'revali/decorators/Field'
import {FieldMetadata, registrar} from 'revali/metadata'
import {
  AnyConstructor,
  EmptyConstructor,
  isEmptyConstructor,
  Maybe,
  MaybePromise,
  ObjectLiteral,
} from 'revali/types'
import {getConstructorChain, resolveThunk} from 'revali/utils'
import {isWrapper} from 'revali/wrappers/Wrapper'

export type FieldResolver<TSource, TContext, TReturn, TArgs = {}> = (
  source: TSource,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => MaybePromise<TReturn>

interface InputConstructorChildren {
  [key: string]: InputConstructorNode<any>
}

interface InputConstructorNode<T> {
  constructor: EmptyConstructor<T>
  children: InputConstructorChildren
}

export function compileFieldConfigMap(
  source: AnyConstructor<any>
): Thunk<GraphQLFieldConfigMap<any, any>> {
  return () => {
    const chain = getConstructorChain(source)
    const interfaces = chain
      .map(c => registrar.getInterfacesImplemented(c))
      .reduce((acc, ifaces) => acc.concat(ifaces)) // flatten

    const objects = chain.concat(interfaces).reverse()

    const fieldMetadataList: FieldMetadata[] = objects
      .map(t => registrar.getFieldMetadataList(t))
      .reduce((acc, configList) => acc.concat(configList)) // flatten
      .map(resolveThunk)

    return fieldMetadataList.reduce(
      (configMap, config) => {
        configMap[config.name] = {
          ...config,
          type: compileOutputType(config.type, true),
          args: createArgMap(source, config),
          resolve: buildResolver(source, config),
        }

        return configMap
      },
      {} as GraphQLFieldConfigMap<any, any>
    )
  }
}

function createArgMap(
  source: AnyConstructor<any>,
  config: FieldMetadata
): GraphQLFieldConfigArgumentMap | undefined {
  if (config.arg && config.args) {
    // TODO: better error message
    throw new Error('You can only define a single parameter arg with @Arg or ')
  }

  if (config.arg && registrar.hasArg(source, config.name)) {
    return resolveThunk(compileArg(source, config.name, config.arg)!)
  } else if (config.args && registrar.isArgsType(config.args)) {
    return resolveThunk(compileArgs(config.args))
  }

  return undefined
}

function buildResolver(
  source: AnyConstructor<any>,
  config: FieldMetadata
): GraphQLFieldResolver<any, any> {
  const resolver = createResolver(source.prototype, config.name) || defaultResolver(config.name)
  const transformOutput = isWrapper(config.type) && config.type.transformOutput

  return ((src: any, args: ObjectLiteral, ...rest) => {
    const mappedArgs = mapArgsForResolver(source, config, args)

    const result = resolver(src, mappedArgs, ...rest)

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
  {arg, args, name}: FieldMetadata,
  passedInArgs: ObjectLiteral
): Maybe<ObjectLiteral | any> {
  if (arg && !isWrapper(arg) && isEmptyConstructor(arg) && registrar.isInputObjectType(arg)) {
    const inputConstructorTree = createInputConstructorTree(arg)
    return inputConstructorTree
      ? instantiateInputConstructorTree(inputConstructorTree, passedInArgs)
      : null
  } else if (arg) {
    const argName = getArgName(source, name)!
    return passedInArgs[argName]
  } else if (args) {
    const inputConstructorTree = createInputConstructorTree(args)
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

function createInputConstructorTree<T>(
  InputClass: EmptyConstructor<T>
): Maybe<InputConstructorNode<T>> {
  const configThunkList = registrar.getInputFieldMetadataList(InputClass)
  if (!configThunkList) {
    return null
  }

  const children = configThunkList.reduce(
    (acc, configThunk) => {
      const {type, name} = resolveThunk(configThunk)

      if (!isWrapper(type) && isEmptyConstructor(type) && registrar.isInputObjectType(type)) {
        const tree = createInputConstructorTree(type)
        if (tree) {
          acc[name] = tree
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
