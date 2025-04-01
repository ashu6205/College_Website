// src/components/CreatePost.js
import React, { useState } from 'react';
import { postService } from '../services/api';
import './CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const postData = {
        content,
        tags: tags.split(',').map(tag => tag.trim()),
        media: media
      };

      const newPost = await postService.createPost(postData);
      setContent('');
      setTags('');
      setMedia([]);
      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setMedia(Array.from(e.target.files));
  };

  return (
    <div className="create-post">
      <h2>Create New Post</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
          />
        </div>
        <div className="form-group">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Posting...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;