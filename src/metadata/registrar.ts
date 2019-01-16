import {GraphQLInputType, GraphQLOutputType, Thunk} from 'graphql'
import {uniq} from 'lodash'

import {NestedWeakMap} from 'revali/metadata/nestedWeakMap'
import {AnyConstructor, EmptyConstructor, Maybe, ObjectLiteral} from 'revali/types'
import {getConstructorChain} from 'revali/utils'
import {WrapperOrType} from 'revali/wrappers/Wrapper'

export interface ArgMetadata {
  defaultValue?: any
  description?: string
  name: string // Unfortunately, decorators don't emit the param name
}

export interface ObjectMetadata {
  name?: string
  description?: string
  compiled: boolean
  interfaces: Array<AnyConstructor<any>>
}

export interface InterfaceMetadata {
  name?: string
  description?: string
  compiled: boolean
  implementers: Array<AnyConstructor<any>>
}

export interface FieldMetadata {
  type: WrapperOrType<any, GraphQLOutputType>
  name: string
  description?: string
  args?: EmptyConstructor<any>
  arg?: WrapperOrType<any, GraphQLInputType>
  isDeprecated?: boolean
  deprecationReason?: string
  context?: AnyConstructor<any>
}

export interface InputFieldMetadata {
  type: WrapperOrType<any, GraphQLInputType>
  name: string
  defaultValue?: any
  description?: string
}

export interface InputObjectMetadata {
  name?: string
  description?: string
  compiled: boolean
}

class Registrar {
  private objects: Map<AnyConstructor<any>, ObjectMetadata>
  private interfaces: Map<AnyConstructor<any>, InterfaceMetadata>
  private inputObjects: Map<AnyConstructor<any>, InputObjectMetadata>

  private args: WeakMap<AnyConstructor<any>, boolean>
  private fields: WeakMap<AnyConstructor<any>, Array<Thunk<FieldMetadata>>>
  private inputFields: WeakMap<AnyConstructor<any>, Array<Thunk<InputFieldMetadata>>>

  private arg: NestedWeakMap<AnyConstructor<any>, ArgMetadata>

  private implements: WeakMap<AnyConstructor<any>, Array<AnyConstructor<any>>>

  constructor() {
    this.objects = new Map()
    this.interfaces = new Map()
    this.inputObjects = new Map()
    this.args = new WeakMap()
    this.fields = new WeakMap()
    this.arg = new NestedWeakMap()
    this.inputFields = new WeakMap()
    this.implements = new WeakMap()
  }

  // Single arg

  public storeArgMetadata(prototype: ObjectLiteral, field: string, metadata: Thunk<ArgMetadata>) {
    this.arg.set(prototype.constructor, field, metadata)
  }

  public getArgMetadata(target: AnyConstructor<any>, field: string): Maybe<Thunk<ArgMetadata>> {
    return this.arg.get(target, field)
  }

  public hasArg(prototypeOrTarget: ObjectLiteral | AnyConstructor<any>, field: string): boolean {
    if (prototypeOrTarget.prototype !== undefined) {
      return this.arg.has(prototypeOrTarget as AnyConstructor<any>, field)
    } else {
      return this.arg.has(prototypeOrTarget.constructor, field)
    }
  }

  // Multiple Args

  public storeIsArgs(target: AnyConstructor<any>) {
    this.args.set(target, true)
  }

  public isArgsType(target: AnyConstructor<any>): boolean {
    return this.args.has(target)
  }

  // Interface

  public storeInterfaceMetadata(target: AnyConstructor<any>, metadata: Partial<InterfaceMetadata>) {
    this.interfaces.set(target, {...metadata, compiled: false, implementers: []})
  }

  public getInterfaceMetadata(target: AnyConstructor<any>): Maybe<InterfaceMetadata> {
    return this.interfaces.get(target)
  }

  public isInterfaceType(target: AnyConstructor<any>): boolean {
    return this.interfaces.has(target)
  }

  public storeImplements(target: AnyConstructor<any>, iface: AnyConstructor<any>) {
    this.addImplementerToInterface(iface, target)

    const targetInterfaces = this.implements.get(target) || []
    this.implements.set(target, [...targetInterfaces, iface])
  }

