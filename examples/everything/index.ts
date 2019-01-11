import express from 'express'
import graphqlHTTP from 'express-graphql'
import {GraphQLObjectType, GraphQLSchema} from 'graphql'
import {random, times} from 'lodash'
import {
  Arg,
  Args,
  buildFields,
  enumType,
  Field,
  fields,
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
  @Arg({type: TSGraphQLID})
  public id!: ID
}

@Args()
class NodesArgs {
  @Arg({type: list(TSGraphQLID)})
  public ids!: ID[]
}

const randomNode = (id: ID, recordContents: string = 'Lorem ipsum') => {
  return !!random(1, false)
    ? new User(id, UserRole.STANDARD, 'John Doe')
    : new Record(id, recordContents, new User('foo', UserRole.ADMIN, 'John Doe'))
}

// Works well to modularize Query/Mutation fields
const nodeQueryFields = fields({}, field => ({
  node: field({type: Node, args: NodeArgs}, (root, {id}) => {
    return randomNode(id)
  }),

  nodes: field({type: list(Node), args: NodesArgs}, (root, {ids}) => {
    return ids.map(id => randomNode(id))
  }),
}))

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
  @Arg({type: AddRecordInput})
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

const recordMutationFields = fields({}, field => ({
  addRecord: field({type: AddRecordPayload, args: AddRecordArgs}, (root, {input}) => {
    const createdBy = new User(input.userID, UserRole.ADMIN, 'John Smith')
    return new AddRecordPayload(new Record('foo', input.contents, createdBy))
  }),
}))

// -- Search --

const SearchResult = unionType<User | Record>({
  name: 'SearchResult',
  types: [User, Record],
})

@Args()
class SearchResultArgs {
  @Arg()
  public query!: string
}

const searchQueryFields = fields({}, field => ({
  search: field({type: list(SearchResult), args: SearchResultArgs}, (root, {query}) => {
    return times(10, n => randomNode(n, query))
  }),
}))

// -- Schema/App --

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: () => buildFields([nodeQueryFields, searchQueryFields]),
})

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => buildFields([recordMutationFields]),
})

const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
})

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
