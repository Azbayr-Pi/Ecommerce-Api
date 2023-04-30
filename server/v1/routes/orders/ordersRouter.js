const express = require('express');

const orderRouter = express.Router();
const { showOrders, makeOrder, updateOrder, deleteOrder } = require('./ordersController');

const { isAuthenticated, isUser } = require('../Auth/Middlewares');

orderRouter.get('/', isAuthenticated, showOrders);
orderRouter.post('/makeOrder', isAuthenticated, makeOrder);
orderRouter.put('/updateOrder/:id', isAuthenticated, isUser, updateOrder);
orderRouter.delete('/deleteOrder/:id', isAuthenticated, isUser, deleteOrder);
module.exports = orderRouter;