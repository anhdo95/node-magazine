const { Schema, Types, model } = require('mongoose');

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

module.exports = model('User', userSchema)
