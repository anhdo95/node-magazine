const { ObjectID } = require('mongodb')
const { getDb } = require('../util/database')

class User {
  constructor(username, email, id) {
    this.name = username
    this.email = email
    this.id = id && new ObjectID(id)
  }

  async save() {
    try {
      const db = getDb()
      const collection = db.collection('users')

      if (this.id) {
        return await collection.updateOne({ _id: this.id }, { $set: this });
      }

      return await collection.insertOne(this)
    } catch (error) {
      console.error(error);
    }
  }

  static async fetchAll() {
    try {
      const db = getDb()

      return await db.collection('users').find({}).toArray()
    } catch (error) {
      console.error(error);
    }
  }

  static async findById(userId) {
    try {
      const db = getDb()

      return await db.collection('users').findOne({ _id: new ObjectID(userId) })
    } catch (error) {
      console.error(error);
    }
  }

  static async deleteById(userId) {
    try {
      const db = getDb()

      return await db.collection('users').deleteOne({ _id: new ObjectID(userId) })
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = User