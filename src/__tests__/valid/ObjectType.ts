import {ObjectType} from 'revali/index'

@ObjectType()
class SomeObject {}

@ObjectType({
  name: 'Foo',
  description: 'Foo',
})
class AnotherObject {}
