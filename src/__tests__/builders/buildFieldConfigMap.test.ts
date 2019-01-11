import {GraphQLID} from 'graphql'
import 'jest'

import {Arg} from '../../decorators/Arg'
import {Args} from '../../decorators/Args'
import {Field} from '../../decorators/Field'
import {Implements} from '../../decorators/Implements'
import {InputField} from '../../decorators/InputField'
import {InputObjectType} from '../../decorators/InputObjectType'
import {InterfaceType} from '../../decorators/InterfaceType'
import {fields} from '../../fields'
import {ObjectType, TSGraphQLID, TSGraphQLInt, TSGraphQLString} from '../../index'
import {resolveThunk} from '../../utils/thunk'
import {list} from '../../wrappers/list'
import {nullable} from '../../wrappers/nullable'
import {getFieldConfigMap} from '../buildFieldConfigMap'

class Simple {
  @Field()
  public str!: string

  @Field()
  public num!: number

  @Field()
  public bool!: boolean
}

class A {
  @Field()
  public a!: string
}

class B extends A {
  @Field()
  public b!: string
}

@InterfaceType()
abstract class Node {
  @Field()
  public id!: string
}

@InterfaceType()
abstract class Actor {
  @Field()
  public displayName!: string
}

@Implements(Node)
@Implements(Actor)
class User {
  public id!: string
  public displayName!: string

  @Field()
  public email!: string
}

class Employee extends User {
  @Field()
  public company!: string
}

@InterfaceType()
abstract class HasAvatar {
  @Field()
  public avatarURL!: string
}

@Implements(HasAvatar)
class EmployeeWithPicture extends Employee {
  public avatarURL!: string
}

@ObjectType({
  fields: () => [someFields, moreFields],
})
class Foo {
  @Field({type: TSGraphQLString})
  public foo(): string {
    return 'foo'
  }
}

const someFields = fields({source: Foo}, field => ({
  bar: field({type: TSGraphQLString}, () => 'bar'),
}))

const moreFields = fields({source: Foo}, field => ({
  baz: field({type: TSGraphQLInt}, () => 4),
}))

describe('getFieldConfigMap', () => {
  it('should properly get fields for simple class', () => {
    const config = resolveThunk(getFieldConfigMap(Simple))
    for (const property in Object.keys(Simple.prototype)) {
      expect(config).toHaveProperty(property)
    }
  })

  it('should inherit fields from superclasses', () => {
    const config = resolveThunk(getFieldConfigMap(B))
    expect(config).toHaveProperty('a')
    expect(config).toHaveProperty('b')
  })

  it('should inherit fields from interfaces', () => {
    const config = resolveThunk(getFieldConfigMap(User))
    expect(config).toHaveProperty('id')
    expect(config).toHaveProperty('email')
    expect(config).toHaveProperty('displayName')
  })

  it('should inherit fields from interfaces on superclasses', () => {
    const config = resolveThunk(getFieldConfigMap(Employee))
    expect(config).toHaveProperty('id')
    expect(config).toHaveProperty('email')
    expect(config).toHaveProperty('displayName')
    expect(config).toHaveProperty('company')
  })

  it('should override fields with same name from interface', () => {
    class OverrideTest extends User {
      @Field({type: nullable(TSGraphQLID)})
      public id!: string
    }
    const config = resolveThunk(getFieldConfigMap(OverrideTest))
    expect(config.id.type).toEqual(GraphQLID)
  })

  it('should override fields with same name on superclass', () => {
    class OverrideTest extends Simple {
      @Field({type: nullable(TSGraphQLID)})
      public str!: string
    }
    const config = resolveThunk(getFieldConfigMap(OverrideTest))
    expect(config.str.type).toEqual(GraphQLID)
  })

  it('should inherit fields from interfaces on superclass and interfaces on itself', () => {
    const config = resolveThunk(getFieldConfigMap(EmployeeWithPicture))
    expect(config).toHaveProperty('id')
    expect(config).toHaveProperty('email')
    expect(config).toHaveProperty('displayName')
    expect(config).toHaveProperty('company')
    expect(config).toHaveProperty('avatarURL')
  })

  it('should merge decorator fields with config fields', () => {
    const config = resolveThunk(getFieldConfigMap(Foo))
    expect(config).toHaveProperty('foo')
    expect(config).toHaveProperty('bar')
    expect(config).toHaveProperty('baz')
  })

  it('should create resolver from instance method', () => {
    const config = resolveThunk(getFieldConfigMap(Foo))
    expect(config).toHaveProperty('foo')
    expect(typeof config.foo.resolve).toEqual('function')
    expect(config.foo.resolve!(null, {}, null, null as any)).toEqual(new Foo().foo())
  })

  it('should use default resolver for plain fields', () => {
    const config = resolveThunk(getFieldConfigMap(Simple))
    expect(config).toHaveProperty('str')
    expect(config.str.resolve!({str: 'foo'}, {}, null, null as any)).toEqual('foo')
  })

  it('should wrap property initializers', () => {
    const test = (...args: any[]) => {
      expect(args.length).toEqual(3)
      return ''
    }

    @ObjectType()
    class Foo {
      @Field({type: TSGraphQLString})
      public foo = test
    }

    const foo = resolveThunk(getFieldConfigMap(Foo))
    foo.foo.resolve!(new Foo(), {}, {}, null as any)
  })

  it('should instantiate args and input object classes in resolvers', () => {
    @InputObjectType()
    class SomeInput {
      @InputField()
      public foo!: string
    }

    @Args()
    class SomeArgs {
      @Arg()
      public bar!: string

      @Arg({type: SomeInput})
      public input!: SomeInput
    }

    const testResolver = (args: SomeArgs) => {
      expect(args instanceof SomeArgs).toBeTruthy()
      expect(args.input instanceof SomeInput).toBeTruthy()
      return args.bar
    }

    @ObjectType({
      fields: () => argsFields,
    })
    class ArgsTest {
      @Field({type: TSGraphQLString, args: SomeArgs})
      public initializerTest = testResolver

      @Field({type: TSGraphQLString, args: SomeArgs})
      public methodTest(args: SomeArgs) {
        return testResolver(args)
      }
    }

    const argsFields = fields({source: ArgsTest}, field => ({
      configTest: field({type: TSGraphQLString, args: SomeArgs}, (root, args) =>
        testResolver(args)
      ),
    }))

    const config = resolveThunk(getFieldConfigMap(ArgsTest))
    expect(config).toHaveProperty('configTest')
    expect(config).toHaveProperty('initializerTest')
    expect(config).toHaveProperty('methodTest')
    expect(typeof config.configTest.resolve).toEqual('function')
    expect(typeof config.initializerTest.resolve).toEqual('function')
    expect(typeof config.methodTest.resolve).toEqual('function')

    const args = {
      bar: '',
      input: {
        foo: '',
      },
    }

    config.configTest.resolve!(new ArgsTest(), args, null, null as any)
    config.methodTest.resolve!(new ArgsTest(), args, null, null as any)
  })

  it('should correctly run wrapper transformers', () => {
    const transformOutput = jest.fn(() => 'FOO')

    const someType = {
      ...TSGraphQLString,
      transformOutput,
    }

    @ObjectType()
    class Foo {
      @Field({type: list(nullable(someType))})
      public foo() {
        return ['', null]
      }
    }

    const config = resolveThunk(getFieldConfigMap(Foo))
    expect(config).toHaveProperty('foo')
    expect(config.foo!.resolve!(null, {}, null, null as any)).toEqual(['FOO', null])

    expect(transformOutput).toHaveBeenCalledTimes(1)
  })
})
