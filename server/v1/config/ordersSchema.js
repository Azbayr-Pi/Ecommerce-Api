const mongoose = require('mongoose');
const cron = require('node-cron');

const { Schema } = mongoose;

const conn = "mongodb://127.0.0.1:27017/Ecommerce-Api";

const orderItemSchema = new Schema({
    product: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, { _id: false });

const addressSchema = new Schema({
    street: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    hayg: {
        type: String,
        required: true,
    }
}, { _id: false });

const orderSchema = new Schema({
    customer: {
        required: true,
        type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    items: {
        required: true,
        type: [ orderItemSchema ],
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'canceled'],    
        default: 'pending',
    },
    address: {
        type: addressSchema,
    },
    createdAt: {         
        type: Date,
        default: Date.now,
    },
}, { 
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

cron.schedule('0 */3 * * *', async () => {
    try {
      const updatedOrders = await Order.updateMany(
        { status: 'pending' },
        { $set: { status: 'processing' } }
      );
      console.log(`Updated ${updatedOrders.nModified} orders.`);
    } catch (error) {
      console.error(`Error updating orders: ${error.message}`);
    }
});

orderSchema.virtual('totalPrice').get(function() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;