const { ObjectID } = require('mongodb')
const { getDb } = require('../util/database')

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title
    this.price = price
    this.description = description
    this.imageUrl = imageUrl
    this._id = id && new ObjectID(id)
    this._userId = userId && new ObjectID(userId)
  }

  async save() {
    try {
      const db = getDb()
      const collection = db.collection('products')

      if (this._id) {
        return await collection.updateOne({ _id: this._id }, { $set: this });
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

  static async findByIds(productIds) {
    try {
      const db = getDb()

      return await db.collection('products').find({ _id: { $in: productIds } }).toArray()
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

      const r = await db.collection('products').deleteOne({ _id: new ObjectID(productId) })

      console.log('r :', r);

      return r
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Product