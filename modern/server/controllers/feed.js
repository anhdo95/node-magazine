const path = require('path')
const { validationResult } = require('express-validator')

const fileHelper = require('../util/file')
const exception = require('../exception')
const Post = require('../models/feed')

const validatePost = (req) => {
	const errors = validationResult(req)

	if (!errors.isEmpty()) {
		throw exception.invalidInput('Validation failed, entered data is incorrect.', errors.array())
	}
}

module.exports.getPosts = async (req, res, next) => {
	try {
		const posts = await Post.find()

		res.status(200).json({
			message: 'Fetched posts successfully',
			posts,
		})
	} catch (error) {
		next(error)
	}
}

module.exports.getPostById = async (req, res, next) => {
	try {
		const post = await Post.findById(req.params.postId)

		if (!post) {
			throw exception.notFound('Could not find post.')
		}

		res.status(200).json({
			message: 'Fetched post successfully',
			post,
		})
	} catch (error) {
		next(error)
	}
}

module.exports.createPost = async (req, res, next) => {
	try {
		validatePost(req)

		const { title, content } = req.body

		if (!req.file) {
			throw exception.invalidInput('No image provided')
		}

		const createdPost = await new Post({
			title,
			content,
			imageUrl: req.file.path.replace('\\', '/'),
			creator: {
				name: 'Richard Do',
			},
		}).save()

		res.status(201).json({
			message: 'Post created successfully!',
			post: createdPost,
		})
	} catch (error) {
		next(error)
	}
}

module.exports.updatePost = async (req, res, next) => {
	try {
		validatePost(req)

		let imageUrl = req.body.image
		if (req.file) {
			imageUrl = req.file.path.replace('\\', '/')
		}

		if (!imageUrl) {
			throw exception.invalidInput('No file picked.')
		}

		const postToUpdate = await Post.findById(req.params.postId)

		if (!postToUpdate) {
			throw exception.notFound('Could not found post.')
		}

		if (postToUpdate.imageUrl !== imageUrl) {
			fileHelper.deleteFile(fileHelper.resolve(postToUpdate.imageUrl))
		}

		postToUpdate.title = req.body.title
		postToUpdate.content = req.body.content
		postToUpdate.imageUrl = imageUrl

		postToUpdate.save()

		res.status(200).json({
			message: 'Updated post successfully',
			post: postToUpdate,
		})
	} catch (error) {
		next(error)
	}
}

module.exports.deletePost = async (req, res, next) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.postId)

    if (!deletedPost) {
      throw exception.notFound('Could not found post.')
    }

    fileHelper.deleteFile(fileHelper.resolve(deletedPost.imageUrl))

    res.status(200).json({
			message: 'Deleted post successfully',
			post: deletedPost,
		})
  } catch (error) {
    next(error)
  }
}
