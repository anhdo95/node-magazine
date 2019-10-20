const Product = require('../models/product')
// const Order = require('../models/order')

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('shop/product-list', {
        pageTitle: 'All Products',
        path: '/products',
        prods: products,
      })
    })
    .catch(console.error)
}

exports.getProduct = (req, res, next) => {
  const { productId } = req.params

  Product.findById(productId)
    .then(product => {
      if (!product) {
        return res.redirect('/404')
      }

      res.render('shop/product-detail', {
        pageTitle: product.title,
        path: '/products',
        product: product,
      })
    })
    .catch(console.error)
}

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('shop/index', {
        pageTitle: 'Shop',
        path: '/',
        prods: products,
      })
    })
    .catch(console.error)
}

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then(products => {
      res.render('shop/cart', {
          pageTitle: 'Your Cart',
          path: '/cart',
          products: products || [],
        })
    })
    .catch(console.error)
}

exports.postCart = (req, res, next) => {
  const { productId } = req.body

  Product.findById(productId)
    .then(product => req.user.addToCart(product))
    .then(() => res.redirect('/cart'))
    .catch(console.error)
}

exports.postCartDeleteItem = (req, res, next) => {
  const { productId } = req.body

  req.user
    .deleteItemFromCart(productId)
    .then(() => res.redirect('/cart'))
    .catch(console.error)
}

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then(orders => {
      res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders',
        orders
      })
  })
}

exports.postOrder = (req, res, next) => {
  req.user
    .addOrder()
    .then(() => res.redirect("/orders"))
    .catch(console.error);
}
