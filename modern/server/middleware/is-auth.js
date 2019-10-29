const jwt = require('jsonwebtoken')

const exception = require('../exception')
const { SECRET_JWT_KEY } = require('../secret/config')

module.exports = (req, res, next) => {
  try {
    const authHeader = req.get('Authorization')

    if (!authHeader) {
      throw exception.unauthenticated()
    }

    const [bearer, token] = authHeader.split(' ')

    const decodedToken = jwt.verify(token, SECRET_JWT_KEY)

    if (!decodedToken) {
      throw exception.unauthenticated()
    }

    req.userId = decodedToken.userId

    next()
  } catch (error) {
    next(error)
  }
}
