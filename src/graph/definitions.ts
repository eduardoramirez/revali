import {GraphQLInputType, GraphQLOutputType, Thunk} from 'graphql'

import {AnyConstructor, EmptyConstructor} from 'revali/types'
import {WrapperOrNode} from 'revali/wrappers/Wrapper'

export enum NodeKind {
  Object,
  Interface,
  InputObject,
  Field,
  Args,
  Arg,
  InputField,
  Implement,
}

export type WriteableNode = ObjectNode | InterfaceNode | InputObjectNode

export interface Node {
  kind: NodeKind
}

export interface ObjectNode extends Node {
  metadata: {
    name: string
    description?: string
  }

  target: AnyConstructor<any>
  fieldNodes: FieldNode[]
  implementNodes: ImplementNode[]
}

export interface InterfaceNode extends Node {
  metadata: {
    name: string
    description?: string
  }

  target: AnyConstructor<any>
  fieldNodes: FieldNode[]
  implementerNodes: ObjectNode[]
}

export interface InputObjectNode extends Node {
  metadata: {
    name: string
    description?: string
  }

  target: EmptyConstructor<any>
  inputFields: InputFieldNode[]
}

export interface ArgsNode extends Node {
  target: EmptyConstructor<any>
  inputFields: InputFieldNode[]
}

export interface ArgNode extends Node {
  metadata: {
    name: string
    defaultValue?: any
    description?: string
  }

  field: string
}

export interface InputFieldNode extends Node {
  target: AnyConstructor<any>
  metadata: Thunk<{
    type: WrapperOrNode<any, GraphQLInputType>
    name: string
    defaultValue?: any
    description?: string
  }>
}

export interface FieldNodeMetadata {
  type: WrapperOrNode<any, GraphQLOutputType>
  name: string
  description?: string
  isDeprecated?: boolean
  deprecationReason?: string
  args?: ArgsNode
  arg?: {
    node: ArgNode
    type: WrapperOrNode<any, GraphQLInputType>
  }
}

export interface FieldNode extends Node {
  target: AnyConstructor<any>
  metadata: Thunk<FieldNodeMetadata>
}

export interface ImplementNode extends Node {
  interfaceNode: InterfaceNode
}

export function isFieldNode(n: Node): n is FieldNode {
  return n.kind === NodeKind.Field
}

export function isObjectNode(n: Node): n is ObjectNode {
  return n.kind === NodeKind.Object
}

export function isInputObjectNode(n: Node): n is InputObjectNode {
  return n.kind === NodeKind.InputObject
}

export function isInterfaceNode(n: Node): n is InterfaceNode {
  return n.kind === NodeKind.Interface
}

export function isImplementNode(n: Node): n is ImplementNode {
  return n.kind === NodeKind.Implement
}

export function isArgNode(n: Node): n is ArgNode {
  return n.kind === NodeKind.Arg
}

export function isInputFieldNode(n: Node): n is InputFieldNode {
  return n.kind === NodeKind.InputField
}

export function isArgsNode(n: Node): n is ArgsNode {
  return n.kind === NodeKind.Args
}
