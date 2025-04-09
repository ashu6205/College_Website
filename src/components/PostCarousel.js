// src/components/PostCarousel.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PostCarousel.css';

const PostCarousel = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    // Auto-slide effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prevSlide) => 
                prevSlide === posts.length - 1 ? 0 : prevSlide + 1
            );
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(timer);
    }, [posts.length]);

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://college-website-backend.onrender.com/api/posts', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Posts data:', response.data);
            setPosts(response.data.posts);
            setError(null);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setError('Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    };

    const handleImageError = (e) => {
        console.error('Image failed to load:', e.target.src);
        e.target.src = '/placeholder.jpg'; // Fallback image
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="carousel-wrapper">
                <div className="carousel-loading">
                    <div className="loader"></div>
                    <p>Loading posts...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="carousel-wrapper">
                <div className="carousel-error">
                    <p>{error}</p>
                    <button onClick={fetchPosts}>Retry</button>
                </div>
            </div>
        );
    }

    if (!posts || posts.length === 0) {
        return (
            <div className="carousel-wrapper">
                <div className="carousel-empty">
                    <p>No posts available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="carousel-wrapper">
            <div className="carousel">
                <div className="carousel-inner">
                    {posts.map((post, index) => (
                        <div 
                            key={post._id}
                            className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                        >
                            <div className="carousel-image">
                                {post.media && post.media.length > 0 ? (
                                    <img 
                                        src={`https://college-website-backend.onrender.com${post.media[0].path}`}
                                        alt={post.media[0].originalName || 'Post image'}
                                        onError={handleImageError}
                                    />
                                ) : (
                                    <div className="no-image">
                                        <p>No image available</p>
                                    </div>
                                )}
                            </div>
                            <div className="carousel-content">
                                <div className="post-header">
                                    <div className="post-info">
                                        <span className="post-date">
                                            <i className="far fa-calendar"></i>
                                            {formatDate(post.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <p className="post-text">{post.content}</p>
                                {post.tags && post.tags.length > 0 && (
                                    <div className="post-tags">
                                        {post.tags.map((tag, i) => (
                                            <span key={i} className="tag">#{tag}</span>
                                        ))}
                                    </div>
                                )}
                                {/* <div className="post-interactions">
                                    <span className="likes">
                                        <i className="far fa-heart"></i>
                                        {post.likes?.length || 0}
                                    </span>
                                    <span className="comments">
                                        <i className="far fa-comment"></i>
                                        {post.comments?.length || 0}
                                    </span>
                                </div> */}
                            </div>
                        </div>
                    ))}
                </div>

                {posts.length > 1 && (
                    <>
                        <div className="carousel-controls">
                            <button 
                                className="control-button prev"
                                onClick={() => setCurrentSlide(prev => 
                                    prev === 0 ? posts.length - 1 : prev - 1
                                )}
                            >
                                ❮
                            </button>
                            <button 
                                className="control-button next"
                                onClick={() => setCurrentSlide(prev => 
                                    prev === posts.length - 1 ? 0 : prev + 1
                                )}
                            >
                                ❯
                            </button>
                        </div>

                        <div className="carousel-indicators">
                            {posts.map((_, index) => (
                                <div
                                    key={index}
                                    className={`indicator ${index === currentSlide ? 'active' : ''}`}
                                    onClick={() => setCurrentSlide(index)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PostCarousel;