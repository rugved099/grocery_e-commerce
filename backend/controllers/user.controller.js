const User = require('../models/user.model');

// Update payment details (Farmer only)
exports.updatePaymentDetails = async (req, res) => {
    const { upiId, qrCodeImageUrl } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        if (user.role !== 'farmer') return res.status(403).json({ msg: 'Action not authorized' });

        user.upiId = upiId || user.upiId;
        user.qrCodeImageUrl = qrCodeImageUrl || user.qrCodeImageUrl;
        
        await user.save();
        res.json({ msg: 'Payment details updated successfully' });
    // NEW, CORRECTED CODE
} catch (err) {
    console.error("User Controller Error:", err.message);
    res.status(500).json({ msg: 'Server Error while updating user details.' });
}
};