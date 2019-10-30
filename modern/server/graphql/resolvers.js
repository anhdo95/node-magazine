const bcrypt = require('bcryptjs')
const validator = require('validator')
// const jwt = require('jsonwebtoken')

// const { SECRET_JWT_KEY } = require('../secret/config')
const exception = require('../exception')
const User = require('../models/user')

const getUserValidationErrors = ({ email, name, password }) => {
  const errors = []

  if (!validator.isEmail(email)) {
    errors.push('Email is invalid')
  }

  if (validator.isEmpty(password) || !validator.isLength(password, { min: 5 })) {
    errors.push('Password at least must be 5 characters')
  }

  return errors
}

module.exports = {
  createUser: async ({ userInput }, req) => {
    const errors = getUserValidationErrors(userInput)

    if (errors.length) {
      throw exception.invalidInput('Input invalid', errors)
    }

    const existingUser = await User.findOne({ email: userInput.email })

    if (existingUser) {
      throw exception.notFound('User exists already!')
    }

		const hashedPassword = await bcrypt.hash(userInput.password, 12)

		const createdUser = await User({
			email: userInput.email,
      name: userInput.name,
			password: hashedPassword,
    }).save()

    return createdUser
  }
}
