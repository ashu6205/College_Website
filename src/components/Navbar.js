// src/components/Navbar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onLogout, userName, isAdmin }) => {
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="brand-link">College Website</Link>
            </div>
            
            <div className="navbar-menu">
                <Link 
                    to="/" 
                    className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                >
                    Home
                </Link>
                <Link 
                    to="/academics" 
                    className={`nav-link ${location.pathname === '/academics' ? 'active' : ''}`}
                >
                    Academics
                </Link>
                <Link 
                    to="/lost-found" 
                    className={`nav-link ${location.pathname === '/lost-found' ? 'active' : ''}`}
                >
                    Lost & Found
                </Link>
                <Link 
                    to="/channels" 
                    className={`nav-link ${location.pathname === '/channels' ? 'active' : ''}`}
                >
                    Channels
                </Link>
            </div>

            <div className="navbar-end">
                {userName && (
                    <span className="user-info">
                        <span className="user-name">{userName}</span>
                        {isAdmin && <span className="admin-badge">Admin</span>}
                    </span>
                )}
                <button className="logout-button" onClick={onLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;