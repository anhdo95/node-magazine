const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  try {
    const authHeader = req.get('Authorization')

    if (!authHeader) {
      req.isAuth = false
      return next()
    }

    const [bearer, token] = authHeader.split(' ')

    const decodedToken = jwt.verify(token, process.env.SECRET_JWT_KEY)

    if (!decodedToken) {
      req.isAuth = false
      return next()
    }

    req.userId = decodedToken.userId
    req.isAuth = true

    next()
  } catch (error) {
    req.isAuth = false
    next()
  }
}
