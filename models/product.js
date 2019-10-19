const { ObjectID } = require('mongodb')
const { getDb } = require('../util/database')

class Product {
  constructor(title, price, description, imageUrl) {
    this.title = title
    this.price = price
    this.description = description
    this.imageUrl = imageUrl
  }

  async save() {
    try {
      const db = getDb()

      return await db.collection('products').insertOne(this)
    } catch (error) {
      console.error(error);
    }
  }

  static async fetchAll() {
    try {
      const db = getDb()

      return await db.collection('products').find({}).toArray()
    } catch (error) {
      console.error(error);
    }
  }

  static async findById(productId) {
    try {
      const db = getDb()

      return await db.collection('products').findOne({ _id: new ObjectID(productId) })
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Product