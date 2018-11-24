import 'reflect-metadata';
import { Constructor } from './types';
import { unsafeWrapType } from './wrappers/Wrapper';
import ObjectType from './decorators/ObjectType';
import { fieldCreatorFor, fields } from './fields';
import Arg from './decorators/Arg';
import TSGraphQLString from './wrappers/TSGraphQLString';
import TSGraphQLInt from './wrappers/TSGraphQLInt';
import { resolveThunk } from './utils/thunk';
import Field from './decorators/Field';
import InputObjectType from './decorators/InputObjectType';
import InputField from './decorators/InputField';
import TSGraphQLFloat from './wrappers/TSGraphQLFloat';
import Args from './decorators/Args';
import TSGraphQLID, { ID } from './wrappers/TSGraphQLID';
import Implements from './decorators/Implements';
import getFieldConfigMap from './builders/getFieldConfigMap';
import getInputFieldConfigMap from './builders/getInputFieldConfigMap';
import getType from './builders/getType';
import getArgs from './builders/getArgs';
import InterfaceType from './decorators/InterfaceType';

type Test<V extends { [key: string]: any }, T extends string> = {
  [key in T]: V[key];
}

const defaultResolver = <F extends string, Root>(fieldName: F, type: Constructor<Root>) =>
  (root: Test<Root, typeof fieldName>) => root[fieldName];

const blah = 'test';
const foo = {
  blah: '',
  bar: 4,
  test: ''
}
const a: Test<typeof foo, typeof blah> = foo;

class DefaultTest {
  foo!: string;
}

const s: string = defaultResolver('foo', DefaultTest)(new DefaultTest());

class Foo {
  test!: string;
}

@ObjectType({
  name: 'Parent',
})
class TestParent {
  @Field({ type: TSGraphQLInt })
  async blah(args: {}, context: Foo) {
    return 4;
  }
}

const parentFields = fields({ source: TestParent }, (field) => ({
  blah: field({ type: TSGraphQLInt }, () => 4),
}));

@ObjectType({
  name: 'Test',
  description: 'A test thing',
})
class TestSource extends TestParent {
  @Field({ type: TSGraphQLString })
  foo = Promise.resolve('test');
}

console.log(resolveThunk(getFieldConfigMap(TestSource)));

console.log(Object.keys(getType(TestSource)));

class CommonInput {
  @InputField({
    type: TSGraphQLString
  })
  foo!: 'string';
}

@InputObjectType()
class TestInput extends CommonInput {
  @InputField({ type: TSGraphQLFloat })
  bar!: number;
}

console.log(resolveThunk(getInputFieldConfigMap(TestInput)));

console.log(getType(TestInput));

@Args
class TestArgs {
  @Arg({ type: TestInput })
  input!: TestInput;
}

@Args
class MoreArgs extends TestArgs {
  @Arg({ type: TSGraphQLInt, defaultValue: 4 })
  foo!: number;
}

console.log(resolveThunk(getArgs(MoreArgs)));

@InterfaceType()
abstract class Node {
  @Field({ type: TSGraphQLID })
  id!: ID;
}

const nodeFields = fields({ source: Node }, (field) => ({
  id: field({ type: TSGraphQLID }),
  node: field({ type: TSGraphQLFloat }, (source) => source.foo)
}))

type Mapped<T> = {
  [key in keyof T]: T[key];
}

@Implements(Node)
class File {
  id() {
    return 4;
  }

  @Field({ type: TSGraphQLString })
  test() {
    return ''
  }
}

console.log(resolveThunk(getFieldConfigMap(File)));
