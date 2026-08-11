import React from 'react';
import { ShoppingCart } from 'lucide-react';

export default function CartSidebar({ cart, onRemoveFromCart, onPayFarmerClick }) {
    // Group cart items by farmer
    const groupedByFarmer = cart.reduce((acc, cartItem) => {
        const farmer = cartItem.product?.farmer;
        if (!farmer) return acc;
        const farmerId = farmer._id;
        
        if (!acc[farmerId]) {
            acc[farmerId] = {
                farmerDetails: farmer,
                items: [],
                subtotal: 0
            };
        }
        acc[farmerId].items.push(cartItem);
        acc[farmerId].subtotal += parseFloat(cartItem.product.price);
        return acc;
    }, {});

    return (
        <aside className="cart-sidebar" id="cart-view">
            <h2>
                <ShoppingCart size={22} />
                My Cart
            </h2>

            {cart.length === 0 ? (
                <p className="empty-cart-msg">Your cart is empty.</p>
            ) : (
                <div className="cart-groups-container" style={{ flex: 1, overflowY: 'auto' }}>
                    {Object.keys(groupedByFarmer).map(farmerId => {
                        const group = groupedByFarmer[farmerId];
                        return (
                            <div className="farmer-cart-group" key={farmerId}>
                                <h4>From: {group.farmerDetails.farmName || group.farmerDetails.name || 'Local Farm'}</h4>
                                
                                {group.items.map(cartItem => (
                                    <div className="cart-item" key={cartItem.cartItemId}>
                                        <span>{cartItem.product.name}</span>
                                        <div className="cart-item-details">
                                            <span>₹{parseFloat(cartItem.product.price).toFixed(2)}</span>
                                            <button 
                                                className="remove-item-btn" 
                                                onClick={() => onRemoveFromCart(cartItem.cartItemId)}
                                                title="Remove item"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="cart-subtotal">
                                    <span>Subtotal:</span>
                                    <span>₹{group.subtotal.toFixed(2)}</span>
                                </div>
                                
                                <button 
                                    className="btn pay-farmer-btn"
                                    onClick={() => onPayFarmerClick(group.farmerDetails)}
                                >
                                    Pay this Farmer
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </aside>
    );
}
