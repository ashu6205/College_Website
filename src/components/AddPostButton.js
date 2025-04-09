// src/components/AddPostButton.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddPostButton.css';

const AddPostButton = ({ onPostCreated }) => {
    const [showModal, setShowModal] = useState(false);
    const [postData, setPostData] = useState({
        content: '',
        media: [],
        tags: ''
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('content', postData.content);
            postData.media.forEach(file => {
                formData.append('media', file);
            });
            
            // Convert tags string to array and remove whitespace
            const tagsArray = postData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);
            formData.append('tags', JSON.stringify(tagsArray));

            const token = localStorage.getItem('token');
            const response = await fetch('https://college-website-backend.onrender.com/api/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            const newPost = await response.json();
            
            // Reset form and close modal
            setShowModal(false);
            setPostData({ content: '', media: [], tags: '' });
            
            // Notify parent component of new post
            if (onPostCreated) {
                onPostCreated(newPost);
            }

            // Show success message
            alert('Post created successfully!');
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        }
    };

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Validate file types and sizes
        const validFiles = files.filter(file => {
            const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
            return isValidType && isValidSize;
        });

        if (validFiles.length !== files.length) {
            alert('Some files were not added. Please ensure all files are images or videos under 5MB.');
        }

        setPostData({ ...postData, media: validFiles });
    };

    const handleCancel = () => {
        if (postData.content || postData.media.length > 0 || postData.tags) {
            if (window.confirm('Are you sure you want to discard this post?')) {
                setShowModal(false);
                setPostData({ content: '', media: [], tags: '' });
            }
        } else {
            setShowModal(false);
        }
    };

    return (
        <>
            <button className="add-post-button" onClick={() => setShowModal(true)}>
                <i className="fas fa-plus"></i>
                Add New Post
            </button>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Create New Post</h2>
                            <button 
                                className="close-button"
                                onClick={handleCancel}
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="content">Content</label>
                                <textarea
                                    id="content"
                                    value={postData.content}
                                    onChange={(e) => setPostData({...postData, content: e.target.value})}
                                    placeholder="What's on your mind?"
                                    required
                                    maxLength={1000}
                                />
                                <small className="character-count">
                                    {postData.content.length}/1000 characters
                                </small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="media">Media</label>
                                <input
                                    id="media"
                                    type="file"
                                    multiple
                                    onChange={handleMediaChange}
                                    accept="image/*,video/*"
                                    className="file-input"
                                />
                                {postData.media.length > 0 && (
                                    <div className="media-preview">
                                        {postData.media.map((file, index) => (
                                            <div key={index} className="media-preview-item">
                                                {file.type.startsWith('image/') ? (
                                                    <img 
                                                        src={URL.createObjectURL(file)} 
                                                        alt={`Preview ${index + 1}`}
                                                    />
                                                ) : (
                                                    <video src={URL.createObjectURL(file)} />
                                                )}
                                                <button
                                                    type="button"
                                                    className="remove-media"
                                                    onClick={() => setPostData({
                                                        ...postData,
                                                        media: postData.media.filter((_, i) => i !== index)
                                                    })}
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <small className="file-hint">
                                    Supported formats: Images and videos (max 5MB each)
                                </small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="tags">Tags</label>
                                <input
                                    id="tags"
                                    type="text"
                                    value={postData.tags}
                                    onChange={(e) => setPostData({...postData, tags: e.target.value})}
                                    placeholder="Enter tags separated by commas"
                                    className="tags-input"
                                />
                                <small className="tags-hint">
                                    Separate tags with commas (e.g., college, events, news)
                                </small>
                            </div>

                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="cancel-button"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="submit-button"
                                    disabled={!postData.content.trim()}
                                >
                                    Create Post
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddPostButton;