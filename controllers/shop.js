const Product = require('../models/product')
const Cart = require('../models/cart')

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/product-list', {
      pageTitle: 'All Products',
      path: '/products',
      prods: products,
    })
  })
}

exports.getProduct = (req, res, next) => {
  const { productId } = req.params

  Product.findById(productId, product => {
    if (!product) {
      return res.redirect('/404')
    }

    res.render('shop/product-detail', {
      pageTitle: product.title,
      path: '/products',
      product,
    })
  })
}

exports.getIndex = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/index', {
      pageTitle: 'Shop',
      path: '/',
      prods: products,
    })
  })
}

exports.getCart = (req, res, next) => {
  Cart.getCart(cart => {
    Product.fetchAll(products => {
      const cartProducts = []

      for (const product of products) {
        const cartProduct = cart.products.find(p => p.id === product.id)

        if (cartProduct) {
          cartProducts.push({
            product,
            qty: cartProduct.qty
          })
        }
      }

      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        products: cartProducts,
        cartTotalPrice: cart.totalPrice,
      })
    })
  })
}

exports.postCart = (req, res, next) => {
  const { productId } = req.body

  Product.findById(productId, product => {
    Cart.addProduct(productId, product.price)
  })

  res.redirect('/cart')
}

exports.postCartDeleteItem = (req, res, next) => {
  const { productId } = req.body

  Product.findById(productId, product => {
    Cart.deleteProduct(productId, product.price)

    res.redirect('/cart')
  })
}

exports.getOrders = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/orders', {
      pageTitle: 'Your Orders',
      path: '/orders',
    })
  })
}

exports.getCheckout = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/checkout', {
      pageTitle: 'Checkout',
      path: '/checkout',
    })
  })
}