import { GraphQLNonNull, GraphQLType, GraphQLUnionType } from 'graphql';
import { Wrapper } from './Wrapper';
import { AnyConstructor } from '../types';
import getObjectType from '../builders/getObjectType';
import findConstructor from '../utils/findConstructor';

export type TSGraphQLUnionTypeConfig<T> = {
  types: Array<AnyConstructor<T>>,
  name: string,
  description?: string,
}

export default class TSGraphQLUnionType<T> implements Wrapper<T, GraphQLUnionType> {
  graphQLType: GraphQLUnionType;
  type: T;
  constructor(config: TSGraphQLUnionTypeConfig<T>) {
    this.type = (null as any) as T;
    this.graphQLType = new GraphQLUnionType({
      ...config,
      types: config.types.map(getObjectType),
      resolveType: (instance: {}) => {
        const type = findConstructor(instance, config.types);
        if (!type) {
          // This should be impossible
          throw new Error(`Source not instance of passed types for ${config.name}`);
        }
        return getObjectType(type);
      },
    });
  }
}