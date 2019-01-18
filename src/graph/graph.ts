import {GraphQLInputType, GraphQLOutputType, GraphQLType, Thunk} from 'graphql'
import {flatMap} from 'lodash'

import {
  ArgNode,
  ArgsNode,
  FieldNode,
  ImplementNode,
  InputFieldNode,
  InputObjectNode,
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
  WriteableNode,
} from 'revali/graph/definitions'
import {AnyConstructor, EmptyConstructor} from 'revali/types'
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
  private nodes = new Map<AnyConstructor<any>, WriteableNode>()

  private args = new WeakMap<AnyConstructor<any>, ArgsNode>()
  private waitingRooms = new WeakMap<AnyConstructor<any>, Node[]>()

  public createObject(target: AnyConstructor<any>, metadata: ObjectMetadata) {
    const childNodes = this.getWaitingRoom(target)
    const objectNode: ObjectNode = {
      metadata,
      target,
      kind: NodeKind.Object,
      fieldNodes: getNodeOfType(childNodes, isFieldNode),
      implementNodes: getNodeOfType(childNodes, isImplementNode),
    }

    objectNode.implementNodes.forEach(({interfaceNode}) => {
      interfaceNode.implementerNodes.push(objectNode)
    })

    this.clearWaitingRoom(target)

    this.nodes.set(target, objectNode)
  }

  public createInputObject(target: EmptyConstructor<any>, metadata: InputObjectMetadata) {
    const childNodes = this.getWaitingRoom(target)
    const inputNode: InputObjectNode = {
      target,
      metadata,
      kind: NodeKind.InputObject,
      inputFields: getNodeOfType(childNodes, isInputFieldNode),
    }

    this.clearWaitingRoom(target)

    this.nodes.set(target, inputNode)
  }

  public createInterface(target: AnyConstructor<any>, metadata: InterfaceMetadata) {
    const childNodes = this.getWaitingRoom(target)
    const interfaceNode: InterfaceNode = {
      metadata,
      kind: NodeKind.Interface,
      target,
      fieldNodes: getNodeOfType(childNodes, isFieldNode),
      implementerNodes: [],
    }

    this.nodes.set(target, interfaceNode)
  }

  public createField(target: AnyConstructor<any>, metadata: Thunk<FieldMetadata>) {
    const className = target.name
    const childNodes = this.getWaitingRoom(target)
    const fieldNode: FieldNode = {
      target,
      kind: NodeKind.Field,
      metadata: () => {
        const {arg, args, type, ...metadataRest} = resolveThunk(metadata)
        const fieldName = metadataRest.name

        const outType = this.getWrapperOrNodeFromWrapperOrType(type)
        assertOutputType(
          outType,
          `Expected the type of '${className}.${fieldName}' to be ObjectType or InterfaceType.
          }`
        )

        if (args && arg) {
          throw new Error(
            `Both 'arg' and 'args' are set in '${className}.${fieldName}'. You may only use one.`
          )
        } else if (args) {
          const argsNode = this.args.get(args)
          if (!argsNode) {
            throw new Error(
              `Args not found for '${args.name}'. Are you missing the @Args decorator?`
            )
          } else if (argsNode.inputFields.length === 0) {
            throw new Error(
              `No args found. Are you missing @InputField decorators on '${argsNode.target.name}'?`
            )
          }

          return {...metadataRest, type: outType, args: argsNode}
        } else if (arg) {
          const argNodes = getNodeOfType(childNodes, isArgNode).filter(
            ({field}) => field === metadataRest.name
          )

          if (argNodes.length > 1) {
            throw new Error(
              `Unexpected number of @Arg uses for '${className}.${fieldName}'. Use @Args for multiple arguments.`
            )
          } else if (argNodes.length === 0) {
            throw new Error(
              `Defined the option 'arg' in '${className}.${fieldName}' but no use of @Arg found.`
            )
          }

          const argType = this.getWrapperOrNodeFromWrapperOrType(arg)

          return {...metadataRest, type: outType, arg: {type: argType, node: argNodes[0]}}
        }
        return {...metadataRest, type: outType}
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

        const wrappedType = this.getWrapperOrNodeFromWrapperOrType(type)
        assertInputType(wrappedType, `Expected '${target.name}.${rest.name}' to be an InputType.`)

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
    const ifaceNode = this.getNode(iface)
    if (!isInterfaceNode(ifaceNode)) {
      throw new Error(
        `Unexpected use of @Implements in '${target.name}'. Expected '${
          iface.name
        }' to be InterfaceType.`
      )
    }

    const node: ImplementNode = {kind: NodeKind.Implement, interfaceNode: ifaceNode}

    this.addToWaitingRoom(target, node)
  }

  // Navigation helpers

  public getNode(target: AnyConstructor<any>): WriteableNode {
    const node = this.nodes.get(target)
    if (!node) {
      throw new Error(`Could not find metadata for '${target.name}'. Is it decorated?`)
    }

    return node
  }

  public getUnreachableNodes(roots: Node[]): WriteableNode[] {
    const visitedWriteableNodes = flatMap(roots, r => this.extractWriteableNodesInPath(r))

    const visitedTargetMap = new WeakMap<AnyConstructor<any>, boolean>(
      visitedWriteableNodes.map(({target}): [AnyConstructor<any>, boolean] => [target, true])
    )

    const unreachableNodes: WriteableNode[] = []
    this.nodes.forEach((node, target) => {
      if (!visitedTargetMap.get(target)) {
        unreachableNodes.push(node)
      }
    })

    return unreachableNodes
  }

  public getWrapperOrNodeFromWrapperOrType<T extends GraphQLType>(
    wrapperOrType: WrapperOrType<any, T>
  ): WrapperOrNode<any, T> {
    if (isWrapper(wrapperOrType)) {
      return wrapperOrType
    }

    return this.getNode(wrapperOrType)
  }

  public clear() {
    this.nodes.clear()
  }

  // Performs a DFS traversal over the graph extracting the list of WriteableNodes
  // in the path starting at `root`.
  private extractWriteableNodesInPath(root: Node): WriteableNode[] {
    const writeableTargets = new WeakMap<AnyConstructor<any>, boolean>()

    const dfsHelper = (n: Node): WriteableNode[] => {
      let children: WriteableNode[] = []

      if (isObjectNode(n)) {
        if (writeableTargets.get(n.target)) {
          return []
        }
        writeableTargets.set(n.target, true)

        children = flatMap([...n.fieldNodes, ...n.implementNodes], cn => dfsHelper(cn))
        return [n, ...children]
      } else if (isInputObjectNode(n)) {
        if (writeableTargets.get(n.target)) {
          return []
        }

        writeableTargets.set(n.target, true)
        children = flatMap(n.inputFields, cn => dfsHelper(cn))

        return [n, ...children]
      } else if (isInterfaceNode(n)) {
        if (writeableTargets.get(n.target)) {
          return []
        }

        writeableTargets.set(n.target, true)
        children = flatMap(n.fieldNodes, cn => dfsHelper(cn))

        return [n, ...children]
      } else if (isImplementNode(n)) {
        return dfsHelper(n.interfaceNode)
      } else if (isArgsNode(n)) {
        return flatMap(n.inputFields, cn => dfsHelper(cn))
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

        return flatMap(fieldChildrenNodes, cn => dfsHelper(cn))
      }

      return []
    }

    return dfsHelper(root)
  }

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

function assertOutputType(wrapperOrNode: WrapperOrNode<any, any>, errMsg: string) {
  if (
    !isWrapper(wrapperOrNode) &&
    !isInterfaceNode(wrapperOrNode) &&
    !isObjectNode(wrapperOrNode)
  ) {
    throw new Error(errMsg)
  }
}

function assertInputType(wrapperOrNode: WrapperOrNode<any, any>, errMsg: string) {
  if (!isWrapper(wrapperOrNode) && !isInputObjectNode(wrapperOrNode)) {
    throw new Error(errMsg)
  }
}

export const graph = new Graph()
