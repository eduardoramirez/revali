import {GraphQLInputType, GraphQLOutputType, Thunk} from 'graphql'

import {
  ArgNode,
  ArgsNode,
  FieldNode,
  ImplementNode,
  InputFieldNode,
  InputObjectNode,
  InputTypeNode,
  InterfaceNode,
  isArgNode,
  isArgsNode,
  isFieldNode,
  isImplementNode,
  isInputFieldNode,
  isInputObjectNode,
  isInterfaceNode,
  isObjectNode,
  Node,
  NodeKind,
  ObjectNode,
  OutputTypeNode,
  WriteableNode,
} from 'revali/graph/definitions'
import {AnyConstructor, EmptyConstructor, Maybe} from 'revali/types'
import {resolveThunk} from 'revali/utils'
import {isWrapper, WrapperOrNode, WrapperOrType} from 'revali/wrappers/Wrapper'

interface ObjectMetadata {
  name: string
  description?: string
}

type InterfaceMetadata = ObjectMetadata

type InputObjectMetadata = ObjectMetadata

interface ArgMetadata {
  name: string
  defaultValue?: any
  description?: string
}

interface InputFieldMetadata {
  name: string
  type: WrapperOrType<any, GraphQLInputType>
  defaultValue?: any
  description?: string
}

interface FieldMetadata {
  name: string
  type: WrapperOrType<any, GraphQLOutputType>
  description?: string
  isDeprecated?: boolean
  deprecationReason?: string
  args?: EmptyConstructor<any>
  arg?: WrapperOrType<any, GraphQLInputType>
}

export class Graph {
  private inputNodes = new Map<AnyConstructor<any>, InputTypeNode>()
  private outputNodes = new Map<AnyConstructor<any>, OutputTypeNode>()
  private args = new Map<AnyConstructor<any>, ArgsNode>()
  private waitingRooms = new WeakMap<AnyConstructor<any>, Node[]>()

  public createObject(target: AnyConstructor<any>, metadata: ObjectMetadata) {
    const childNodes = this.getWaitingRoom(target)

    const objectNode: ObjectNode = {
      metadata,
      kind: NodeKind.Object,
      target,
      fieldNodes: getNodeOfType(childNodes, isFieldNode),
      implementNodes: getNodeOfType(childNodes, isImplementNode),
    }

    objectNode.implementNodes.forEach(ifaceNode => {
      ifaceNode.interfaceNode.implementerNodes.push(objectNode)
    })

    this.clearWaitingRoom(target)

    this.outputNodes.set(target, objectNode)
  }

  public createInputObject(target: EmptyConstructor<any>, metadata: InputObjectMetadata) {
    const childNodes = this.getWaitingRoom(target)
    const node: InputObjectNode = {
      target,
      metadata,
      kind: NodeKind.InputObject,
      inputFields: getNodeOfType(childNodes, isInputFieldNode),
    }

    this.clearWaitingRoom(target)

    this.inputNodes.set(target, node)
  }

  public createInterface(target: AnyConstructor<any>, metadata: InterfaceMetadata) {
    const childNodes = this.getWaitingRoom(target)

    const node: InterfaceNode = {
      metadata,
      kind: NodeKind.Interface,
      target,
      fieldNodes: getNodeOfType(childNodes, isFieldNode),
      implementerNodes: [],
    }

    this.outputNodes.set(target, node)
  }

  public createField(target: AnyConstructor<any>, metadata: Thunk<FieldMetadata>) {
    const childNodes = this.getWaitingRoom(target)

    const fieldNode: FieldNode = {
      target,
      kind: NodeKind.Field,
      metadata: () => {
        const {arg, args, type, ...rest} = resolveThunk(metadata)

        let outType: WrapperOrNode<OutputTypeNode, GraphQLOutputType>
        if (isWrapper(type)) {
          outType = type
        } else {
          const node = this.outputNodes.get(type)
          if (!node) {
            throw new Error()
          }
          outType = node
        }

        if (args && arg) {
          // TODO: better error msg
          throw new Error()
        } else if (args) {
          const argsNode = this.args.get(args)
          if (!argsNode) {
            // TODO: better error message
            throw new Error('Could not find ArgsType class')
          }

          return {...rest, type: outType, args: argsNode}
        } else if (arg) {
          const argNodes = getNodeOfType(childNodes, isArgNode)
          if (argNodes.length > 1) {
            // TODO: better error message
            throw new Error('Unexpected number of argument nodes')
          }

          let argType
          if (isWrapper(arg)) {
            argType = arg
          } else {
            const node = this.inputNodes.get(arg)
            if (!node) {
              // TODO: better error
              throw new Error('cant find argument type')
            }

            argType = node
          }

          return {...rest, type: outType, arg: {type: argType, node: argNodes[0]}}
        }
        return {...rest, type: outType}
      },
    }

    this.addToWaitingRoom(target, fieldNode)
  }

  public createInputField(target: AnyConstructor<any>, metadata: Thunk<InputFieldMetadata>) {
    const inputFieldNode: InputFieldNode = {
      target,
      kind: NodeKind.InputField,
      metadata: () => {
        const {type, ...rest} = resolveThunk(metadata)
        let wrappedType
        if (isWrapper(type)) {
          wrappedType = type
        } else {
          const node = this.inputNodes.get(type)
          if (!node) {
            // TODO: better error message
            throw new Error()
          }
          wrappedType = node
        }
        return {...rest, type: wrappedType}
      },
    }

    this.addToWaitingRoom(target, inputFieldNode)
  }

