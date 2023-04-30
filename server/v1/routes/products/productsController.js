const Product = require('../../config/productsSchema');
const User = require('../../config/usersSchema');
const { deleteUserProduct } = require('../Auth/Middlewares');
 
const showAllProducts = async (req, res, next) => { 
    const { name = '' } = req.query;               
    if (!name) {
        const products = await Product.find({});
        try {
            res.status(200).json(products);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }                                                                      
    }
    // if (name !== undefined && typeof name !== 'string') { 
    //     name = name.toString();
    // }
    const products = await Product.find({ name: { $regex: name, $options: 'i' } });
    if (!products || products.length === 0) return res.status(404).json({ message: 'Not found' });
    return res.status(200).json({products});
}

const showProductById = async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found!' });
    res.status(200).json({product});
}

const addProduct = async (req, res, next) => {
    const { name, price, category, description } = req.body;
    const postedDate = new Date().toLocaleString("en-US", { timeZone: 'Asia/Ulaanbaatar' });
    if (!name || !req.body.price || !category || !description) {
        return res.status(400).json({ message: 'All fields are required to add a new product' });
    }
    const newProduct = new Product({
        name,
        price,
        category,
        description,
        postedDate,
        seller: req.user._id
    });
    try {
        const user = await User.findById(req.user._id).populate('products');
        if (!user) return res.status(400).json({ message: 'User not found!' });
        await newProduct.save();
        user.products.push(newProduct._id);
        await user.save();
        res.status(201).json({ message: 'Added a new product' });
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const user = req.user._id.toString();
    const product = await Product.findById(id).populate('seller');
    if (!product) return res.status(404).json({ message: 'Product not found!' });
    if (product.seller[0]._id.toString() !== user) {
        return res.status(401).json({ message: "Unauthorized to make any change" });
    }
    try {
        const updatedProduct = Object.assign(product, req.body);
        await updatedProduct.save();
        res.status(200).json({ message: "Product updated", product: updatedProduct });
    } catch (err) {
        res.status(401).json({ message: err.message });
        console.log(err.message);
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id.toString();
    const product = await Product.findById(id).populate('seller');
    if (!product) return res.status(404).json({ message: 'Product not found!' });
    if (product.seller[0]._id.toString() !== userId) {
        return res.status(401).json({ message: "Unauthorized to delete" });
    }
    try {
        await Product.findByIdAndDelete(id);
        await deleteUserProduct(userId, id);
        res.status(200).json({ message: "Product has been deleted" });
    } catch (err) {
        res.status(401).json({ message: err.message});
    }
}


module.exports = { 
    showAllProducts,
    showProductById,
    addProduct,
    updateProduct,
    deleteProduct,
}