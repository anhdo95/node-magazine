const { connect } = require('mongoose')

let _db

const mongooseConnect = (cb) => {
  const uri = 'mongodb+srv://admin:admin@node-complete-1dj8a.mongodb.net/shop?retryWrites=true&w=majority'
  const options = { useNewUrlParser: true, useUnifiedTopology: true }

  connect(uri, options)
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

