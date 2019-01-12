import {enumType, Field} from 'revali/index'

enum AnEnum {
  Foo,
}

const AnEnumGraphQLType = enumType(AnEnum, {name: 'AnEnum'})

class Foo {
  @Field({type: AnEnumGraphQLType})
  public foo!: string
}
