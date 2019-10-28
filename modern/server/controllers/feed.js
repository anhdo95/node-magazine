const { validationResult } = require('express-validator')

const Post = require('../models/feed')

module.exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()

    res.status(200).json({
      message: 'Fetched posts successfully',
      posts
    })
  } catch (error) {
    next(error)
  }
}

module.exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId)

    if (!post) {
      const error = new Error('Could not find post.')
      error.statusCode = 404

      throw error
    }

    res.status(200).json({
      message: 'Fetched post successfully',
      post
    })
  } catch (error) {
    next(error)
  }
}

module.exports.createPost = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.')
    error.statusCode = 422
    error.errors = errors.array()

    return next(error)
  }

  const { title, content } = req.body;

  try {
    const createdPost = await new Post({
      title,
      content,
      imageUrl: 'images/feed.jpg',
      creator: {
        name: 'Richard Do',
      },
    }).save()

    res.status(201).json({
      message: 'Post created successfully!',
      post: createdPost
    })
  } catch (error) {
    next(error)
  }
}
