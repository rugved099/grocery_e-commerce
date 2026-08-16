const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

const isGoogleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (isGoogleConfigured) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        proxy: true,
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done) => {
        try {
            const role = req.query.state || 'customer';
            
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                return done(null, user);
            } else {
                // Check if user exists by email
                user = await User.findOne({ email: profile.emails[0].value });
                if (user) {
                    // User exists, link Google ID
                    user.googleId = profile.id;
                    // If user was created manually as farmer, keep that role. If created as customer, keep customer.
                    await user.save();
                    return done(null, user);
                } else {
                    // Create a new user with the requested role
                    const newUser = new User({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        role: role
                    });
                    await newUser.save();
                    return done(null, newUser);
                }
            }
        } catch (err) {
            return done(err, false);
        }
    }));
} else {
    console.warn('WARNING: Google OAuth credentials (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET) not set in .env. Google login will be disabled.');
}

module.exports = { isGoogleConfigured };