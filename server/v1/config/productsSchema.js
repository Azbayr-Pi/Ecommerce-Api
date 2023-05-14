const mongoose = require('mongoose');

const conn = "mongodb://127.0.0.1:27017/Ecommerce-Api";

mongoose.connect(conn)
    .then(() => {
        console.log('Connected to database');
    })
    .catch((err) => {
        console.log('Failed to connect to database', err);
    });
const { Schema } = mongoose;

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^\$?\d+(\.\d{1,2})?$/.test(v);
            },
            message: props => `${props.value} is not a valid price! Price must be a number.`,
        },
        set: function (v) {
            return `$${parseFloat(v).toFixed(2)}`;
        },
        get: function (v) {
            return parseFloat(v.replace('$','')).toFixed(2);
        }
    },
    category: {
        type: String,
        enum: ['Electronics', 'Clothing & Accessories', 
        'Home & Garden', 'Health & Beauty', 'Sports & Outdoor', 'Toys & Games',
        'Books & Media', 'Food & Grocery'],     
    },
    seller: {
        type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        required: true,
    },
    reviews: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
        required: false,
    },
    postedDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    description: {
        required: true,
        type: String,
    }
});


const Product = mongoose.model('Product', productSchema);

module.exports = Product;



