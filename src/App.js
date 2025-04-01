import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/signup'; // Import Signup component
import Navbar from './components/Navbar';
import PostCarousel from './components/PostCarousel';
import PostsFeed from './components/PostsFeed';
import AddPostButton from './components/AddPostButton';
import ItemDetail from './components/LostAndFound/ItemDetail';
import LostAndFound from './components/LostAndFound/LostAndFound';
import AcademicDashboard from './components/Academic/AcademicDashboard';
import ResourceList from './components/Academic/ResourceList';
import GroupDetailPage from './components/Academic/GroupDetailPage';
import ChannelsPage from './components/Channels/ChannelsPage';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setIsAuthenticated(true);
                setUserData(user);
                console.log('Restored user session:', user);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
    }, []);

    const handleLoginSuccess = (userData) => {
        setIsAuthenticated(true);
        setUserData(userData);
        console.log('Login successful, user data:', userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUserData(null);
    };

    const isAdmin = userData?.role === 'admin';

    const HomePage = () => (
        <>
            {isAdmin && <AddPostButton />}
            <section className="carousel-section">
                <PostCarousel isAdmin={isAdmin} />
                <div
                    className="scroll-indicator"
                    onClick={() => document.querySelector('.feed-section').scrollIntoView({ behavior: 'smooth' })}
                >
                    <span>Scroll for more</span>
                    <i className="fas fa-chevron-down icon"></i>
                </div>
            </section>
            <section className="feed-section">
                <h2 className="section-title">Recent Posts</h2>
                <PostsFeed isAdmin={isAdmin} />
            </section>
        </>
    );

    return (
        <Router>
            <div className="App">
                <div className="ambient-circles">
                    <div className="ambient-circle circle-1"></div>
                    <div className="ambient-circle circle-2"></div>
                    <div className="ambient-circle circle-3"></div>
                </div>

                {isAuthenticated ? (
                    <div className="app-container">
                        <Navbar
                            onLogout={handleLogout}
                            userName={userData?.fullName}
                            isAdmin={isAdmin}
                        />
                        <div className="main-content">
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/lost-found" element={<LostAndFound isAdmin={isAdmin} />} />
                                <Route path="/lost-found/:itemId" element={<ItemDetail />} />
                                <Route path="/academics" element={<AcademicDashboard isAdmin={isAdmin} />} />
                                <Route path="/academics/group/:groupId" element={<GroupDetailPage isAdmin={isAdmin} />} />
                                <Route path="/academics/resources/:resourceId" element={<ResourceList />} />
                                <Route path="/channels/*" element={<ChannelsPage user={userData} />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </div>
                    </div>
                ) : (
                    <div className="auth-container">
                        <Routes>
                            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                            <Route path="/signup" element={<Signup />} /> {/* Signup route added */}
                            <Route path="*" element={<Navigate to="/login" replace />} />
                        </Routes>
                    </div>
                )}
            </div>
        </Router>
    );
}

export default App;
