const graphqlHttp = require('express-graphql')

const schema = require('./schema')
const resolvers = require('./resolvers')

module.exports = graphqlHttp({
	schema,
	rootValue: resolvers,
	graphiql: true,
	customFormatErrorFn(error) {
		if (!error.originalError) {
			return error
		}

		const {
      message = 'An error occurred!',
      statusCode = 500,
      errors = []
    } = error.originalError

		return {
			message,
			status: statusCode,
			data: errors,
		}
	},
})
