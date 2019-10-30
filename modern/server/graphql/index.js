const graphqlHttp = require('express-graphql')

const schema = require('./schema')
const resolvers = require('./resolvers')

module.exports = graphqlHttp({
  schema,
  rootValue: resolvers,
  graphiql: true
})
