import {GraphQLInputType, Thunk} from 'graphql'

import {graph} from 'revali/graph'
import {Constructor, Omit} from 'revali/types'
import {resolveThunk, resolveType} from 'revali/utils'
import {WrapperOrType} from 'revali/wrappers/Wrapper'

export interface InputFieldOptions<TValue> {
  type: WrapperOrType<TValue, GraphQLInputType>
  defaultValue?: TValue
  description?: string
}

export type PrimitiveInputFieldConfig<TValue> = Omit<InputFieldOptions<TValue>, 'type'>

const getDefaultValueFromPrototype = (prototype: Record<any, any>, key: string) => {
  const Args = prototype.constructor as Constructor<any>
  if (!Args || typeof Args !== 'function' || Args.length > 0) {
    return undefined
  }
  return new Args()[key]
}

function InputFieldDecorator<TValue>(config?: Thunk<Partial<InputFieldOptions<TValue>>>) {
  return <TName extends string>(prototype: Record<TName, TValue>, key: TName) => {
    graph.createInputField(prototype.constructor, () => {
      const resolved = (config && resolveThunk(config)) || {}
      const defaultValue = resolved.defaultValue || getDefaultValueFromPrototype(prototype, key)
      const type = resolveType(resolved.type, prototype, key)
      return {...resolved, defaultValue, type, name: key}
    })
  }
}

// Needs to be exported so Arg can use it
export interface InputFieldDefinitions {
  <TValue extends string | number | boolean>(config?: Thunk<PrimitiveInputFieldConfig<TValue>>): <
    TName extends string
  >(
    prototype: Record<TName, string> | Record<TName, boolean> | Record<TName, number>,
    key: TName
  ) => void

  <TValue>(config: Thunk<InputFieldOptions<TValue>>): <TName extends string>(
    prototype: Record<TName, TValue>,
    key: TName
  ) => void
}

export const InputField = InputFieldDecorator as InputFieldDefinitions
