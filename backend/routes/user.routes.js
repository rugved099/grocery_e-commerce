const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { updatePaymentDetails } = require('../controllers/user.controller');

router.put('/payment-details', auth, updatePaymentDetails); // Protected route

module.exports = router;