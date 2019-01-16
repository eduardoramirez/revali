import {registrar} from 'revali/metadata'
import {AnyConstructor} from 'revali/types'

export interface ObjectTypeConfig {
  name?: string
  description?: string
}

export function ObjectType<TSource>(config: ObjectTypeConfig = {}) {
  return (target: AnyConstructor<TSource>) => {
    registrar.storeObjectMetadata(target, {...config, name: config.name || target.name})
  }
}
