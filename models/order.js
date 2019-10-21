const { Schema, Types, model } = require('mongoose');

const orderSchema = new Schema({
  user: {
      userId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      }
  },
  products: [
    {
      product: {
        type: Object,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
});

module.exports = model('Order', orderSchema)
