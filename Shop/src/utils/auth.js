import axios from 'axios';

// Utility functions for JWT authentication

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Set token in localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get user data from localStorage
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Set user data in localStorage
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

// Create axios instance with auth header
export const createAuthAxios = () => {
  const token = getToken();
  
  const instance = axios.create({
    baseURL: "https://cash-back-shop.onrender.com",
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth header to all requests
  instance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Handle token expiration
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        removeToken();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Logout function
export const logout = () => {
  removeToken();
  window.location.href = '/login';
}; 