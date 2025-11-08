const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth.middleware');
const { createProduct, getProducts } = require('../controllers/product.controller');

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage: storage });

// Routes
router.get('/', getProducts);
router.post('/', [auth, upload.single('image')], createProduct); // Protected route

module.exports = router;