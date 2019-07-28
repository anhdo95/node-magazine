const Product = require('../models/product')

exports.getProducts = (req, res) => {
  Product.fetchAll(products => {
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

  const product = new Product(null, title, imageUrl, description, price)
  product.save()
    .then(() => res.redirect('/'))
    .catch(console.error)
}

exports.getEditProduct = (req, res) => {
  const editMode = req.query.edit

  if (!editMode) {
    return res.redirect('/404')
  }

  const { productId } = req.params

  Product.findById(productId, product => {
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

  const updatedProduct = new Product(productId, title, imageUrl, description, price)
  updatedProduct.save()

  res.redirect('/admin/products')
}

exports.postDeleteProduct = (req, res) => {
  const { productId } = req.body

  Product.deleteById(productId)

  res.redirect('/admin/products')
}
