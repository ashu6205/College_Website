// src/components/PostsFeed.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PostsFeed.css';

const PostsFeed = ({ isAdmin }) => { // Add isAdmin prop
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showComments, setShowComments] = useState(null); // Store post ID for active comments

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`https://college-website-backend.onrender.com/api/posts?page=${page}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const newPosts = response.data.posts;
            setPosts(prevPosts => page === 1 ? newPosts : [...prevPosts, ...newPosts]);
            setHasMore(newPosts.length > 0);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setError('Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [page]); // Add fetchPosts to dependency array if needed

    const handleDeletePost = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`https://college-website-backend.onrender.com/api/posts/${postId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                // Refresh posts after deletion
                fetchPosts();
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    const handleLike = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`https://college-website-backend.onrender.com/api/posts/${postId}/like`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        isLiked: !post.isLiked,
                        likes: post.isLiked 
                            ? post.likes.filter(like => like !== post.userId)
                            : [...post.likes, post.userId]
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleComment = async (postId, comment) => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.post(
                `https://college-website-backend.onrender.com/api/posts/${postId}/comment`,
                { content: comment },
                { headers: { 'Authorization': `Bearer ${token}` }}
            );

            setPosts(posts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        comments: [...post.comments, response.data]
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error('Error commenting on post:', error);
        }
    };

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !loading) {
            setPage(prev => prev + 1);
        }
    };

    if (loading) {
        return <div className="posts-loading">Loading posts...</div>;
    }

    if (error) {
        return <div className="posts-error">{error}</div>;
    }

    return (
        <div className="posts-feed" onScroll={handleScroll}>
            {posts.map(post => (
                <div key={post._id} className="post-card">
                    {isAdmin && (
                        <button 
                            className="delete-post-button"
                            onClick={() => handleDeletePost(post._id)}
                        >
                            <i className="fas fa-trash"></i>
                        </button>
                    )}
                    
                    {post.media && post.media.length > 0 && (
                        <div className="post-media">
                            <img 
                                src={`https://college-website-backend.onrender.com${post.media[0].path}`}
                                alt="Post content"
                                onError={(e) => {
                                    e.target.src = '/placeholder.jpg';
                                }}
                            />
                        </div>
                    )}
                    
                    <div className="post-content">
                        <div className="post-header">
                            <div className="post-author">
                                <span>{post.author?.name || 'Anonymous'}</span>
                            </div>
                            <span className="post-date">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        <p className="post-text">{post.content}</p>

                        <div className="post-tags">
                            {post.tags?.map((tag, index) => (
                                <span key={index} className="tag">#{tag}</span>
                            ))}
                        </div>

                        <div className="post-actions">
                            <button 
                                className={`like-button ${post.isLiked ? 'liked' : ''}`}
                                onClick={() => handleLike(post._id)}
                            >
                                <i className="fas fa-heart"></i>
                                <span>{post.likes?.length || 0}</span>
                            </button>
                            <button 
                                className="comment-button"
                                onClick={() => setShowComments(showComments === post._id ? null : post._id)}
                            >
                                <i className="fas fa-comment"></i>
                                <span>{post.comments?.length || 0}</span>
                            </button>
                        </div>

                        {showComments === post._id && (
                            <div className="comments-section">
                                <div className="comments-container">
                                    {post.comments?.map((comment, index) => (
                                        <div key={index} className="comment">
                                            <div className="comment-author">
                                                <img 
                                                    src={comment.author?.avatar || '/default-avatar.png'} 
                                                    alt={comment.author?.name}
                                                    className="commenter-avatar"
                                                />
                                                <span>{comment.author?.name}</span>
                                            </div>
                                            <p className="comment-text">{comment.content}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="comment-input">
                                    <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                handleComment(post._id, e.target.value.trim());
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {loading && <div className="loading">Loading more posts...</div>}
            {!hasMore && <div className="no-more">No more posts to load</div>}
        </div>
    );
};

export default PostsFeed;