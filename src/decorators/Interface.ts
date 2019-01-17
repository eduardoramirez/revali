import {graph} from 'revali/graph'
import {AnyConstructor} from 'revali/types'

export interface InterfaceTypeOptions {
  name?: string
  description?: string
}

export function InterfaceType(config: InterfaceTypeOptions = {}) {
  return (target: AnyConstructor<any>) => {
    graph.createInterface(target, {...config, name: config.name || target.name})
  }
}
