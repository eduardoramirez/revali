import {GraphQLInputType, GraphQLOutputType, GraphQLResolveInfo, Thunk} from 'graphql'

import {InterfaceImplementation} from 'revali/decorators/Implements'
import {graph} from 'revali/graph'
import {AnyConstructor, EmptyConstructor, MaybePromise} from 'revali/types'
import {resolveThunk, resolveType} from 'revali/utils'
import {WrapperOrType} from 'revali/wrappers/Wrapper'

export interface FieldOptions<TReturn, TArgs = {}, TContext = any> {
  type: WrapperOrType<TReturn, GraphQLOutputType>
  description?: string
  args?: EmptyConstructor<TArgs>
  arg?: WrapperOrType<TArgs, GraphQLInputType>
  deprecationReason?: string
  context?: AnyConstructor<TContext>
}

export type FieldResolverMethod<TContext, TReturn, TArgs> = (
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => MaybePromise<TReturn | InterfaceImplementation<TReturn>>

export type FieldProperty<TContext, TReturn, TArgs> =
  | MaybePromise<TReturn>
  | FieldResolverMethod<TContext, TReturn, TArgs>

function FieldDecorator<TReturn, TArgs, TContext>(
  config?: Thunk<Partial<FieldOptions<TReturn, TArgs, TContext>>>
) {
  return <TName extends string, TRArgs extends TArgs = TArgs>(
    prototype: Record<TName, FieldProperty<TContext, TReturn, TRArgs>>,
    key: TName
  ) => {
    graph.createField(prototype.constructor, () => {
      const resolved = (config && resolveThunk(config)) || {}

      const type = resolveType(resolved.type, prototype, key)

      return {...resolved, type, name: key}
    })
  }
}

export function fieldDecoratorForContext<TContext>(context: AnyConstructor<TContext>) {
  return <TReturn, TArgs>(config?: Thunk<Partial<FieldOptions<TReturn, TArgs>>>) => {
    return FieldDecorator<TReturn, TArgs, TContext>({...config, context})
  }
}

type FieldPropertyDecorator<TReturn, TArgs, TContext = undefined> = <
  TName extends string,
  TSource,
  TRArgs extends TArgs = TArgs
>(
  prototype: Record<TName, FieldProperty<TContext, TReturn, TArgs>>,
  key: TName
) => void

interface FieldDefinitions {
  // Infer primitive types. Will not work on methods since the type for a method is,
  // for instance, `() => string`
  <TArgs>(config?: Thunk<Partial<FieldOptions<undefined, TArgs>>>): <
    TName extends string,
    TSource,
    TContext,
    TRArgs extends TArgs = TArgs
  >(
    prototype: Record<TName, string> | Record<TName, boolean> | Record<TName, number>,
    key: TName
  ) => void

  <TReturn, TArgs, TContext = undefined>(
    config: Thunk<FieldOptions<TReturn, TArgs, TContext>>
  ): FieldPropertyDecorator<TReturn, TArgs, TContext>
}

export const Field = FieldDecorator as FieldDefinitions
