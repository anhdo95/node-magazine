const Product = require('../models/product')

exports.getProducts = (req, res) => {
  Product.find()
    .then(products => {
      res.render('admin/products', {
        pageTitle: 'Admin Products',
        path: '/admin/products',
        prods: products,
        isAuthenticated: req.session.isLoggedIn
      })
  })
}

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    isAuthenticated: req.session.isLoggedIn
  })
}

exports.postAddProduct = (req, res) => {
  const { title, imageUrl, description, price } = req.body

  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId: req.user
  });

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

  Product.findById(productId)
    .then(product => {
      if (!product) {
        return res.redirect('/404')
      }

      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product,
        isAuthenticated: req.session.isLoggedIn
      })
    })
}

exports.postEditProduct = (req, res) => {
  const { productId, title, imageUrl, description, price } = req.body

  Product.findByIdAndUpdate(productId, { title, price, description, imageUrl })
    .then(() => res.redirect('/admin/products'))
    .catch(console.error)
}

exports.postDeleteProduct = (req, res) => {
  const { productId } = req.body

  Product.findByIdAndDelete(productId)
    .then(() => res.redirect('/admin/products'))
    .catch(console.error)
}
