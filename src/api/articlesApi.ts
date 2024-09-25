import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000', // Backend URL
});

// Fetch all articles
export const getArticles = async () => {
  const response = await api.get('/articles');
  return response.data;
};

// Fetch a single article by ID
export const getArticleById = async (id: number) => {
  const response = await api.get(`/articles/${id}`);
  return response.data;
};

// Fetch logged-in user's articles
export const getMyArticles = async () => {
    const response = await fetch('http://localhost:4000/my-articles', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Send JWT token
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    return response.json();
  };

// Create a new article
export const createArticle = async (articleData: {
  title: string;
  content: string;
  author?: string;
}) => {
    const response = await fetch('http://localhost:4000/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Send JWT token
        },
        body: JSON.stringify(articleData),
      });
      if (!response.ok) {
        throw new Error('Failed to create article');
      }
};

// Update an article by ID
export const updateArticle = async (id: number, articleData: {
  title?: string;
  content?: string;
  author?: string;
}) => {
  const response = await api.put(`/articles/${id}`, articleData);
  return response.data;
};

// Delete an article by ID
export const deleteArticle = async (id: number) => {
  const response = await api.delete(`/articles/${id}`);
  return response.data;
};

// Signup function
export const signup = async (userData: { username: string; password: string }) => {
  const response = await api.post('/signup', userData);
  return response.data;
};

// Login function
export const login = async (userData: { username: string; password: string }) => {
  const response = await api.post('/login', userData);
  return response.data; // Will return the JWT token from the backend
};

// Protect other requests by adding token to headers
export const getProtectedArticles = async () => {
  const token = localStorage.getItem('token'); // Get token from localStorage
  const response = await api.get('/articles', {
    headers: {
      Authorization: `Bearer ${token}`, // Add the token in the Authorization header
    },
  });
  return response.data;
};
