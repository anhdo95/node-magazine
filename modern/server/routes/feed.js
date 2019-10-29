const express = require('express')
const { body } = require('express-validator')

const feedController = require('../controllers/feed')
const isAuth = require('../middleware/is-auth')

const router = express.Router()

router.get('/posts', isAuth, feedController.getPosts)

router.get('/post/:postId', isAuth, feedController.getPostById)

router.post(
	'/post',
	isAuth,
	[
		body('title')
			.trim()
			.isLength({ min: 5 })
			.withMessage('The title at least must be 5 characters.'),
		body('content')
			.trim()
			.isLength({ min: 5 })
			.withMessage('The content at least must be 5 characters.'),
	],
	feedController.createPost
)

router.put(
	'/post/:postId',
	isAuth,
	[
		body('title')
			.trim()
			.isLength({ min: 5 })
			.withMessage('The title at least must be 5 characters.'),
		body('content')
			.trim()
			.isLength({ min: 5 })
			.withMessage('The content at least must be 5 characters.'),
	],
	feedController.updatePost
)

router.delete('/post/:postId', isAuth, feedController.deletePost)

module.exports = router
