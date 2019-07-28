const Product = require('../models/product')
const Cart = require('../models/cart')

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(([ products ]) => {
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
    .then(([ products ]) => {
      if (!products || (Array.isArray(products) && !products.length)) {
        return res.redirect('/404')
      }

      res.render('shop/product-detail', {
        pageTitle: products[0].title,
        path: '/products',
        product: products[0],
      })
    })
    .catch(console.error)
}

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then(([ products ]) => {
      res.render('shop/index', {
        pageTitle: 'Shop',
        path: '/',
        prods: products,
      })
    })
    .catch(console.error)
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