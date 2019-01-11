import {GraphQLBoolean, GraphQLFloat, GraphQLID, GraphQLInt, GraphQLString} from 'graphql'

import {wrapScalar} from 'revali/wrappers/Wrapper'

export const TSGraphQLBoolean = wrapScalar<boolean>(GraphQLBoolean)
export const TSGraphQLFloat = wrapScalar<number>(GraphQLFloat)
export const TSGraphQLID = wrapScalar<number | string>(GraphQLID)
export const TSGraphQLInt = wrapScalar<number>(GraphQLInt)
export const TSGraphQLString = wrapScalar<string>(GraphQLString)
