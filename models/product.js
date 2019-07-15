const fs = require('fs')
const path = require('path')

const { rootDir } = require('../util/path')

const PRODUCTS_FILE_NAME = 'products.json'
const PRODUCTS_FILE_PATH = path.join(rootDir, 'data', PRODUCTS_FILE_NAME)

const getProductsFromFile = (cb) => {
  fs.readFile(PRODUCTS_FILE_PATH, (err, fileContent) => {
    cb(err ? [] : JSON.parse(fileContent))
  })
}


module.exports = class Product {
  constructor(title) {
    this.title = title
  }

  save() {
    getProductsFromFile(products => {
      products.push(this)

      fs.writeFile(PRODUCTS_FILE_PATH, JSON.stringify(products), (err) => {
        console.log(err);
      })
    })
  }

  static fetchAll(cb) {
    getProductsFromFile(cb)
  }
}