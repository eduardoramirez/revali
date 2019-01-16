import {registrar} from 'revali/metadata'
import {EmptyConstructor} from 'revali/types'

export function Args() {
  return (target: EmptyConstructor<any>) => {
    registrar.storeIsArgs(target)
  }
}
