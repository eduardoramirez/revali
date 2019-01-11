import {storeInterfaceTypeConfig} from 'revali/interface'
import {AnyConstructor} from 'revali/types'

export interface InterfaceTypeConfig {
  name?: string
}

export function InterfaceType(config: InterfaceTypeConfig = {}) {
  return (source: AnyConstructor<any>) => {
    storeInterfaceTypeConfig(source, config)
  }
}
