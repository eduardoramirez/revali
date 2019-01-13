import express from 'express'
import graphqlHTTP from 'express-graphql'
import {random, times} from 'lodash'

import {
  Args,
  compileSchema,
  enumType,
  Field,
  Implements,
  InputField,
  InputObjectType,
  InterfaceType,
  list,
  nullable,
  ObjectType,
  TSGraphQLID,
  TSGraphQLInt,
  TSGraphQLString,
  unionType,
} from '../../src/index'

// -- Node --

type ID = string | number

@InterfaceType()
abstract class Node {
  @Field({type: TSGraphQLID})
  public id!: ID
}

@Args()
class NodeArgs {
  @InputField({type: TSGraphQLID})
  public id!: ID
}

@Args()
class NodesArgs {
  @InputField({type: list(TSGraphQLID)})
  public ids!: ID[]
}

const randomNode = (id: ID, recordContents: string = 'Lorem ipsum') => {
  return !!random(1, false)
    ? new User(id, UserRole.STANDARD, 'John Doe')
    : new Record(id, recordContents, new User('foo', UserRole.ADMIN, 'John Doe'))
}

// --- User ---

enum UserRole {
  ADMIN = 'ADMIN',
  STANDARD = 'STANDARD',
  GUEST = 'GUEST',
}

const UserRoleEnumType = enumType(UserRole, {name: 'UserRole'})

@ObjectType()
@Implements(Node)
class User {
  // If a property is an explicitly typed string, number, or bool,
  // you can leave out the type option
  @Field()
  public name: string

  @Field({type: UserRoleEnumType})
  public role: UserRole

  constructor(public id: ID, role: UserRole, name: string) {
    this.role = role
    this.name = name
  }
}

// --- Record ---

@ObjectType()
@Implements(Node)
class Record {
  // Properties can be
  @Field({type: TSGraphQLInt})
  public version = 1 // A plain value
  // version = Promise.resolve(1); // A Promise
  // version() { return 1 } // A resolver method (can also return Promise)

  @Field({type: nullable(TSGraphQLString)})
  public contents: string | null

  @Field({type: User})
  public createdBy: User

  constructor(public id: ID, contents: string, createdBy: User) {
    this.contents = contents
    this.createdBy = createdBy
  }
}

@InputObjectType()
class AddRecordInput {
  @InputField()
  public contents!: string

  @InputField({type: TSGraphQLID})
  public userID!: ID
}

@Args()
class AddRecordArgs {
  @InputField({type: AddRecordInput})
  public input!: AddRecordInput
}

@ObjectType()
class AddRecordPayload {
  @Field({type: Record})
  public record: Record

  constructor(record: Record) {
    this.record = record
  }
}

// -- Search --

const SearchResult = unionType<User | Record>({
  name: 'SearchResult',
  types: [User, Record],
})

@Args()
class SearchResultArgs {
  @InputField()
  public query!: string
}

// -- Schema/App --

@ObjectType()
class Query {
  @Field({type: list(SearchResult), args: SearchResultArgs})
  public search({query}: SearchResultArgs) {
    return times(10, n => randomNode(n, query))
  }

  @Field({type: Node, args: NodeArgs})
  public node({id}: NodeArgs) {
    return randomNode(id)
  }

  @Field({type: list(Node), args: NodesArgs})
  public nodes({ids}: NodesArgs) {
    return ids.map(id => randomNode(id))
  }
}

@ObjectType()
class Mutation {
  @Field({type: AddRecordPayload, args: AddRecordArgs})
  public addRecord({input}: AddRecordArgs) {
    const createdBy = new User(input.userID, UserRole.ADMIN, 'John Smith')
    return new AddRecordPayload(new Record('foo', input.contents, createdBy))
  }
}

const schema = compileSchema({Query, Mutation})

const app = express()

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    context: undefined,
    graphiql: true,
  })
)

app.listen(4000, () => {
  console.log('Running on http://localhost:4000/graphql')
})
