const fs = require('fs')
const path = require('path')

const { rootDir } = require('../util/path')

const CART_FILE_NAME = 'cart.json'
const CART_FILE_PATH = path.join(rootDir, 'data', CART_FILE_NAME)

module.exports = class Cart {
  static getCart(cb) {
    fs.readFile(CART_FILE_PATH, (err, fileContent) => {
      if (err) {
        cb(null)
      } else {
        cb(JSON.parse(fileContent))
      }
    })
  }

  static addProduct(id, productPrice) {
    // Fetch the previous cart
    fs.readFile(CART_FILE_PATH, (err, fileContent) => {
      let cart = {
        products: [],
        totalPrice: 0,
      }

      if (!err) {
        cart = JSON.parse(fileContent)
      }
      // Analyze the cart
      const existingProductIndex = cart.products.findIndex(p => p.id === id)
      const existingProduct = cart.products[existingProductIndex]

      // Add new product / increase quantity
      if (existingProduct) {
        cart.products[existingProductIndex].qty++
      } else {
        cart.products.push({
          id,
          qty: 1,
        })
      }

      cart.totalPrice += (+productPrice)

      fs.writeFile(CART_FILE_PATH, JSON.stringify(cart), err => {
        if (err) {
          console.error("addProduct", err)
        }
      })
    })
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(CART_FILE_PATH, (err, fileContent) => {
      if (err) return

      const cart = JSON.parse(fileContent)
      const productToDelete = cart.products.find(p => p.id === id)

      cart.totalPrice -= (productToDelete.qty * productPrice)

      cart.products = cart.products.filter(p => p.id !== id)

      fs.writeFile(CART_FILE_PATH, JSON.stringify(cart), err => {
        if (err) {
          console.error("deleteProduct", err)
        }
      })
    })
  }
}