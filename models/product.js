const { Schema, Types, model } = require('mongoose');

const productSchema = new Schema({
  title: {
    type: String,
    required:true
  },
  price: {
    type: Number,
    required:true
  },
  description: {
    type: String,
    required:true
  },
  imageUrl: {
    type: String,
    required:true
  },
  userId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = model('Product', productSchema)
