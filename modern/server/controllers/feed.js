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

module.exports.createPost = (req, res, next) => {
  const { title, content } = req.body;

  res.status(201).json({
    post: {
      _id: new Date().toISOString(),
      title,
      content,
      creator: {
        name: 'Richard Do'
      },
      createdAt: new Date()
    }
  })
}