const { connect } = require('mongoose')

const { MONGODB_URI } = require('./constant')

let _db

const mongooseConnect = (cb) => {
  const options = { useNewUrlParser: true, useUnifiedTopology: true }

  connect(MONGODB_URI, options)
    .then(() => {
      console.log('Connected!')
      cb()
    })
    .catch(console.error())
}

const getDb = () => {
  if (_db) return _db
  throw 'No database found!'
}

module.exports.mongooseConnect = mongooseConnect
module.exports.getDb = getDb

