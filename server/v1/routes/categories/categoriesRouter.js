const express = require('express');
const categoriesRouter = express.Router();
const Product = require('../../config/productsSchema');


categoriesRouter.get('/', async (req, res) => {
    const categories = [
        'Electronics',
        'Clothing & Accessories',
        'Home & Garden',
        'Health & Beauty',
        'Sports & Outdoor',
        'Toys & Games',
        'Books & Media',
        'Food & Grocery',
    ];

    if (req.query.category) {
        const category = req.query.category.replace('&', '&');
        const products = await Product.find({ 
            category: {
                $regex: new RegExp(category, 'i'),
            } 
        });
        if (products.length === 0) {
            res.status(404).json({
                status: 'fail',
                message: 'No products found',
            });
        } else {
            res.status(200).json({
                status: 'success',
                data: {
                    products,
                }
            });
        }
    } else {
        res.status(200).json({
            status: 'success',
            data: {
                categories,
            }
        });
    }
});


module.exports = categoriesRouter;





