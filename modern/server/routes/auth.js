const express = require('express')
const { body } = require('express-validator')

const User = require('../models/user')
const authController = require('../controllers/auth')

const router = express.Router()

router.post(
	'/signup',
	[
		body('email')
			.isEmail()
			.withMessage('Please enter a valid email.')
			.custom(async (email, { req }) => {
				try {
					const user = await User.findOne({ email })

					if (user) {
						return Promise.reject('Email address already exists.')
					}
				} catch (error) {
					console.log(error)
					Promise.reject('Please enter a valid email.')
				}
			})
			.normalizeEmail(),
		body('password')
			.trim()
			.isLength({ min: 5 })
			.withMessage('Password at least must be 5 characters.'),
		body('name')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Name is required'),
	],
	authController.signup
)

router.post(
	'/login',
	[
		body('email')
			.isEmail()
			.withMessage('Please enter a valid email.')
			.normalizeEmail(),
		body('password')
			.trim()
			.isLength({ min: 5 })
			.withMessage('Password at least must be 5 characters.')
	],
	authController.login
)

module.exports = router
