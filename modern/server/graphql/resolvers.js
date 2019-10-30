const bcrypt = require('bcryptjs')
// const { validationResult } = require('express-validator')
// const jwt = require('jsonwebtoken')

// const { SECRET_JWT_KEY } = require('../secret/config')
const exception = require('../exception')
const User = require('../models/user')

module.exports = {
  createUser: async ({ userInput }, req) => {
    // validateUser(req)
    const { email, name, password } = userInput;

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      throw exception.notFound('User exists already!')
    }

		const hashedPassword = await bcrypt.hash(password, 12)

		const createdUser = await User({
			email,
      name,
			password: hashedPassword,
    }).save()

    return createdUser
    // res.status(201).json({
    //   message: 'User created successfully',
    //   userId: createdUser._id
    // })
  }
}
