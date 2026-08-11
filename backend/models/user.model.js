const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Not required for Google users
    role: { type: String, enum: ['customer', 'farmer'], required: true },
    farmName: { type: String },
    googleId: { type: String },

      
    // --- NEW FIELD ---
    contactNumber: {
        type: String,
        // Make this field required only if the user's role is 'farmer'
        required: function() { return this.role === 'farmer'; }
    },

    
    // Farmer-specific payment details
    upiId: { type: String, default: '' },
    qrCodeImageUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);