import {storeIsArgs} from 'revali/args'
import {EmptyConstructor} from 'revali/types'

export function Args() {
  return (target: EmptyConstructor<any>) => {
    storeIsArgs(target)
  }
}
