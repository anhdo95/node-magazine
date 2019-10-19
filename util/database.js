const { MongoClient } = require('mongodb')

let _db

const mongoConnect = (cb) => {
  const uri = 'mongodb+srv://admin:admin@node-complete-1dj8a.mongodb.net/shop?retryWrites=true&w=majority'
  const client = new MongoClient(uri, { useUnifiedTopology: true })

  client.connect(err => {
    if (err) {
      throw err
    }

    console.log('Connected!');
    _db = client.db()
  })

  cb()
}

const getDb = () => {
  if (_db) return _db
  throw 'No database found!'
}

module.exports.mongoConnect = mongoConnect
module.exports.getDb = getDb

