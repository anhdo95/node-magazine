const Product = require('../models/product')

exports.getProducts = (req, res) => {
  Product.findAll().then(products => {
    res.render('admin/products', {
      pageTitle: 'Admin Products',
      path: '/admin/products',
      prods: products
    })
  })
}

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  })
}

exports.postAddProduct = (req, res) => {
  const { title, imageUrl, description, price } = req.body

  Product.create({
    title,
    imageUrl,
    description,
    price
  })
  .then(() => res.redirect('/'))
  .catch(console.error)
}

exports.getEditProduct = (req, res) => {
  const editMode = req.query.edit

  if (!editMode) {
    return res.redirect('/404')
  }

  const { productId } = req.params

  Product.findByPk(productId)
    .then(product => {
      if (!product) {
        return res.redirect('/404')
      }

      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product,
      })
    })
}

exports.postEditProduct = (req, res) => {
  const { productId, title, imageUrl, description, price } = req.body

  Product.findByPk(productId)
    .then(product => {
      product.title = title
      product.imageUrl = imageUrl
      product.description = description
      product.price = price

      return product.save()
    })
    .then(() => {
      res.redirect('/admin/products')
    })
    .catch(console.error)
}

exports.postDeleteProduct = (req, res) => {
  const { productId } = req.body

  Product
    .findByPk(productId)
    .then(product => product.destroy())
    .then(() => {
      res.redirect('/admin/products')
    })
    .catch(console.error)
}
