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
    .then(cart => cart && cart.getProducts())
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
  let fetchedCart,
      newQuantity = 1

  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart
      return cart && cart.getProducts({ where: { id: productId } })
    })
    .then(products => {
      let product
      if (products && products.length) {
        product = products[0]
      }

      if (product) {
        newQuantity = ++product.cartItem.quantity

        return product
      }

      return Product.findByPk(productId)
    })
    .then(product =>
      fetchedCart
        .addProduct(product, {
          through: { quantity: newQuantity }
        })
    )
    .then(() => res.redirect("/cart"))
    .catch(console.error)
}

exports.postCartDeleteItem = (req, res, next) => {
  const { productId } = req.body

  req.user
    .getCart()
    .then(cart => cart.getProducts({ where: { id: productId }}))
    .then(([ product ]) => product.cartItem.destroy())
    .then(() => res.redirect('/cart'))
    .catch(console.error)
}

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({ include: ['products'] })
    .then(orders => {
      res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders',
        orders
      })
  })
}

exports.postOrder = (req, res, next) => {
  let fetchedCart

  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart
      return cart.getProducts()
    })
    .then(products => {
      return req.user
        .createOrder()
        .then(order =>
          order.addProduct(
            products.map(product => {
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          )
        )
    })
    .then(() => fetchedCart.setProducts(null))
    .then(() => res.redirect("/orders"))
    .catch(console.error);
}
