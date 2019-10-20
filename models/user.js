const { ObjectID } = require('mongodb')

const { getDb } = require('../util/database')
const Product = require('../models/product')

const getCartItemIndex = (cartItems, productId) => {
  return cartItems.findIndex(cartItem => cartItem.productId.equals(productId))
}

class User {
  constructor(username, email, cart, id) {
    this.name = username
    this.email = email
    this.cart = cart
    this._id = id && new ObjectID(id)
  }

  async save() {
    try {
      const db = getDb()
      const collection = db.collection('users')

      if (this._id) {
        return await collection.updateOne({ _id: this._id }, { $set: this });
      }

      return await collection.insertOne(this)
    } catch (error) {
      console.error(error);
    }
  }

  async addToCart(product) {
    try {
      const updatedCart = {
        items: this.cart ? [ ...this.cart.items ] : []
      }

      const cartProductIndex = getCartItemIndex(updatedCart.items, product._id)

      if (~cartProductIndex) {
        updatedCart.items[cartProductIndex].quantity++
      } else {
        updatedCart.items.push({
          productId: product._id,
          quantity: 1
        })
      }

      const db = getDb()

      return db.collection('users').updateOne({ _id: this._id }, { $set: { cart: updatedCart } })
    } catch (error) {
      console.error(error);
    }
  }

  async getCart() {
    try {
      const products = await Product.findByIds(this.cart.items.map(item => item.productId))

      return products.map(product => {
        const cartItemIndex = getCartItemIndex(this.cart.items, product._id)
        const quantity = this.cart.items[cartItemIndex].quantity

        return { ...product, quantity }
      })
    } catch (error) {
      console.error(error)
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