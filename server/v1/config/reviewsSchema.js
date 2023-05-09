const mongoose = require('mongoose');

const conn = "mongodb://127.0.0.1:27017/Ecommerce-Api";

const { Schema } = mongoose;

const reviewSchema = new mongoose.Schema({
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
});
  
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
  
