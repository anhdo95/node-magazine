const fs = require("fs");
const path = require("path");
const PDFDoc = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");
const { STRIPE_PK_API_KEY, STRIPE_SK_API_KEY } = require("../secret/config");
const { ITEMS_PER_PAGE } = require("../util/constant");

const stripe = require('stripe')(STRIPE_SK_API_KEY)

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      console.log(products);
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  const { page = 1 } = req.query;
  const currentPage = Number(page);

  let totalProducts;

  return Product.find()
    .countDocuments()
    .then(totalItems => {
      totalProducts = totalItems;
      return Product.find()
        .skip((currentPage - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

      const options = {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        pagination: {
          currentPage,
          totalProducts,
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
          nextPage: currentPage + 1,
          previousPage: currentPage - 1,
          lastPage: totalPages
        }
      };

      return res.render("shop/index", options);
    })
    .catch(console.log);
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      res.redirect("/cart");
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.getCheckout = async (req, res, next) => {
  try {
    const user =  await req.user.populate("cart.items.productId").execPopulate()
    const products = user.cart.items;
    const totalSum = products.reduce((sum, item) => {
      return (sum += (item.quantity * item.productId.price));
    }, 0);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: products.map(p => {
        return {
          name: p.productId.title,
          description: p.productId.description,
          amount: p.productId.price * 100,
          currency: 'usd',
          quantity: p.quantity
        };
      }),
      success_url: 'http://localhost:3000/checkout/success',
      cancel_url: 'http://localhost:3000/checkout/cancel'
    })

    res.render("shop/checkout", {
      path: "/checkout",
      pageTitle: "Checkout",
      products,
      totalSum,
      sessionId: session.id,
      stripeApiKey: STRIPE_PK_API_KEY,
    });

  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  const { stripeToken } = req.body;
  let totalSum = 0

  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        totalSum += (i.quantity * i.productId.price)

        return {
          quantity: i.quantity, product: { ...i.productId._doc }
        };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      stripe.charges.create({
        amount: totalSum * 100,
        currency: 'usd',
        description: `Order Charge - ${new Date().toISOString()}`,
        source: stripeToken,
        metadata: {
          orderId: result._id.toString()
        }
      })

      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then(orders => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.getInvoice = (req, res, next) => {
  const { orderId } = req.params;

  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error("No order found!"));
      }

      console.log("order.user.userId.toString()", order.user.userId.toString());
      console.log("req.user._id.toString()", req.user._id.toString());

      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized!"));
      }

      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDoc();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline`);

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(24).text("Your invoice");
      pdfDoc.text("-------------------");

      let totalPrice = 0;
      order.products.forEach(item => {
        totalPrice += item.quantity * item.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            `${item.product.title} - ${item.quantity} x $${item.product.price}`
          );
      });

      pdfDoc.text("----");
      pdfDoc.fontSize(16).text(`Total price: ${totalPrice}`);
      pdfDoc.end();
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};
