// backend/routes/price.routes.js

const express = require('express');
const router = express.Router();
const { getNationalAveragePrice } = require('../controllers/price.controller');
const auth = require('../middleware/auth.middleware'); // Protect the route so only logged-in users can use it

router.get('/compare/:vegetableName', auth, getNationalAveragePrice);

module.exports = router;