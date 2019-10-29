const { Schema, model, Types } = require('mongoose')

const feedSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  creator: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  },
}, { timestamps: true })

module.exports = model('Post', feedSchema)
