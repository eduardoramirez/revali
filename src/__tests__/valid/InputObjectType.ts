import {InputObjectType} from 'revali/index'

@InputObjectType()
class SomeInput {}

@InputObjectType({
  name: 'blah',
  description: '',
})
class AnotherInput {}
