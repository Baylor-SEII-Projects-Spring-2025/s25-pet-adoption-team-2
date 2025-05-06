// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create the authentication context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the backend URL from environment or use default
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://35.225.196.242:8080';

  useEffect(() => {
    // Check if user is already logged in by looking for token in localStorage
    const loadUserFromStorage = () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          // Setup axios headers for all future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Session error. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the full URL with the backend base URL
      const response = await axios.post(`${backendUrl}/api/login`, { email, password });
      const { token, userId, userType, email: userEmail } = response.data;
      
      if (token) {
        // Store token and user data
        localStorage.setItem('token', token);
        
        const userData = {
          id: userId,
          email: userEmail,
          userType
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set axios default header for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(userData);
        return { success: true, user: userData };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Login failed. Please try again.');
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the full URL with the backend base URL
      const response = await axios.post(`${backendUrl}/api/signup`, userData);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
      return { success: false, error: err.response?.data?.error || 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Check if the user is authenticated
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  // Value object that will be provided to consumers of this context
  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;