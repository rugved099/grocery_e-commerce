const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true }, // Path to the uploaded image
    harvestDate: { type: Date, default: Date.now },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // This creates the link to the User model
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);