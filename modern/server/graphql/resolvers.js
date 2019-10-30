const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const { SECRET_JWT_KEY } = require('../secret/config')
const { ITEMS_PER_PAGE } = require('../util/constants')
const fileHelper = require('../util/file')
const exception = require('../exception')
const User = require('../models/user')
const Post = require('../models/feed')

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
	login: async ({ email, password }, req) => {
		const user = await User.findOne({ email })

		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw exception.notFound('User could not be found!')
		}

		const token = jwt.sign(
			{
				email,
				userId: user._id,
			},
			SECRET_JWT_KEY,
			{ expiresIn: '1h' }
		)

		req.userId = user._id

		return {
			token,
			userId: user._id,
		}
	},

	createUser: async ({ userInput }, req) => {
		const errors = getUserValidationErrors(userInput)

		if (errors.length) {
			throw exception.invalidInput('Input invalid', errors)
		}

		const existingUser = await User.findOne({ email: userInput.email })

		if (existingUser) {
			throw exception.invalidInput('User exists already!')
		}

		const hashedPassword = await bcrypt.hash(userInput.password, 12)

		const createdUser = await User({
			email: userInput.email,
			name: userInput.name,
			password: hashedPassword,
		}).save()

		return createdUser
	},

	createPost: async ({ postInput }, req) => {
		if (!req.isAuth) {
			throw exception.unauthenticated('Not authenticated.')
		}

		// TODO: Validate inputs
		const { title, content, imageUrl } = postInput

		// if (!req.file) {
		// 	throw exception.invalidInput('No image provided')
		// }

		const createdPost = await new Post({
			title,
			content,
			// imageUrl: req.file.path.replace('\\', '/'),
			imageUrl,
			creator: req.userId,
		}).save()

		const creator = await User.findById(req.userId)

		if (!creator) {
			throw exception.unauthenticated('Not authenticated.')
		}

		creator.posts.push(createdPost)
		creator.save()

		return {
			...createdPost._doc,
			createdAt: createdPost.createdAt.toISOString(),
			updatedAt: createdPost.updatedAt.toISOString(),
			creator,
		}
	},

	posts: async ({ queryInput }, req) => {
		if (!req.isAuth) {
			throw exception.unauthenticated('Not authenticated.')
		}

		const totalItems = await Post.find().countDocuments()

		const { page = 1, itemsPerPage = ITEMS_PER_PAGE } = queryInput
		const pagedPosts = await Post.find()
			.populate('creator')
			.sort({ createdAt: -1 })
			.skip((page - 1) * itemsPerPage)
			.limit(itemsPerPage)

		return {
			items: pagedPosts.map((post) => ({
				...post._doc,
				createdAt: post.createdAt.toISOString(),
				updatedAt: post.updatedAt.toISOString(),
			})),
			totalItems,
		}
	},

	post: async ({ id }, req) => {
		if (!req.isAuth) {
			throw exception.unauthenticated('Not authenticated.')
		}

		const post = await Post.findById(id).populate('creator')

		if (!post) {
			throw exception.notFound('Could not find post.')
		}

		return {
			...post._doc,
			createdAt: post.createdAt.toISOString(),
			updatedAt: post.updatedAt.toISOString(),
		}
  },

  posts: async ({ queryInput }, req) => {
		if (!req.isAuth) {
			throw exception.unauthenticated('Not authenticated.')
		}

		const totalItems = await Post.find().countDocuments()

		const { page = 1, itemsPerPage = ITEMS_PER_PAGE } = queryInput
		const pagedPosts = await Post.find()
			.populate('creator')
			.sort({ createdAt: -1 })
			.skip((page - 1) * itemsPerPage)
			.limit(itemsPerPage)

		return {
			items: pagedPosts.map((post) => ({
				...post._doc,
				createdAt: post.createdAt.toISOString(),
				updatedAt: post.updatedAt.toISOString(),
			})),
			totalItems,
		}
	},

	updatePost: async ({ id, postInput }, req) => {
		if (!req.isAuth) {
			throw exception.unauthenticated('Not authenticated.')
    }

		const postToUpdate = await Post.findById(id).populate('creator')

		if (!postToUpdate) {
			throw exception.notFound('Could not found post.')
    }

		if (!postToUpdate.creator._id.equals(req.userId)) {
			throw exception.unauthorized()
    }

		if (postToUpdate.imageUrl !== postInput.imageUrl) {
			fileHelper.deleteFile(fileHelper.resolve(postToUpdate.imageUrl))
		}

		postToUpdate.title = postInput.title
		postToUpdate.content = postInput.content
		postToUpdate.imageUrl = postInput.imageUrl

    await postToUpdate.save()

		return {
			...postToUpdate._doc,
			createdAt: postToUpdate.createdAt.toISOString(),
			updatedAt: postToUpdate.updatedAt.toISOString(),
		}
	},
}
