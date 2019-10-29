const express = require('express')
const { body } = require('express-validator')

const userController = require('../controllers/user')
const isAuth = require('../middleware/is-auth')

const router = express.Router()

router.get('/status', isAuth, userController.getUserStatus)

router.patch(
	'/status',
	body('status')
		.trim()
		.not()
		.isEmpty(),
	isAuth,
	userController.updateUserStatus
)

module.exports = router
