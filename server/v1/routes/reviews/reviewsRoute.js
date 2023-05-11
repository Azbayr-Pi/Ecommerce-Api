const express = require('express');
const reviewsRouter = express.Router({ mergeParams: true });
const { isAuthenticated } = require('../Auth/Middlewares');
const { getAllReviews, createReview, editReview, deleteReview } = require('./reviewsController');

reviewsRouter.get('/', getAllReviews);
reviewsRouter.post('/addReview', isAuthenticated, createReview);
reviewsRouter.put('/editReview/:id', isAuthenticated, editReview);
reviewsRouter.delete('/deleteReview/:id', isAuthenticated, deleteReview);

module.exports = reviewsRouter;