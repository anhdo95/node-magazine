module.exports.invalidInput = (errorMessage, errors) => {
	const error = new Error(errorMessage)
  error.statusCode = 422
  error.errors = errors

  return error
}

module.exports.notFound = (errorMessage) => {
	const error = new Error(errorMessage)
	error.statusCode = 404

  return error
}

module.exports.unauthenticated = (errorMessage = 'Not authenticated.') => {
	const error = new Error(errorMessage)
	error.statusCode = 401

  return error
}

module.exports.unauthorized = (errorMessage = 'Not authorized.') => {
	const error = new Error(errorMessage)
	error.statusCode = 403

  return error
}
