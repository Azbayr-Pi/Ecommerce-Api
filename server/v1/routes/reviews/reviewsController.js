const Review = require('../../config/reviewsSchema');
const Product = require('../../config/productsSchema');
const User = require('../../config/usersSchema');
const { checkSeller, checkRating, checkReviewId, checkProductId } = require('../Auth/Middlewares');

const getAllReviews = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id).populate('reviews');
        if (product) {
            res.status(200).json({ 
                message: "success", 
                data: product.reviews 
            });
        } else {
            res.status(404).json({ 
                message: "Product not found", 
                data: null 
            });
        }
    } catch (err) {
        res.status(500).json({ 
            message: err.message
        });       
    }
}

const createReview = async (req, res) => {
    const { id } = req.params;
    const user = req.user._id.toString();
    const { rating, comment } = req.body;
    try {
        checkRating(rating);
        const product = await checkSeller(id, user);
        if (product) {
            const newReview = new Review({
                rating,
                comment,
                productId: id,
                userId: user,
            });
            await newReview.save();
            product.reviews.push(newReview);
            await product.save();
            res.status(201).json({
                message: "success",
                data: {
                    review: newReview,
                }
            });
        } else {
            res.status(404).json({
                message: "Product not found",
                data: null
            });
        }
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
}

const editReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const { rating, comment } = req.body;
    console.log(req.body);
    try {
        const fieldsToUpdate = {};
        if (rating) fieldsToUpdate.rating = rating;
        if (comment) fieldsToUpdate.comment = comment;
        const product = await checkProductId(id);
        if (product) {
            const review = checkReviewId(product, reviewId);
            if (review) {
                const updatedReview = await Review.findByIdAndUpdate(reviewId, 
                fieldsToUpdate, 
                { new: true, runValidators: true });
                res.status(200).json({
                    message: "success",
                    data: { 
                        review: updatedReview 
                    }
                });
            }
        }
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
}

const deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const product = await checkProductId(id);
    try {
        if (product) {
            const updatedReviews = product.reviews.filter(review => review._id.toString() !== reviewId);
            product.reviews = updatedReviews;
            product.markModified('reviews');
            product.save();
            await Review.findByIdAndDelete(reviewId);
            
            res.status(200).json({
                message: 'Review deleted successfully',
            });
        }
    } catch (err) {
        res.status(400).json({
            message: err.message    
        });
    }
}

module.exports = {
    getAllReviews,
    createReview,
    editReview,
    deleteReview,
}