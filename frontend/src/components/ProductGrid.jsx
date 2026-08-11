import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { Search } from 'lucide-react';

export default function ProductGrid({ products, token, backendUrl, onAddToCart, onLoginRequired }) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter products based on search query
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div id="customer-view">
            <div className="filter-section">
                <h2>Today's Fresh Harvest</h2>
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        className="premium-input" 
                        placeholder="Search for vegetables..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-lighter)' }}>
                    <p style={{ fontSize: '1.1rem' }}>No fresh produce found matching "{searchQuery}".</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>Check back later or search for another term!</p>
                </div>
            ) : (
                <div className="product-grid">
                    {filteredProducts.map(product => (
                        <ProductCard 
                            key={product._id} 
                            product={product} 
                            token={token} 
                            backendUrl={backendUrl}
                            onAddToCart={onAddToCart}
                            onLoginRequired={onLoginRequired}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
