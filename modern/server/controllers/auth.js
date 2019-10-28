const path = require('path')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')

const { SECRET_JWT_KEY } = require('../secret/config')
const exception = require('../exception')
const User = require('../models/user')

const validateUser = (req) => {
	const errors = validationResult(req)

	if (!errors.isEmpty()) {
		throw exception.invalidInput('Validation failed, entered data is incorrect.', errors.array())
	}
}

module.exports.signup = async (req, res, next) => {
	try {
    validateUser(req)

		const hashedPassword = await bcrypt.hash(req.body.password, 12)

		const createdUser = await User({
			email: req.body.email,
			password: hashedPassword,
      name: req.body.name,
    }).save()

    res.status(201).json({
      message: 'User created successfully',
      userId: createdUser._id
    })
	} catch (error) {
		next(error)
	}
}

module.exports.login = async (req, res, next) => {
	try {
    validateUser(req)

    const user = await User.findOne({ email: req.body.email })

    if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
      throw exception.unauthorized('This account could not be found.')
    }

    const token = jwt.sign({
      email: user.email,
      userId: user._id
    }, SECRET_JWT_KEY, { expiresIn: '1h' })

    res.status(200).json({
      token,
      userId: user._id,
    })
	} catch (error) {
		next(error)
	}
}

