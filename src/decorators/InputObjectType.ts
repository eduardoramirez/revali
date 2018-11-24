import { GraphQLInputObjectType } from 'graphql';
import { graphQLInputTypeMetadata } from '../metadata';
import { Constructor } from '../types';
import { getInputFields } from './InputField';

export type InputObjectTypeConfig<TSource, TContext> = {
  name?: string,
  description?: string,
}

export default <TSource, TContext>(config: InputObjectTypeConfig<TSource, TContext>) =>
  (source: Constructor<TSource>) => {
    const { name, description } = config;
    const type = new GraphQLInputObjectType({
      name: name || source.name,
      fields: getInputFields(source),
      description,
    });
    return graphQLInputTypeMetadata(type)(source);
  }