// routes/auth.routes.js

const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { isGoogleConfigured } = require('../config/passport-setup');

// Destructure the new, specific functions from the controller
const { registerCustomer, registerFarmer, login } = require('../controllers/auth.controller');

// --- Standard Authentication Routes ---
router.post('/login', login); // Login endpoint remains the same

// NEW: Separate registration routes
router.post('/register/customer', registerCustomer);
router.post('/register/farmer', registerFarmer);

// --- Google Authentication Routes ---
if (isGoogleConfigured) {
    router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

    // Google Auth Callback
    router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}?error=auth_failed` }), (req, res) => {
        const payload = { user: { id: req.user.id, role: req.user.role, name: req.user.name } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Pass token and user data back to frontend via URL query
        const userString = encodeURIComponent(JSON.stringify({ id: req.user.id, name: req.user.name, role: req.user.role }));
        res.redirect(`${process.env.CLIENT_URL}?token=${token}&user=${userString}`);
    });
} else {
    const handleGoogleAuthDisabled = (req, res) => {
        res.status(501).json({ msg: 'Google OAuth is not configured on this server. Please register/login using standard email/password, or configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the backend/.env file.' });
    };
    router.get('/google', handleGoogleAuthDisabled);
    router.get('/google/callback', handleGoogleAuthDisabled);
}

module.exports = router;