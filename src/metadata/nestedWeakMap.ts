import {Maybe} from 'revali/types'

export class NestedWeakMap<Key extends object, Val> {
  private map: WeakMap<Key, Map<string, Val>>

  constructor() {
    this.map = new WeakMap()
  }

  public set(target: Key, field: string, value: Val) {
    let nestedMap = this.map.get(target)

    if (!nestedMap) {
      nestedMap = new Map<string, Val>()
      this.map.set(target, nestedMap)
    }

    nestedMap.set(field, value)
  }

  public get(target: Key, field: string): Maybe<Val> {
    const nestedMap = this.map.get(target)
    return nestedMap && nestedMap.get(field)
  }

  public getNestedMap(target: Key): Maybe<Map<string, Val>> {
    return this.map.get(target)
  }

  public has(target: Key, field: string): boolean {
    return !!this.get(target, field)
  }
}