  public createArgs(target: EmptyConstructor<any>) {
    const childNodes = this.getWaitingRoom(target)
    const argsNode: ArgsNode = {
      target,
      kind: NodeKind.Args,
      inputFields: getNodeOfType(childNodes, isInputFieldNode),
    }

    this.clearWaitingRoom(target)

    this.args.set(target, argsNode)
  }

  public createArg(target: AnyConstructor<any>, field: string, metadata: ArgMetadata) {
    const argNode: ArgNode = {metadata, field, kind: NodeKind.Arg}
    this.addToWaitingRoom(target, argNode)
  }

  public createImplement(target: AnyConstructor<any>, iface: AnyConstructor<any>) {
    const ifaceNode = this.outputNodes.get(iface)

    if (!ifaceNode || !isInterfaceNode(ifaceNode)) {
      // TODO: better error
      throw new Error('Could not interface ty')
    }

    const node: ImplementNode = {kind: NodeKind.Implement, interfaceNode: ifaceNode}

    this.addToWaitingRoom(target, node)
  }

  // Navigation helpers

  public getOutputTypeNode(target: AnyConstructor<any>): Maybe<OutputTypeNode> {
    return this.outputNodes.get(target)
  }

  public getInputTypeNode(target: AnyConstructor<any>): Maybe<InputTypeNode> {
    return this.inputNodes.get(target)
  }

  public getUnreachableWriteableNodes(roots: Node[]): WriteableNode[] {
    const visitedWriteableNodes = flatten(roots.map(r => this.dfs(r)))

    const visitedTargetMap = new Map<AnyConstructor<any>, boolean>(
      visitedWriteableNodes.map(({target}): [AnyConstructor<any>, boolean] => [target, true])
    )

    const allWriteableNodes = new Map<AnyConstructor<any>, WriteableNode>([
      ...this.outputNodes,
      ...this.inputNodes,
    ])

    const unreachableNodes: WriteableNode[] = []
    allWriteableNodes.forEach((node, target) => {
      if (!visitedTargetMap.get(target)) {
        unreachableNodes.push(node)
      }
    })

    return unreachableNodes
  }

  private dfs(root: Node): WriteableNode[] {
    const writeableTargets = new WeakMap<AnyConstructor<any>, boolean>()

    const dfsHelper = (n: Node): WriteableNode[] => {
      let children: WriteableNode[] = []

      if (isObjectNode(n)) {
        if (writeableTargets.get(n.target)) {
          return []
        }
        writeableTargets.set(n.target, true)

        children = flatten([...n.fieldNodes, ...n.implementNodes].map(cn => dfsHelper(cn)))
        return [n, ...children]
      } else if (isInputObjectNode(n)) {
        if (writeableTargets.get(n.target)) {
          return []
        }

        writeableTargets.set(n.target, true)
        children = flatten(n.inputFields.map(cn => dfsHelper(cn)))

        return [n, ...children]
      } else if (isInterfaceNode(n)) {
        if (writeableTargets.get(n.target)) {
          return []
        }

        writeableTargets.set(n.target, true)
        children = flatten(n.fieldNodes.map(cn => dfsHelper(cn)))

        return [n, ...children]
      } else if (isImplementNode(n)) {
        return dfsHelper(n.interfaceNode)
      } else if (isArgsNode(n)) {
        return flatten(n.inputFields.map(cn => dfsHelper(cn)))
      } else if (isInputFieldNode(n)) {
        const {type} = resolveThunk(n.metadata)
        if (!isWrapper(type)) {
          return dfsHelper(type)
        }
      } else if (isFieldNode(n)) {
        const {type, arg, args} = resolveThunk(n.metadata)

        const fieldChildrenNodes: Node[] = []

        if (!isWrapper(type)) {
          fieldChildrenNodes.push(type)
        }

        if (arg) {
          if (!isWrapper(arg.type)) {
            fieldChildrenNodes.push(arg.type)
          }
        }

        if (args) {
          fieldChildrenNodes.push(args)
        }

        return flatten(fieldChildrenNodes.map(cn => dfsHelper(cn)))
      }

      return []
    }

    return dfsHelper(root)
  }

  // Private helpers

  private addToWaitingRoom(target: AnyConstructor<any>, n: Node) {
    const existingWaitingNodes = this.getWaitingRoom(target)
    existingWaitingNodes.push(n)
    this.waitingRooms.set(target, existingWaitingNodes)
  }

  private clearWaitingRoom(target: AnyConstructor<any>) {
    this.waitingRooms.delete(target)
  }

  private getWaitingRoom(target: AnyConstructor<any>): Node[] {
    return this.waitingRooms.get(target) || []
  }
}

function getNodeOfType<T extends Node>(nodes: Node[], isNodeType: (n: Node) => n is T): T[] {
  const fieldNodes: T[] = []

  nodes.forEach(n => {
    if (isNodeType(n)) {
      fieldNodes.push(n)
    }
  })

  return fieldNodes
}

export const graph = new Graph()

function flatten<T>(a: T[][]): T[] {
  if (a.length === 0) {
    return []
  }
  return a.reduce((acc, e) => acc.concat(e))
}
