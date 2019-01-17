import {graph} from 'revali/graph'
import {AnyConstructor} from 'revali/types'

export interface ObjectTypeOptions {
  name?: string
  description?: string
}

export function ObjectType<TSource>(config: ObjectTypeOptions = {}) {
  return (target: AnyConstructor<TSource>) => {
    graph.createObject(target, {...config, name: config.name || target.name})
  }
}
