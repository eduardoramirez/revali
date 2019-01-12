import {InterfaceType} from 'revali/index'

@InterfaceType()
class SomeInterface {}

@InterfaceType({
  name: 'Foo',
})
class AnotherInterface {}
