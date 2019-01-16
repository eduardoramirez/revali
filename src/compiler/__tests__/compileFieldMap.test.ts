import {GraphQLID} from 'graphql'
import 'jest'

import {compileFieldConfigMap} from 'revali/compiler'
import {
  Args,
  Field,
  Implements,
  InputField,
  InputObjectType,
  InterfaceType,
  ObjectType,
} from 'revali/decorators'
import {resolveThunk} from 'revali/utils'
import {list} from 'revali/wrappers/list'
import {nullable} from 'revali/wrappers/nullable'
import {TSGraphQLID, TSGraphQLInt, TSGraphQLString} from 'revali/wrappers/scalars'

@ObjectType()
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

// @ObjectType()
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

@ObjectType()
@Implements(HasAvatar)
class EmployeeWithPicture extends Employee {
  public avatarURL!: string
}

@ObjectType()
class Foo {
  @Field({type: TSGraphQLString})
  public foo(): string {
    return 'foo'
  }

  @Field({type: TSGraphQLInt})
  public baz(): number {
    return 4
  }
}

describe('compileFieldConfigMap', () => {
  it('should properly get fields for simple class', () => {
    const config = resolveThunk(compileFieldConfigMap(Simple))
    for (const property in Object.keys(Simple.prototype)) {
      if (Simple.prototype.hasOwnProperty(property)) {
        expect(config).toHaveProperty(property)
      }
    }
  })

  it('should inherit fields from superclasses', () => {
    const config = resolveThunk(compileFieldConfigMap(B))
    expect(config).toHaveProperty('a')
    expect(config).toHaveProperty('b')
  })

  it('should inherit fields from interfaces', () => {
    const config = resolveThunk(compileFieldConfigMap(User))
    expect(config).toHaveProperty('id')
    expect(config).toHaveProperty('email')
    expect(config).toHaveProperty('displayName')
  })

  it.only('should inherit fields from interfaces on superclasses', () => {
    const config = resolveThunk(compileFieldConfigMap(Employee))
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
    const config = resolveThunk(compileFieldConfigMap(OverrideTest))
    expect(config.id.type).toEqual(GraphQLID)
  })

  it('should override fields with same name on superclass', () => {
    class OverrideTest extends Simple {
      @Field({type: nullable(TSGraphQLID)})
      public str!: string
    }
    const config = resolveThunk(compileFieldConfigMap(OverrideTest))
    expect(config.str.type).toEqual(GraphQLID)
  })

  it('should inherit fields from interfaces on superclass and interfaces on itself', () => {
    const config = resolveThunk(compileFieldConfigMap(EmployeeWithPicture))
    expect(config).toHaveProperty('id')
    expect(config).toHaveProperty('email')
    expect(config).toHaveProperty('displayName')
    expect(config).toHaveProperty('company')
    expect(config).toHaveProperty('avatarURL')
  })

  it('should merge decorator fields with config fields', () => {
    const config = resolveThunk(compileFieldConfigMap(Foo))
    expect(config).toHaveProperty('foo')
    expect(config).toHaveProperty('baz')
  })

  it('should create resolver from instance method', () => {
    const config = resolveThunk(compileFieldConfigMap(Foo))
    expect(config).toHaveProperty('foo')
    expect(typeof config.foo.resolve).toEqual('function')
    expect(config.foo.resolve!(null, {}, null, null as any)).toEqual(new Foo().foo())
  })

  it('should use default resolver for plain fields', () => {
    const config = resolveThunk(compileFieldConfigMap(Simple))
    expect(config).toHaveProperty('str')
    expect(config.str.resolve!({str: 'foo'}, {}, null, null as any)).toEqual('foo')
  })

  it('should wrap property initializers', () => {
    @ObjectType()
    class Foo2 {
      @Field({type: TSGraphQLString})
      public foo = (...args: any[]) => {
        expect(args.length).toEqual(3)
        return ''
      }
    }

    const foo = resolveThunk(compileFieldConfigMap(Foo))
    foo.foo.resolve!(new Foo2(), {}, {}, null as any)
  })

  it('should correctly run wrapper transformers', () => {
    const transformOutput = jest.fn(() => 'FOO')

    const someType = {
      ...TSGraphQLString,
      transformOutput,
    }

    @ObjectType()
    class Foo2 {
      @Field({type: list(nullable(someType))})
      public foo() {
        return ['', null]
      }
    }

    const config = resolveThunk(compileFieldConfigMap(Foo2))
    expect(config).toHaveProperty('foo')
    expect(config.foo!.resolve!(null, {}, null, null as any)).toEqual(['FOO', null])

    expect(transformOutput).toHaveBeenCalledTimes(1)
  })

  it('should instantiate args and input object classes in resolvers', () => {
    @InputObjectType()
    class SomeInput {
      @InputField()
      public foo!: string
    }

    @Args()
    class SomeArgs {
      @InputField()
      public bar!: string

      @InputField({type: SomeInput})
      public input!: SomeInput
    }

    const testResolver = (someArgs: SomeArgs) => {
      expect(someArgs instanceof SomeArgs).toBeTruthy()
      expect(someArgs.input instanceof SomeInput).toBeTruthy()
      return someArgs.bar
    }

    @ObjectType()
    class ArgsTest {
      @Field({type: TSGraphQLString, args: SomeArgs})
      public initializerTest = testResolver

      @Field({type: TSGraphQLString, args: SomeArgs})
      public methodTest(someArgs: SomeArgs) {
        return testResolver(someArgs)
      }
    }

    const config = resolveThunk(compileFieldConfigMap(ArgsTest))
    expect(config).toHaveProperty('initializerTest')
    expect(config).toHaveProperty('methodTest')
    expect(typeof config.initializerTest.resolve).toEqual('function')
    expect(typeof config.methodTest.resolve).toEqual('function')

    const args = {bar: '', input: {foo: ''}}

    config.methodTest.resolve!(new ArgsTest(), args, null, null as any)
  })

  it('should instantiate args and input object classes in resolvers', () => {
    @InputObjectType()
    class SomeInput {
      @InputField()
      public foo!: string
    }

    @Args()
    class SomeArgs {
      @InputField()
      public bar!: string

      @InputField({type: SomeInput})
      public input!: SomeInput
    }

    const testResolver = (someArgs: SomeArgs) => {
      expect(someArgs instanceof SomeArgs).toBeTruthy()
      expect(someArgs.input instanceof SomeInput).toBeTruthy()
      return someArgs.bar
    }

    @ObjectType()
    class ArgsTest {
      @Field({type: TSGraphQLString, args: SomeArgs})
      public initializerTest = testResolver

      @Field({type: TSGraphQLString, args: SomeArgs})
      public methodTest(someArgs: SomeArgs) {
        return testResolver(someArgs)
      }
    }

    const config = resolveThunk(compileFieldConfigMap(ArgsTest))
    expect(config).toHaveProperty('initializerTest')
    expect(config).toHaveProperty('methodTest')
    expect(typeof config.initializerTest.resolve).toEqual('function')
    expect(typeof config.methodTest.resolve).toEqual('function')

    const args = {bar: '', input: {foo: ''}}

    config.methodTest.resolve!(new ArgsTest(), args, null, null as any)
  })
})
