import React from 'react';
import { Sprout, LogIn, LogOut } from 'lucide-react';

export default function Navbar({ currentUser, onLoginClick, onLogout }) {
    return (
        <header className="app-header">
            <div className="logo">
                <h1>
                    <Sprout size={28} strokeWidth={2.5} color="#2E7D32" />
                    Fresh Valley Enclave
                </h1>
                <p>Your Local Harvest Connection</p>
            </div>
            <nav className="header-nav">
                {currentUser ? (
                    <>
                        <span className="user-badge">
                            {currentUser.role === 'farmer' ? '👨‍🌾 Farmer: ' : '👤 Customer: '}
                            {currentUser.name}
                        </span>
                        <button className="btn btn-outline" onClick={onLogout}>
                            <LogOut size={16} />
                            Logout
                        </button>
                    </>
                ) : (
                    <button className="btn" onClick={onLoginClick}>
                        <LogIn size={16} />
                        Login / Sign Up
                    </button>
                )}
            </nav>
        </header>
    );
}
