import {flatMap, identity, uniq} from 'lodash'

import {getImplements, storeImplements} from 'revali/implements'
import {storeIsObjectType, storeObjectTypeConfig} from 'revali/object'
import {AnyConstructor, Constructor} from 'revali/types'
import {getConstructorChain} from 'revali/utils'

export interface ObjectTypeConfig {
  name?: string
  description?: string
}

export function ObjectType<TSource>(config: ObjectTypeConfig = {}) {
  return (source: AnyConstructor<TSource>) => {
    const {name, description} = config

    const chain = getConstructorChain(source)
    const interfaces = (uniq(flatMap(chain, getImplements)).filter(identity) as unknown) as Array<
      Constructor<any>
    >

    for (const iface of interfaces) {
      storeImplements(source, iface)
    }

    storeIsObjectType(source)
    storeObjectTypeConfig(source, {
      name: name || source.name,
      description,
    })
  }
}
