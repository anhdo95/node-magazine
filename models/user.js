const { Schema, Types, model } = require('mongoose');
const Order = require('./order')

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cart: {
    items: [
      {
        productId: {
          type: Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ],
  }
});

userSchema.methods.addToCart = function(product) {
  try {
    const updatedCart = {
      items: this.cart ? [ ...this.cart.items ] : []
    }

    const cartProductIndex = updatedCart.items.findIndex(cartItem => cartItem.productId.equals(product._id))

    if (~cartProductIndex) {
      updatedCart.items[cartProductIndex].quantity++
    } else {
      updatedCart.items.push({
        productId: product._id,
        quantity: 1
      })
    }

    this.cart = updatedCart
    this.save()
  } catch (error) {
    console.error(error);
  }
}

userSchema.methods.removeFromCart = function(productId) {
  this.cart.items = this.cart.items.filter(item => !item.productId.equals(productId))
  return this.save()
}

userSchema.methods.emptyCart = function() {
  this.cart.items = []
  return this.save()
}

userSchema.methods.addOrder = async function() {
  const user = await this.populate('cart.items.productId').execPopulate()

  const orderProps = {
    user: {
      userId: this,
      name: this.name
    },
    products: user.cart.items.map(item => {
      return {
        quantity: item.quantity,
        product: { ...item.productId }
      }
    })
  }

  const order = new Order(orderProps)

  if (order.save()) {
    return this.emptyCart()
  }
}

userSchema.methods.getOrders = function() {
  return Order.find({ 'user.userId': this._id })
}

module.exports = model('User', userSchema)
