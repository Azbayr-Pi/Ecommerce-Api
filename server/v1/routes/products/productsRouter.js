const express = require('express');
const path = require('path');
const { showAllProducts, 
    addProduct, 
    showProductById,    
    updateProduct, 
    deleteProduct,
} = require('./productsController');
const productRouter = express.Router();
const { isAuthenticated } = require('../Auth/Middlewares');


productRouter.get('/', showAllProducts); 
productRouter.get('/:id', showProductById);
productRouter.post('/addProduct', isAuthenticated, addProduct);
productRouter.put('/:id/edit', isAuthenticated, updateProduct);
productRouter.delete('/:id/delete', isAuthenticated, deleteProduct);



module.exports = productRouter;

