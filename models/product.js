const fs = require('fs')
const path = require('path')

const Cart = require('./cart')

const { rootDir } = require('../util/path')

const PRODUCTS_FILE_NAME = 'products.json'
const PRODUCTS_FILE_PATH = path.join(rootDir, 'data', PRODUCTS_FILE_NAME)

const getProductsFromFile = (cb) => {
  fs.readFile(PRODUCTS_FILE_PATH, (err, fileContent) => {
    cb(err ? [] : JSON.parse(fileContent))
  })
}

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id
    this.title = title
    this.imageUrl = imageUrl
    this.description = description
    this.price = price
  }

  save() {
    getProductsFromFile(products => {
      if (this.id) {
        const existingProductIndex = products.findIndex(p => p.id === this.id)
        products[existingProductIndex] = this
      } else {
        this.id = Math.random().toString()
        products.push(this)
      }

      fs.writeFile(PRODUCTS_FILE_PATH, JSON.stringify(products), (err) => {
        console.log(err);
      })
    })
  }

  static fetchAll(cb) {
    getProductsFromFile(cb)
  }

  static findById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(p => p.id === id)

      cb(product)
    })
  }

  static deleteById(id) {
    getProductsFromFile(products => {
      const updatedProducts = products.filter(p => p.id !== id)

      fs.writeFile(PRODUCTS_FILE_PATH, JSON.stringify(updatedProducts), (err) => {
        if (!err) {
          // remove the item from the cart
          const productToDelete = products.find(p => p.id === id)

          Cart.deleteProduct(id, productToDelete.price)
        }
      })
    })
  }
}