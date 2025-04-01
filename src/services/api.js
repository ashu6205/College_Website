// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const postService = {
  // Get all posts
  getAllPosts: async () => {
    try {
      const response = await api.get('/api/posts');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single post
  getPostById: async (id) => {
    try {
      const response = await api.get(`/api/posts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new post
  createPost: async (postData) => {
    try {
      const formData = new FormData();
      
      // Add text content
      formData.append('content', postData.content);
      
      // Add tags
      if (postData.tags && postData.tags.length > 0) {
        postData.tags.forEach(tag => formData.append('tags', tag));
      }
      
      // Add media files
      if (postData.media && postData.media.length > 0) {
        postData.media.forEach(file => formData.append('media', file));
      }

      const response = await api.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Like a post
  likePost: async (postId) => {
    try {
      const response = await api.post(`/api/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};