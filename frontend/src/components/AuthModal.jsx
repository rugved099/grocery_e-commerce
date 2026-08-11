import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_ORIGIN = 'http://localhost:5000';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, backendUrl }) {
    const [activeTab, setActiveTab] = useState('customer'); // 'customer' or 'farmer'
    const [isLogin, setIsLogin] = useState(true); // true for login, false for signup
    
    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [farmName, setFarmName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setFarmName('');
        setContactNumber('');
        setErrorMsg('');
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setIsLogin(true);
        resetForm();
    };

    const handleFormToggle = () => {
        setIsLogin(!isLogin);
        setErrorMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        try {
            if (activeTab === 'customer') {
                if (isLogin) {
                    const res = await axios.post(`${backendUrl}/auth/login`, { email, password });
                    if (res.data.user.role !== 'customer') {
                        throw new Error('This account is not a customer account.');
                    }
                    onLoginSuccess(res.data.token, res.data.user);
                } else {
                    const res = await axios.post(`${backendUrl}/auth/register/customer`, { name, email, password });
                    alert('Customer account created successfully! Please log in.');
                    setIsLogin(true);
                    resetForm();
                }
            } else { // Farmer
                if (isLogin) {
                    const res = await axios.post(`${backendUrl}/auth/login`, { email, password });
                    if (res.data.user.role !== 'farmer') {
                        throw new Error('This account is not a farmer account.');
                    }
                    onLoginSuccess(res.data.token, res.data.user);
                } else {
                    const res = await axios.post(`${backendUrl}/auth/register/farmer`, {
                        name,
                        farmName,
                        email,
                        password,
                        contactNumber
                    });
                    alert('Farmer account created successfully! Please log in.');
                    setIsLogin(true);
                    resetForm();
                }
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.msg || err.message || 'An error occurred during submission.');
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}>×</button>
                
                <div className="modal-tabs">
                    <button 
                        className={activeTab === 'customer' ? 'active' : ''} 
                        onClick={() => handleTabChange('customer')}
                    >
                        Customer
                    </button>
                    <button 
                        className={activeTab === 'farmer' ? 'active' : ''} 
                        onClick={() => handleTabChange('farmer')}
                    >
                        Farmer
                    </button>
                </div>

                {/* Google Sign-in Button */}
                <div className="google-auth-container">
                    <a href={`${BACKEND_ORIGIN}/api/auth/google`} className="google-btn-premium">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google logo" />
                        Sign in with Google
                    </a>
                </div>

                <div className="separator-text">or continue with email</div>

                {errorMsg && (
                    <div style={{ color: 'var(--danger-color)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '10px', textAlign: 'center' }}>
                        {errorMsg}
                    </div>
                )}

                <form className="premium-form" style={{ padding: 0, border: 'none', boxShadow: 'none', marginTop: 0 }} onSubmit={handleSubmit}>
                    <h3>{activeTab === 'customer' ? 'Customer' : 'Farmer'} {isLogin ? 'Login' : 'Sign Up'}</h3>
                    
                    {!isLogin && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                className="premium-input" 
                                placeholder="Your Name" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                            />
                        </div>
                    )}

                    {!isLogin && activeTab === 'farmer' && (
                        <div className="form-group">
                            <label>Farm Name</label>
                            <input 
                                type="text" 
                                className="premium-input" 
                                placeholder="e.g., Green Valley Organic" 
                                value={farmName} 
                                onChange={(e) => setFarmName(e.target.value)} 
                                required 
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            className="premium-input" 
                            placeholder="you@example.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>

                    {!isLogin && activeTab === 'farmer' && (
                        <div className="form-group">
                            <label>Contact Number</label>
                            <input 
                                type="tel" 
                                className="premium-input" 
                                placeholder="e.g., 9876543210" 
                                value={contactNumber} 
                                onChange={(e) => setContactNumber(e.target.value)} 
                                required 
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            className="premium-input" 
                            placeholder="••••••••" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>

                    <button type="submit" className="btn">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                    
                    <div className="toggle-form-link">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span onClick={handleFormToggle}>
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}