  public markInterfaceCompiled(target: AnyConstructor<any>) {
    const metadata = this.getInterfaceMetadata(target)
    this.interfaces.set(target, {
      ...metadata,
      compiled: true,
      implementers: metadata ? metadata.implementers : [],
    })
  }

  // Object

  public storeObjectMetadata(target: AnyConstructor<any>, metadata: Partial<ObjectMetadata>) {
    const chain = getConstructorChain(target)
    const interfaces = chain
      .map(ctor => this.getInterfacesImplemented(ctor))
      .reduce((acc, ctors) => acc.concat(ctors))

    interfaces.forEach(iface => this.addImplementerToInterface(iface, target))

    this.implements.set(target, interfaces)

    this.objects.set(target, {...metadata, interfaces: uniq(interfaces), compiled: false})
  }

  public getObjectMetadata(target: AnyConstructor<any>): Maybe<ObjectMetadata> {
    return this.objects.get(target)
  }

  public isObjectType(target: AnyConstructor<any>): boolean {
    return this.objects.has(target)
  }

  public getInterfacesImplemented(target: AnyConstructor<any>): Array<AnyConstructor<any>> {
    return this.implements.get(target) || []
  }

  public markObjectCompiled(target: AnyConstructor<any>) {
    const metadata = this.getObjectMetadata(target)
    this.objects.set(target, {
      ...metadata,
      compiled: true,
      interfaces: metadata ? metadata.interfaces : [],
    })
  }

  // Input Object

  public storeInputObjectMetadata(
    target: AnyConstructor<any>,
    metadata: Partial<InputObjectMetadata>
  ) {
    this.inputObjects.set(target, {...metadata, compiled: false})
  }

  public getInputObjectMetadata(target: AnyConstructor<any>): Maybe<InputObjectMetadata> {
    return this.inputObjects.get(target)
  }

  public isInputObjectType(target: AnyConstructor<any>): boolean {
    return this.inputObjects.has(target)
  }

  public markInputObjectCompiled(target: AnyConstructor<any>) {
    const metadata = this.getInputObjectMetadata(target)
    this.inputObjects.set(target, {...metadata, compiled: true})
  }

  // Field

  public storeFieldMetadata(prototype: ObjectLiteral, config: Thunk<FieldMetadata>) {
    const target = prototype.constructor
    const currentFields = this.getFieldMetadataList(target)
    this.fields.set(target, [...currentFields, config])
  }

  public getFieldMetadataList(target: AnyConstructor<any>): Array<Thunk<FieldMetadata>> {
    return this.fields.get(target) || []
  }

  // Input Field

  public storeInputFieldMetadata(prototype: ObjectLiteral, config: Thunk<InputFieldMetadata>) {
    const target = prototype.constructor
    const currentInputFields = this.getInputFieldMetadataList(target)
    this.inputFields.set(target, [...currentInputFields, config])
  }

  public getInputFieldMetadataList(target: AnyConstructor<any>): Array<Thunk<InputFieldMetadata>> {
    return this.inputFields.get(target) || []
  }

  public hasInputFields(target: AnyConstructor<any>): boolean {
    return this.inputFields.has(target)
  }

  // Public helpers

  public getUnreachableTypes(): Array<AnyConstructor<any>> {
    const uncompiledCtors: Array<AnyConstructor<any>> = []

    const uncompiledFinder = ({compiled}: {compiled: boolean}, target: AnyConstructor<any>) => {
      if (!compiled) {
        uncompiledCtors.push(target)
      }
    }

    this.objects.forEach(uncompiledFinder)
    this.inputObjects.forEach(uncompiledFinder)
    this.interfaces.forEach(uncompiledFinder)

    return uncompiledCtors
  }

  // Helpers

  private addImplementerToInterface(iface: AnyConstructor<any>, target: AnyConstructor<any>) {
    const interfaceConfig = this.getInterfaceMetadata(iface)
    if (interfaceConfig) {
      const implementers = uniq([...interfaceConfig.implementers, target])
      this.interfaces.set(iface, {...interfaceConfig, implementers})
    } else {
      // TODO: better error
      throw new Error('Interface not found')
    }
  }
}

export const registrar = new Registrar()
