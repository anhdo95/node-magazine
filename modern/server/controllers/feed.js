const { validationResult } = require('express-validator')

const Post = require('../models/feed')

module.exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [{
      _id: new Date().toISOString(),
      title: 'The first post',
      content: 'This first content post',
      creator: {
        name: 'Richard Do'
      },
      createdAt: new Date()
    }]
  })
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
