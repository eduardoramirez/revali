import {
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  GraphQLResolveInfo,
  Thunk,
} from 'graphql'

import {compileArg, compileArgs, compileOutputType} from 'revali/compiler'
import {FieldResolverMethod} from 'revali/decorators/Field'
import {
  ArgsNode,
  FieldNode,
  FieldNodeMetadata,
  InputObjectNode,
  isInputObjectNode,
} from 'revali/graph'
import {
  AnyConstructor,
  EmptyConstructor,
  isEmptyConstructor,
  Maybe,
  MaybePromise,
  ObjectLiteral,
} from 'revali/types'
import {resolveThunk} from 'revali/utils'
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

export function compileFieldConfigMap(nodes: FieldNode[]): Thunk<GraphQLFieldConfigMap<any, any>> {
  return () => {
    return nodes.reduce(
      (configMap, {target, metadata}) => {
        const resolvedMetadata = resolveThunk(metadata)
        const {name, type, ...rest} = resolvedMetadata

        configMap[name] = {
          ...rest,
          type: compileOutputType(type, true),
          args: createArgMap(resolvedMetadata),
          resolve: buildResolver(target, resolvedMetadata),
        }

        return configMap
      },
      {} as GraphQLFieldConfigMap<any, any>
    )
  }
}

function createArgMap({arg, args}: FieldNodeMetadata): GraphQLFieldConfigArgumentMap | undefined {
  if (arg) {
    return resolveThunk(compileArg(arg.node, arg.type))
  } else if (args) {
    return resolveThunk(compileArgs(args))
  }

  return undefined
}

function buildResolver(
  source: AnyConstructor<any>,
  metadata: FieldNodeMetadata
): GraphQLFieldResolver<any, any> {
  const {type, name} = metadata

  const resolver = createResolver(source.prototype, name) || defaultResolver(name)
  const transformOutput = isWrapper(type) && type.transformOutput

  return ((src: any, args: ObjectLiteral, ...rest) => {
    const mappedArgs = mapArgsForResolver(metadata, args)

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
  {arg, args}: FieldNodeMetadata,
  passedInArgs: ObjectLiteral
): Maybe<ObjectLiteral | any> {
  if (
    arg &&
    !isWrapper(arg.type) &&
    isInputObjectNode(arg.type) &&
    isEmptyConstructor(arg.type.target)
  ) {
    const inputConstructorTree = createInputConstructorTree(arg.type)
    return instantiateInputConstructorTree(inputConstructorTree, passedInArgs)
  } else if (arg) {
    const argName = arg.node.metadata.name
    return passedInArgs[argName]
  } else if (args) {
    const inputConstructorTree = createInputConstructorTree(args)
    return instantiateInputConstructorTree(inputConstructorTree, passedInArgs)
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

function createInputConstructorTree<T>({
  inputFields,
  target,
}: InputObjectNode | ArgsNode): InputConstructorNode<T> {
  const children = inputFields.reduce(
    (acc, {metadata}) => {
      const {type, name} = resolveThunk(metadata)

      if (!isWrapper(type) && isInputObjectNode(type) && isEmptyConstructor(type.target)) {
        const tree = createInputConstructorTree(type)
        if (tree) {
          acc[name] = tree
        }
      }

      return acc
    },
    {} as InputConstructorChildren
  )

  return {constructor: target, children}
}
