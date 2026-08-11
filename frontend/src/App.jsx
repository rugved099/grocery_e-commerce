import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ProductGrid from './components/ProductGrid';
import CartSidebar from './components/CartSidebar';
import PaymentModal from './components/PaymentModal';
import FarmerDashboard from './components/FarmerDashboard';

const BACKEND_URL = '/api';

export default function App() {
    // Auth States
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [currentUser, setCurrentUser] = useState(
        localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
    );

    // Core Data States
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState(
        localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
    );

    // UI/Modal States
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [selectedFarmerForPayment, setSelectedFarmerForPayment] = useState(null);

    // 1. Google OAuth Token URL Check
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const receivedToken = urlParams.get('token');
        const receivedUser = urlParams.get('user');

        if (receivedToken && receivedUser) {
            const decodedUser = JSON.parse(decodeURIComponent(receivedUser));
            
            // Save state
            setToken(receivedToken);
            setCurrentUser(decodedUser);
            
            // Save to localStorage
            localStorage.setItem('token', receivedToken);
            localStorage.setItem('user', JSON.stringify(decodedUser));
            
            // Clean up the URL query params
            window.history.replaceState({}, document.title, window.location.pathname);
            
            alert(`Welcome back, ${decodedUser.name}! Successfully signed in via Google.`);
        }
    }, []);

    // 2. Fetch Products on load & role change
    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/products`);
            setProducts(res.data);
        } catch (err) {
            console.error('Error fetching products from backend:', err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // 3. Keep Cart in sync with LocalStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Auth Handlers
    const handleLoginClick = () => {
        setIsAuthOpen(true);
    };

    const handleLoginSuccess = (newToken, newUser) => {
        setToken(newToken);
        setCurrentUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setIsAuthOpen(false);
        
        // If farmer logs in, clear cart to avoid checkout issues
        if (newUser.role === 'farmer') {
            setCart([]);
        }
    };

    const handleLogout = () => {
        setToken('');
        setCurrentUser(null);
        setCart([]);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        alert('You have logged out successfully.');
    };

    // Cart Operations
    const handleAddToCart = (product) => {
        // Enforce login logic requested by user
        if (!token || !currentUser) {
            alert('Please log in or sign up to add products to your cart.');
            setIsAuthOpen(true);
            return;
        }

        // Prevent farmers from adding to cart
        if (currentUser.role === 'farmer') {
            alert('Farmers cannot buy products or add items to cart.');
            return;
        }

        const newCartItem = {
            cartItemId: Date.now() + Math.random(),
            product
        };
        
        setCart([...cart, newCartItem]);
        alert(`Added "${product.name}" to your cart!`);
    };

    const handleRemoveFromCart = (cartItemId) => {
        setCart(cart.filter(item => item.cartItemId !== cartItemId));
    };

    const handlePayFarmerClick = (farmer) => {
        if (!token || !currentUser) {
            alert('Please log in or sign up to proceed with payment.');
            setIsAuthOpen(true);
            return;
        }
        setSelectedFarmerForPayment(farmer);
        setIsPaymentOpen(true);
    };

    const handlePaymentComplete = (farmer) => {
        let confirmationMessage = 'Thank you! Your order is being processed.';
        if (farmer.contactNumber) {
            confirmationMessage += `\n\nIf you have any queries, you can contact the farmer directly at: ${farmer.contactNumber}`;
        }
        
        alert(confirmationMessage);
        setIsPaymentOpen(false);
        
        // Remove items purchased from this specific farmer from the cart
        setCart(cart.filter(item => item.product?.farmer?._id !== farmer._id));
        setSelectedFarmerForPayment(null);
    };

    // Determine layout css class based on role (Farmers don't show Cart sidebar)
    const isFarmer = currentUser && currentUser.role === 'farmer';
    const appClass = isFarmer ? 'app-container farmer-layout' : 'app-container';

    return (
        <div className={appClass}>
            {/* Header / Navbar */}
            <Navbar 
                currentUser={currentUser} 
                onLoginClick={handleLoginClick} 
                onLogout={handleLogout} 
            />

            {/* Main content grid */}
            <main className="main-content">
                {isFarmer ? (
                    <FarmerDashboard 
                        currentUser={currentUser} 
                        token={token} 
                        backendUrl={BACKEND_URL}
                        products={products}
                        onRefreshProducts={fetchProducts}
                    />
                ) : (
                    <ProductGrid 
                        products={products} 
                        token={token} 
                        backendUrl={BACKEND_URL}
                        onAddToCart={handleAddToCart}
                        onLoginRequired={() => {
                            alert('Please log in or sign up to use this feature.');
                            setIsAuthOpen(true);
                        }}
                    />
                )}
            </main>

            {/* Cart Sidebar (Customers/Guests only) */}
            {!isFarmer && (
                <CartSidebar 
                    cart={cart} 
                    onRemoveFromCart={handleRemoveFromCart} 
                    onPayFarmerClick={handlePayFarmerClick} 
                />
            )}

            {/* Modals */}
            <AuthModal 
                isOpen={isAuthOpen} 
                onClose={() => setIsAuthOpen(false)} 
                onLoginSuccess={handleLoginSuccess}
                backendUrl={BACKEND_URL}
            />

            <PaymentModal 
                isOpen={isPaymentOpen} 
                onClose={() => {
                    setIsPaymentOpen(false);
                    setSelectedFarmerForPayment(null);
                }}
                farmer={selectedFarmerForPayment}
                onComplete={handlePaymentComplete}
            />
        </div>
    );
}
