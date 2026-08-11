const Product = require('../models/product.model');

// Create a product (Farmer only)
exports.createProduct = async (req, res) => {
    const { name, price, unit, quantity } = req.body;
    
    // Check if image file was uploaded
    if (!req.file) {
        return res.status(400).json({ msg: 'Please upload an image for the product.' });
    }

    try {
        const newProduct = new Product({
            name,
            price,
            unit,
            quantity,
            image: req.file.path.replace(/\\/g, "/"), // Get path from multer and format for web
            farmer: req.user.id // Get farmer's ID from the auth middleware
        });
        const product = await newProduct.save();
        res.status(201).json(product);
    } catch (err) {
        console.error("Product Controller Error:", err.message);
        res.status(500).json({ msg: 'Server Error while handling products.' });
    }
};

// Get all products (Public)
exports.getProducts = async (req, res) => {
    try {
        // Populate farmer details including name, farmName, upiId, and contactNumber
        const products = await Product.find().sort({ harvestDate: -1 })
            .populate('farmer', ['name', 'farmName', 'upiId', 'contactNumber']);
        res.json(products);
    } catch (err) {
        console.error("Get Products Error:", err.message);
        res.status(500).json({ msg: 'Server Error while fetching products.' });
    }
};