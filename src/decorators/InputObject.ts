import {graph} from 'revali/graph'
import {EmptyConstructor} from 'revali/types'

export interface InputObjectTypeOptions {
  name?: string
  description?: string
}

export function InputObjectType(config: InputObjectTypeOptions = {}) {
  return (target: EmptyConstructor<any>) => {
    graph.createInputObject(target, {...config, name: config.name || target.name})
  }
}
