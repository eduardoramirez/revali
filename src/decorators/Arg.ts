import {graph} from 'revali/graph'
import {ObjectLiteral, Omit} from 'revali/types'

export interface ArgOptions<TValue> {
  defaultValue?: TValue
  description?: string
  name: string // Unfortunately, decorators don't emit the param name
}

export function Arg<TValue>(
  name: string,
  config?: Partial<Omit<ArgOptions<TValue>, 'name'>>
): ParameterDecorator {
  return (prototype: ObjectLiteral, key: string | symbol) => {
    if (typeof key === 'symbol') {
      // TODO: better error message
      throw new Error('Arg: symbol is not supported')
    }

    graph.createArg(prototype.constructor, key, {...config, name})
  }
}
