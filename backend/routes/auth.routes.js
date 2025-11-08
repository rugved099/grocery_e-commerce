// routes/auth.routes.js

const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Destructure the new, specific functions from the controller
const { registerCustomer, registerFarmer, login } = require('../controllers/auth.controller');

// --- Standard Authentication Routes ---
router.post('/login', login); // Login endpoint remains the same

// NEW: Separate registration routes
router.post('/register/customer', registerCustomer);
router.post('/register/farmer', registerFarmer);


// --- Google Authentication Routes ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// Google Auth Callback
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}?error=auth_failed` }), (req, res) => {
    const payload = { user: { id: req.user.id, role: req.user.role, name: req.user.name } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Pass token and user data back to frontend via URL query
    const userString = encodeURIComponent(JSON.stringify({ id: req.user.id, name: req.user.name, role: req.user.role }));
    res.redirect(`${process.env.CLIENT_URL}?token=${token}&user=${userString}`);
});

module.exports = router;