import constantCase from 'constant-case'
import {GraphQLEnumType, GraphQLEnumValueConfigMap} from 'graphql'
import pascalCase from 'pascal-case'

import {Wrapper} from 'revali/wrappers/Wrapper'

export enum EnumTypeCase {
  Pascal,
  Constant,
}

export interface EnumValueConfig {
  deprecationReason?: string
  description?: string
}

export type EnumValueConfigMap<K extends keyof any> = {[key in K]?: EnumValueConfig}

export interface EnumTypeConfig<K extends keyof any> {
  name: string
  description?: string
  changeCase?: EnumTypeCase
  additional?: EnumValueConfigMap<K>
}

const performChangeCase = (type: EnumTypeCase, value: string): string => {
  switch (type) {
    case EnumTypeCase.Constant:
      return constantCase(value)
    case EnumTypeCase.Pascal:
      return pascalCase(value)
  }
}

export function enumType<K extends string, TEnum extends string | number>(
  enumObject: Record<K, TEnum>,
  config: EnumTypeConfig<K>
): Wrapper<TEnum, GraphQLEnumType> {
  const {changeCase} = config

  const getKey = (key: string) => (changeCase ? performChangeCase(changeCase, key) : key)

  const graphQLType = new GraphQLEnumType({
    ...config,
    values: Object.keys(enumObject).reduce((map: GraphQLEnumValueConfigMap, key) => {
      if (!isNaN(parseInt(key, 10))) {
        return map
      }
      return {
        ...map,
        [getKey(key)]: {
          ...(config.additional && (config.additional as any)[key]),
          value: (enumObject as any)[key],
        },
      }
    }, {}),
  })

  return {
    graphQLType,
    type: (null as any) as TEnum,
  }
}
