module.exports.invalidInput = (errorMessage, errors) => {
	const error = new Error(errorMessage)
  error.statusCode = 422

  if (errors) {
    error.errors = errors
  }

  return error
}

module.exports.notFound = (errorMessage) => {
	const error = new Error(errorMessage)
	error.statusCode = 404

  return error
}

module.exports.unauthorized = (errorMessage) => {
	const error = new Error(errorMessage)
	error.statusCode = 401

  return error
}
