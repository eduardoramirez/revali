import {registrar} from 'revali/metadata'
import {AnyConstructor} from 'revali/types'

export interface InterfaceTypeConfig {
  name?: string
  description?: string
}

export function InterfaceType(config: InterfaceTypeConfig = {}) {
  return (target: AnyConstructor<any>) => {
    registrar.storeInterfaceMetadata(target, {...config, name: config.name || target.name})
  }
}
