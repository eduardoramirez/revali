import express from 'express'
import graphqlHTTP from 'express-graphql'
import {random} from 'lodash'

import {compileSchema, Field, Implements, InterfaceType, ObjectType} from '../../src/index'

@InterfaceType()
abstract class Fruit {
  @Field()
  public name!: string

  @Field()
  public color!: string
}

@ObjectType()
@Implements(Fruit)
class Apple {
  public name = 'Apple'

  @Field()
  public variety: string

  constructor(public color: string, variety: string) {
    this.variety = variety
  }
}

@ObjectType()
@Implements(Fruit)
class Orange {
  public name = 'Orange'
  public color = 'Orange'
}

@ObjectType()
class Query {
  @Field({type: Fruit})
  public async randomFruit() {
    return !!random(1, false) ? new Orange() : new Apple('Red', 'Red Delicious')
  }
}

const schema = compileSchema({Query})

const app = express()

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    context: undefined,
    graphiql: true,
  })
)

app.listen(4001, () => {
  console.log('Running on http://localhost:4001/graphql')
})
