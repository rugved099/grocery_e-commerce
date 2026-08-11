// --- CRITICAL FIX ---
// Load environment variables from .env file FIRST.
// This makes them available to all other files in the application immediately.
require('dotenv').config();

// --- Import Core Modules ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const fs = require('fs');
const path = require('path');

// --- Initialize Express App ---
const app = express();

// --- Middleware Configuration ---
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Ensure uploads directory exists on server start
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
}

// This line executes our passport setup file. Now it will find the environment variables.
require('./config/passport-setup'); 

// Serve static files (like uploaded images) from the 'uploads' directory.
app.use('/uploads', express.static('uploads'));

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected successfully...'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// --- API Routes ---
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/prices', require('./routes/price.routes'));

// --- Start the Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server for Fresh Valley Enclave started on port ${PORT}`));