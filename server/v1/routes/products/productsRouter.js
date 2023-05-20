const express = require('express');
const path = require('path');
const { showAllProducts, 
    addProduct, 
    showProductById,    
    updateProduct, 
    deleteProduct,
} = require('./productsController');
const productRouter = express.Router();
const { isAuthenticated, checkIfProductOwner } = require('../Auth/Middlewares');


productRouter.get('/', showAllProducts); 
productRouter.get('/:id', showProductById);
productRouter.post('/addProduct', isAuthenticated, addProduct);
productRouter.put('/:id/edit', isAuthenticated, checkIfProductOwner, updateProduct);
productRouter.delete('/:id/delete', isAuthenticated, checkIfProductOwner, deleteProduct);



module.exports = productRouter;

