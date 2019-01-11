import {enumType} from '../../../wrappers/enumType'
import {Field} from '../../Field'

enum AnEnum {
  Foo,
}

const AnEnumGraphQLType = enumType(AnEnum, {name: 'AnEnum'})

class Foo {
  @Field({type: AnEnumGraphQLType})
  public foo!: string
}
