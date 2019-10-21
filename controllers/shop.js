const Product = require('../models/product')

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        pageTitle: 'All Products',
        path: '/products',
        prods: products,
        isAuthenticated: req.session.isLoggedIn
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
        isAuthenticated: req.session.isLoggedIn
      })
    })
    .catch(console.error)
}

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        pageTitle: 'Shop',
        path: '/',
        prods: products,
        isAuthenticated: req.session.isLoggedIn
      })
    })
    .catch(console.error)
}

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;

      res.render('shop/cart', {
          pageTitle: 'Your Cart',
          path: '/cart',
          products: products || [],
          isAuthenticated: req.session.isLoggedIn
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
    .removeFromCart(productId)
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
        orders,
        isAuthenticated: req.session.isLoggedIn
      })
  })
}

exports.postOrder = (req, res, next) => {
  req.user
    .addOrder()
    .then(() => res.redirect("/orders"))
    .catch(console.error);
}
