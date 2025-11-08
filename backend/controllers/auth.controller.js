// controllers/auth.controller.js

const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * =============================================================
 *  REGISTER A NEW CUSTOMER
 * =============================================================
 */
exports.registerCustomer = async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({ msg: "Please enter all fields." });
    }

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User with this email already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'customer' // Set role specifically to customer
        });

        await user.save();
        res.status(201).json({ msg: 'Customer account created successfully! Please log in.' });

    // NEW, CORRECTED CODE
} catch (err) {
    console.error("Auth Controller Error:", err.message);
    res.status(500).json({ msg: 'Server error during authentication.' });
}
};


/**
 * =============================================================
 *  REGISTER A NEW FARMER
 * =============================================================
 */
// controllers/auth.controller.js

// ... (registerCustomer and login functions are unchanged) ...

exports.registerFarmer = async (req, res) => {
    // 1. Add contactNumber to the destructuring
    const { name, farmName, email, password, contactNumber } = req.body;

    // 2. Update the validation
    if (!name || !farmName || !email || !password || !contactNumber) {
        return res.status(400).json({ msg: "Please enter all fields, including Farm Name and Contact Number." });
    }

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User with this email already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            farmName,
            email,
            password: hashedPassword,
            role: 'farmer',
            contactNumber // 3. Add contactNumber to the new user object
        });

        await user.save();
        res.status(201).json({ msg: 'Farmer account created successfully! Please log in.' });

    } catch (err) {
        // Mongoose validation errors will be caught here
        console.error(err.message);
        res.status(500).send('Server error during farmer registration');
    }
};

// ... (login function is unchanged) ...

/**
 * =============================================================
 *  LOGIN (Works for both roles)
 * =============================================================
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
        if (!user.password) return res.status(400).json({ msg: 'This account uses Google Sign-In.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id, role: user.role, name: user.name } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Return token and user object, as expected by the frontend
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};