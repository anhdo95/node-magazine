module.exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [{
      title: 'The first post',
      content: 'This first content post'
    }]
  })
}

module.exports.createPost = (req, res, next) => {
  const { title, content } = req.body;

  console.log('req.body', req.body)

  res.status(201).json({
    posts: [{
      id: new Date().toISOString(),
      title,
      content
    }]
  })
}