const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth.middleware');
const { createProduct, getProducts, deleteProduct } = require('../controllers/product.controller');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer setup for Cloudinary image uploads
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'grocery-uploads',
        allowedFormats: ['jpeg', 'png', 'jpg', 'webp']
    }
});
const upload = multer({ storage: storage });

// Routes
router.get('/', getProducts);
router.post('/', [auth, upload.single('image')], createProduct); // Protected route
router.delete('/:id', auth, deleteProduct); // Protected route

module.exports = router;