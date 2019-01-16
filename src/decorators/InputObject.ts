import {registrar} from 'revali/metadata'
import {EmptyConstructor} from 'revali/types'

export interface InputObjectTypeConfig {
  name?: string
  description?: string
}

export function InputObjectType(config: InputObjectTypeConfig = {}) {
  return (target: EmptyConstructor<any>) => {
    registrar.storeInputObjectMetadata(target, {...config, name: config.name || target.name})
  }
}
