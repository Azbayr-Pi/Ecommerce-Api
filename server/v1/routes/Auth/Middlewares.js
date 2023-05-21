const User = require('../../config/usersSchema');
const Order = require('../../config/ordersSchema');
const Product = require('../../config/productsSchema');
const Review = require('../../config/reviewsSchema');

// isAuthenticated function checks if a user logged in or not.
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized you have to be logged in first!' });
};

const findUserById = async (id) => {
    const user = await User.findById(id);
    if (!user) {
        res.status(404).json({ message: 'User not found!' });
    }
    return user;
}

const checkIfProductOwner = async (req, res, next) => {
    const user = await findUserById(req.user._id.toString());
    const index = user.products.findIndex(p => p._id.equals(req.params.id));
    console.log(index);
    if (index === -1) {
        res.status(401).json({ message: 'Unauthorized you are not the owner of this product!' });
    } else {
        next();
    }
}

// deleteUserProduct function removes productId off of products array of a user.
const deleteUserProduct = async (userId, productId) => {
    const user = await User.findById(userId).lean();
    if (!user) throw new Error('User not found!');
    const updatedProducts = user.products.filter(p => p.toString() !== productId);
    const updatedUser = await User.findByIdAndUpdate(userId, 
        { products: updatedProducts }, { new: true, runValidators: true }
    );
};   

//The below function adds orderId to orders array of a user.
const addUserOrders = async (userId, orderId) => {
    const user = await User.findById(userId).lean();
    if (!user) throw new Error('User not found!');
    user.orders.push(orderId);    
    await User.findByIdAndUpdate(userId, { orders: user.orders });
}

//The below function will check if a user is the owner of an order or not.
const isUser = async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id).lean();
    if (!order || !order.customer || order.customer.length === 0) {
        res.status(404).json({ message: 'Order not found!' });
        return;
    }

    if (order.customer[0]._id.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'Unauthorized you are not the owner of this order!' });
    }
    next();
};

//The below function will process new items of an order.
const processNewItems = async (newItem) => {
    const product = await Product.findById(newItem.id);
    if (!product) {
        if (!product) {
            throw new Error(`Product with ID ${newItem.id} not found.`);
        }
    }
    return {
        product: product._id,
        quantity: newItem.quantity,
        price: product.price,
    }
}

//The below function will delete an order of a user. 
const deleteUserOrder = async (userId, orderId) => {
    const order = await Order.findById(orderId);
    const user = await User.findById(userId);
    if (!order) throw new Error('Order not found!');
    if (order.customer[0]._id.toString() === userId) {
        const orders = user.orders.filter(order => order._id.toString() !== orderId);
        user.orders = orders;
        await user.save();
        await order.deleteOne();
    } else {
        throw new Error('Unauthorized to delete');
    }
};

//The below function will check if a user is the owner of a product or not.
const checkSeller = async (productId, userId) => {
    const product = await checkProductId(productId);
    if (product) {
        if (product.seller[0]._id.toString() !== userId) {
            return product;
        } else {
            throw new Error('You cannnot give a review to your own product.'); 
        }
    } else {    
        throw new Error('Product not found!');
    }
};

//The below function will check if a rating is valid or not.
const checkRating = (rating, comment) => {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new Error('Invalid rating value. Rating must be a number between 1 and 5.');
    } else if (!comment) {
        throw new Error('Comment is required.');
    } 
    return;
};

const isReviewer = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const user = req.user._id.toString();
        const review = await Review.findById(reviewId);
        if (review) {
            if (review.userId._id.toString() === user) {
                next();
            } else {
                res.status(401).json(
                    {
                        message: 'Unauthorized you are not the owner of this review!' 
                    }
                );
            }
        } else {
            res.status(404).json({
                message: 'Review not found!'
            });
        }
    } catch (err) {
        res.status(500).json(
            { message: err.message }
        );
    }
}

// the below function will check if a product exists or not.
const checkProductId = async (productId) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Product not found!');
    }
    return product;
}

// the below function will check if a review exists or not.
const checkReviewId = (product, reviewId) => {
    const review = product.reviews.map(review => review._id.toString()).includes(reviewId);
    if (review === -1) {
        // throw new Error('Review not found!');   
        return false;
    }
    return true;
}

module.exports = {
    isAuthenticated,
    checkIfProductOwner,
    deleteUserProduct,
    addUserOrders,
    isUser,
    processNewItems,
    deleteUserOrder,
    checkSeller,
    checkRating,
    isReviewer,
    checkReviewId,
    checkProductId,
}