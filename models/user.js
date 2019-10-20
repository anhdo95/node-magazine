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

module.exports = model('User', userSchema)
