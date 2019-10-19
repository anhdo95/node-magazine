const { ObjectID } = require('mongodb')
const { getDb } = require('../util/database')

class Product {
  constructor(title, price, description, imageUrl, id) {
    this.title = title
    this.price = price
    this.description = description
    this.imageUrl = imageUrl
    this.id = id && new ObjectID(id)
  }

  async save() {
    try {
      const db = getDb()
      const collection = db.collection('products')

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

  static async deleteById(productId) {
    try {
      const db = getDb()

      return await db.collection('products').deleteOne({ _id: new ObjectID(productId) })
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Product