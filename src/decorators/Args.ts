import {graph} from 'revali/graph'
import {EmptyConstructor} from 'revali/types'

export function Args() {
  return (target: EmptyConstructor<any>) => {
    graph.createArgs(target)
  }
}
