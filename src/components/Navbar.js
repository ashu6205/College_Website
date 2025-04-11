// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onLogout, userName, isAdmin }) => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="brand-link">College Website</Link>
            </div>

            {/* Hamburger menu button for mobile */}
            <button className="hamburger" onClick={toggleMenu}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </button>

            {/* Menu Links */}
            <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
                <Link
                    to="/"
                    className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                >
                    Home
                </Link>
                <Link
                    to="/academics"
                    className={`nav-link ${location.pathname === '/academics' ? 'active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                >
                    Academics
                </Link>
                <Link
                    to="/lost-found"
                    className={`nav-link ${location.pathname === '/lost-found' ? 'active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                >
                    Lost & Found
                </Link>
                <Link
                    to="/channels"
                    className={`nav-link ${location.pathname === '/channels' ? 'active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                >
                    Channels
                </Link>

                {/* Show user info inside menu on mobile */}
                <div className="mobile-user-info">
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
            </div>

            {/* Show user info on desktop */}
            <div className="navbar-end">
                {userName && (
                    <span className="user-info desktop-only">
                        <span className="user-name">{userName}</span>
                        {isAdmin && <span className="admin-badge">Admin</span>}
                    </span>
                )}
                <button className="logout-button desktop-only" onClick={onLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
