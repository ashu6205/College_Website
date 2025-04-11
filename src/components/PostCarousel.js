// src/components/PostCarousel.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './PostCarousel.css';

const PostCarousel = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) =>
                prev === posts.length - 1 ? 0 : prev + 1
            );
        }, 5000);
        return () => clearInterval(timer);
    }, [posts.length]);

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://college-website-backend.onrender.com/api/posts', {
                headers: { Authorization: `Bearer ${token}` },
            });
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
        e.target.src = '/placeholder.jpg';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
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

    const variants = {
        initial: { opacity: 0, x: 100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -100 },
    };

    return (
        <div className="carousel-wrapper">
            <div className="carousel">
                <div className="carousel-inner">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={posts[currentSlide]._id}
                        className="carousel-slide active"
                        variants={{
                        initial: { opacity: 0, scale: 0.95, x: 100 },
                        animate: { opacity: 1, scale: 1, x: 0 },
                        exit: { opacity: 0, scale: 0.95, x: -100 }
                        }}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                    >
                        <div className="carousel-image">
                        {posts[currentSlide].media && posts[currentSlide].media.length > 0 ? (
                            <img
                            src={`https://college-website-backend.onrender.com${posts[currentSlide].media[0].path}`}
                            alt={posts[currentSlide].media[0].originalName || 'Post image'}
                            onError={handleImageError}
                            />
                        ) : (
                            <div className="no-image">
                            <p>No image available</p>
                            </div>
                        )}
                        </div>

                        <div className="carousel-content">
                        <motion.div
                            className="post-tags"
                            initial="hidden"
                            animate="visible"
                            variants={{
                            visible: {
                                transition: {
                                staggerChildren: 0.1,
                                delayChildren: 0.2
                                }
                            }
                            }}
                        >
                            {posts[currentSlide].tags?.map((tag, i) => (
                            <motion.span
                                className="tag"
                                key={i}
                                variants={{
                                hidden: { opacity: 0, y: 10 },
                                visible: { opacity: 1, y: 0 }
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                #{tag}
                            </motion.span>
                            ))}
                        </motion.div>
                        </div>
                    </motion.div>
                    </AnimatePresence>

                </div>

                {posts.length > 1 && (
                    <>
                        <div className="carousel-controls">
                            <button
                                className="control-button prev"
                                onClick={() =>
                                    setCurrentSlide((prev) =>
                                        prev === 0 ? posts.length - 1 : prev - 1
                                    )
                                }
                            >
                                ❮
                            </button>
                            <button
                                className="control-button next"
                                onClick={() =>
                                    setCurrentSlide((prev) =>
                                        prev === posts.length - 1 ? 0 : prev + 1
                                    )
                                }
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
