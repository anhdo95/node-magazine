const exception = require('../exception')
const User = require('../models/user')

module.exports.updateUserStatus = async (req, res, next) => {
  try {
    const userToUpdate = await User.findById(req.userId)

    userToUpdate.status = req.body.status
    userToUpdate.save()

    res.status(200).json({
      message: `User's status updated successfully`,
    })
  } catch (error) {
    next(error)
  }
}

module.exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('status -_id')

    if (!user) {
			throw exception.notFound('Could not found user.')
    }

    res.status(200).json({
      message: `User's status updated successfully`,
      status: user.status
    })
  } catch (error) {
    next(error)
  }
}
