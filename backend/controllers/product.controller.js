const Product = require('../models/product.model');

// Create a product (Farmer only)
exports.createProduct = async (req, res) => {
    const { name, price, unit, quantity } = req.body;
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
    // NEW, CORRECTED CODE
} catch (err) {
    console.error("Product Controller Error:", err.message);
    // Send a JSON object instead of a string
    res.status(500).json({ msg: 'Server Error while handling products.' });
}
};

// Get all products (Public)
// controllers/product.controller.js

// ... (createProduct function is unchanged) ...

exports.getProducts = async (req, res) => {
    try {
        // Add 'contactNumber' to the fields being populated
        const products = await Product.find().sort({ harvestDate: -1 })
            .populate('farmer', ['name', 'farmName', 'upiId', 'contactNumber']); // <-- UPDATED LINE
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};