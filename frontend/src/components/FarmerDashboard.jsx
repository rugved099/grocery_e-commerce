import React, { useState } from 'react';
import axios from 'axios';
import { Plus, Check, Settings, Eye, Calendar, Sparkles } from 'lucide-react';

const BACKEND_ORIGIN = 'http://localhost:5000';

export default function FarmerDashboard({ currentUser, token, backendUrl, products, onRefreshProducts }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('kg');
    const [quantity, setQuantity] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [upiId, setUpiId] = useState(currentUser.upiId || '');
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [loadingPayment, setLoadingPayment] = useState(false);

    // Filter products listed by this farmer
    const myListings = products.filter(p => p.farmer?._id === currentUser.id);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!imageFile) {
            alert('Please select a vegetable image.');
            return;
        }

        setLoadingProduct(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('unit', unit);
        formData.append('quantity', quantity);
        formData.append('image', imageFile);

        try {
            await axios.post(`${backendUrl}/products`, formData, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Vegetable listed successfully!');
            // Reset form
            setName('');
            setPrice('');
            setUnit('kg');
            setQuantity('');
            setImageFile(null);
            setImagePreview('');
            setShowAddForm(false);
            onRefreshProducts();
        } catch (err) {
            alert('Failed to list vegetable: ' + (err.response?.data?.msg || err.message));
        } finally {
            setLoadingProduct(false);
        }
    };

    const handleUpdatePayment = async (e) => {
        e.preventDefault();
        setLoadingPayment(true);
        try {
            const res = await axios.put(`${backendUrl}/users/payment-details`, { upiId }, {
                headers: { 'x-auth-token': token }
            });
            alert(res.data.msg || 'Payment settings saved successfully!');
            onRefreshProducts();
        } catch (err) {
            alert('Failed to save payment settings: ' + (err.response?.data?.msg || err.message));
        } finally {
            setLoadingPayment(false);
        }
    };

    return (
        <div className="farmer-dashboard-grid">
            {/* Left Column: Forms */}
            <div>
                <h3>Farmer Controls</h3>
                
                <button 
                    className="btn btn-outline" 
                    style={{ width: '100%', marginBottom: '1.5rem' }}
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    <Plus size={16} />
                    {showAddForm ? 'Hide Listing Form' : 'List New Vegetable'}
                </button>

                {showAddForm && (
                    <form className="premium-form" onSubmit={handleAddProduct}>
                        <h3>List New Vegetable</h3>
                        
                        <div className="form-group">
                            <label>Vegetable Name</label>
                            <input 
                                type="text" 
                                className="premium-input" 
                                placeholder="e.g. Organic Tomato" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label>Price (₹)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className="premium-input" 
                                    placeholder="Price" 
                                    value={price} 
                                    onChange={(e) => setPrice(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div>
                                <label>Unit</label>
                                <select 
                                    className="premium-select" 
                                    value={unit} 
                                    onChange={(e) => setUnit(e.target.value)} 
                                    required
                                >
                                    <option value="kg">per kg</option>
                                    <option value="bunch">per bunch</option>
                                    <option value="item">per item</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Quantity Available</label>
                            <input 
                                type="number" 
                                className="premium-input" 
                                placeholder="e.g. 50" 
                                value={quantity} 
                                onChange={(e) => setQuantity(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className="form-group">
                            <label>Vegetable Image</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                                required 
                            />
                            {imagePreview && (
                                <div className="image-preview-box">
                                    <img src={imagePreview} alt="Preview" />
                                </div>
                            )}
                        </div>

                        <button type="submit" className="btn" disabled={loadingProduct}>
                            <Sparkles size={16} />
                            {loadingProduct ? 'Listing...' : 'List My Vegetable'}
                        </button>
                    </form>
                )}

                <form className="premium-form" style={{ marginTop: showAddForm ? '2rem' : '0' }} onSubmit={handleUpdatePayment}>
                    <h3>
                        <Settings size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        Payment Settings
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '--text-light', marginBottom: '8px' }}>
                        Enter your UPI ID so customers pay you directly.
                    </p>
                    
                    <div className="form-group">
                        <label>Your UPI ID (e.g., name@oksbi)</label>
                        <input 
                            type="text" 
                            className="premium-input" 
                            placeholder="yourname@okbank" 
                            value={upiId} 
                            onChange={(e) => setUpiId(e.target.value)} 
                            required 
                        />
                    </div>

                    <button type="submit" className="btn" disabled={loadingPayment}>
                        <Check size={16} />
                        {loadingPayment ? 'Saving...' : 'Save Payment Details'}
                    </button>
                </form>
            </div>

            {/* Right Column: Listings */}
            <div>
                <h3>My Current Listings ({myListings.length})</h3>
                
                {myListings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-lighter)' }}>
                        <Eye size={36} strokeWidth={1.5} style={{ margin: '0 auto 10px' }} />
                        <p>You have not listed any produce yet.</p>
                        <p style={{ fontSize: '0.85rem' }}>Use the form on the left to list your first harvest!</p>
                    </div>
                ) : (
                    <div className="farmer-listings">
                        {myListings.map(product => (
                            <div className="farmer-listing-card" key={product._id}>
                                <img src={`${BACKEND_ORIGIN}/${product.image}`} alt={product.name} onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60';
                                }} />
                                
                                <div className="listing-info">
                                    <h4>{product.name}</h4>
                                    <p>₹{parseFloat(product.price).toFixed(2)} / {product.unit} | Stock: {product.quantity}</p>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-lighter)' }}>
                                        <Calendar size={12} />
                                        Listed: {new Date(product.harvestDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
