import React, { useState } from 'react';
import axios from 'axios';
import { ShoppingCart, TrendingUp, Calendar, User } from 'lucide-react';

const BACKEND_ORIGIN = import.meta.env.VITE_API_URL;

export default function ProductCard({ product, token, backendUrl, onAddToCart, onLoginRequired }) {
    const [compareText, setCompareText] = useState('Compare National Price');
    const [loadingCompare, setLoadingCompare] = useState(false);

    const handleCompare = async (e) => {
        e.preventDefault();
        if (!token) {
            onLoginRequired();
            return;
        }

        setLoadingCompare(true);
        setCompareText('Comparing...');
        try {
            const res = await axios.get(`${backendUrl}/prices/compare/${product.name}`, {
                headers: { 'x-auth-token': token }
            });
            const { nationalAverage } = res.data;
            const avgPrice = parseFloat(nationalAverage);
            const farmerPrice = parseFloat(product.price);
            
            let message = `National average for ${product.name} is approx. ₹${avgPrice.toFixed(2)}/kg.`;
            message += `\nThis farmer's price is ₹${farmerPrice.toFixed(2)}/kg.`;
            
            if (farmerPrice < avgPrice) {
                message += `\n\nThis is a great deal! You are saving money.`;
            } else if (farmerPrice > avgPrice) {
                message += `\n\nYou are paying a premium for fresh, local produce.`;
            } else {
                message += `\n\nThis is exactly at the national average price!`;
            }
            alert(message);
        } catch (err) {
            alert(`Error: ${err.response?.data?.msg || err.message || 'Could not retrieve price comparison.'}`);
        } finally {
            setCompareText('Compare National Price');
            setLoadingCompare(false);
        }
    };

    // Get formatted image URL — static files served directly from Express, not via proxy
    const imageUrl = product.image ? `${BACKEND_ORIGIN}/${product.image}` : '';

    return (
        <div className="product-card">
            <div className="product-image-container">
                <img src={imageUrl} alt={product.name} onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60'; // generic fallback veggie
                }} />
            </div>
            
            <h3>{product.name}</h3>
            
            <div className="farmer-name">
                <User size={14} />
                From: {product.farmer?.farmName || product.farmer?.name || 'Local Farmer'}
            </div>
            
            <div className="price-row">
                <span className="price">₹{parseFloat(product.price).toFixed(2)}</span>
                <span className="unit">/ {product.unit}</span>
            </div>
            
            <div className="compare-link" onClick={handleCompare}>
                <TrendingUp size={14} />
                {compareText}
            </div>
            
            <div className="harvest-date">
                <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Harvested: {new Date(product.harvestDate).toLocaleDateString()}
            </div>
            
            <button className="btn" onClick={() => onAddToCart(product)}>
                <ShoppingCart size={16} />
                Add to Cart
            </button>
        </div>
    );
}
