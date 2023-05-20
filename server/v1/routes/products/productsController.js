const Product = require('../../config/productsSchema');
const User = require('../../config/usersSchema');
const { deleteUserProduct } = require('../Auth/Middlewares');
const joiProductSchema = require('../Auth/joiValidation');
 
const showAllProducts = async (req, res, next) => { 
    const { name = '' } = req.query;  
    try {             
        if (!name) {
            const products = await Product.find({});
            res.status(200).json(products);
        } else {
            const products = await Product.find({ name: { $regex: name, $options: 'i' } });
            if (!products || products.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }
            return res.status(200).json(products);
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }      
}


const showProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Product not found!' });
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const makePriceNumber = (reqBody) => {
    reqBody.price = Number(reqBody.price);
    reqBody.numericPrice = reqBody.price;
    delete reqBody.price;
}

const addProduct = async (req, res, next) => {
    let { name, price, category, description } = req.body;
    if (!name || !price || !category || !description) {
        return res.status(400).json({ message: 'All fields are required to add a new product' });
    }
    makePriceNumber(req.body);
    const { error } = joiProductSchema.validate(req.body);
    if (error) {
        // If validation fails, send the details of the error in the response
        return res.status(400).json({ error: error.details[0].message });
    }
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).json({ message: 'User not found!' });
        const newProduct = new Product({
            name,
            price: req.body.numericPrice,
            category,
            description,
            seller: req.user._id
        });

        await newProduct.save();
        user.products.push(newProduct._id);
        await user.save();

        res.status(201).json({ message: 'Added a new product', product: newProduct });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const updateProduct = async (req, res) => {
    try {
        if (req.body.price) makePriceNumber(req.body);
        const { error } = joiProductSchema.validate(req.body);
        if (error) {
            // If validation fails, send the details of the error in the response
            return res.status(400).json({ error: error.details[0].message });
        }
        const { id } = req.params;
        const user = req.user._id.toString();
        const product = await Product.findById(id).populate('seller');
        if (!product) return res.status(404).json({ message: 'Product not found!' });
        if (product.seller[0]._id.toString() !== user) {
            return res.status(401).json({ message: "Unauthorized to make any change" });
        }
        req.body.price = req.body.numericPrice;
        delete req.body.numericPrice;
        const updatedProduct = Object.assign(product, req.body);
        await updatedProduct.save();
        res.status(200).json({ message: "Product updated", product: updatedProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id.toString();
        const product = await Product.findById(id).populate('seller');
        if (!product) return res.status(404).json({ message: 'Product not found!' });
        if (product.seller[0]._id.toString() !== userId) {
            return res.status(401).json({ message: "Unauthorized to delete" });
        }
        await Product.findByIdAndDelete(id);
        await deleteUserProduct(userId, id);
        res.status(200).json({ message: "Product has been deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message});
    }
}


module.exports = { 
    showAllProducts,
    showProductById,
    addProduct,
    updateProduct,
    deleteProduct,
}