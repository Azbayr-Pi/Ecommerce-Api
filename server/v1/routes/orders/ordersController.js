const Order = require('../../config/ordersSchema');
const Product = require('../../config/productsSchema');
const { addUserOrders, processNewItems, deleteUserOrder } = require('../Auth/Middlewares');

const showOrders = async (req, res) => {
    const userId = req.user._id.toString();
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized you can\'t see other\'s orders' });
    }
    const orders = await Order.find({ customer: userId }, {__v: 0}).populate('items.product');
    if (!orders) {
        res.status(404).json({ message: 'No orders found!' });
    }
    res.status(200).json({ orders });
}

const makeOrder = async (req, res) => {
    const { items, address } = req.body;
    const processedItems = await Promise.all(items.map(async (item) => {
        const product = await Product.findById(item.id);
        return {
            product: product._id,
            quantity: item.quantity,
            price: product.price,
        }
    }));
    const order = new Order({
        customer: req.user._id,
        items: processedItems,
        address,
    });
    try {
        await order.save();
        await addUserOrders(req.user._id, order._id);
        res.status(201).json({
            message: 'Order created successfully',
            order: {
                _id: order._id,
                items: order.items,
                address: order.address
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating order',
            error: error.message
        });
    }    
};

// make the below variable 3 days in milliseconds
const UPDATE_TIME_LIMIT = 60 * 60 * 24 * 3 * 1000;

const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) {     
            res.status(404).json({ message: 'Order not found!' });
        }
        const currentTime = new Date();
        const timeSinceOrder = currentTime - order.createdAt;
        if (timeSinceOrder > UPDATE_TIME_LIMIT) {
            res.status(403).json({ 
                message: 'Order can\'t be updated after 30 minutes!' 
            });
        } else {
            if (req.body.address) {
                order.address = { ...order.address.toObject(), ...req.body.address };
            }
            if (req.body.items) {
                const updatedItems = await Promise.all(req.body.items.map( async (newItem) => {
                    const existingItemIndex = order.items.findIndex(item => newItem.id === item.product.toString());
                    if (existingItemIndex !== -1) {
                        order.items[existingItemIndex] = { ...order.items[existingItemIndex].toObject(), ...newItem };
                    } else {
                       const newItemObject = await processNewItems(newItem);
                       order.items.push(newItemObject);
                    }
                }));
            }
            await order.save();
            res.status(200).json({  
                message: 'Order updated successfully',
                order: {
                    _id: order._id,
                    items: order.items,
                    address: order.address
                }
            });        

        }
    } catch (error) {
        res.status(500).json({
            message: 'Error updating order',
            error: error.message
        });
    }
}

const deleteOrder = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { id } = req.params;
        await deleteUserOrder(userId, id);
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        if (error === 'Unauthorized to delete') {
            res.status(401).json({ message: error });
        } else if (error === 'Order not found') {
            res.status(404).json({ message: error });
        }
        else {
            res.status(500).json({
                message: 'Error deleting order',
                error: error.message
            });
        }
    }
};


module.exports = {
    showOrders,
    makeOrder,
    updateOrder,
    deleteOrder,
}
