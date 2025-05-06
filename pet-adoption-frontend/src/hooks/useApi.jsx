// src/hooks/useApi.jsx
import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for making authenticated API calls
 * Handles token inclusion, common error scenarios, and auth-related redirects
 */
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  
  // Get the backend URL from environment or use default
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://35.225.196.242:8080';

  // Setup axios interceptor for handling token expiration
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // If we get a 401 Unauthorized error, the token might be expired
      if (error.response && error.response.status === 401) {
        // Log out the user
        logout();
        // You might want to redirect to login page here
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  // Function to make GET requests
  const get = useCallback(async (url, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure URL starts with backendUrl if it's a relative path
      const fullUrl = url.startsWith('http') ? url : `${backendUrl}${url}`;
      
      const response = await axios.get(fullUrl, {
        ...config,
        headers: {
          ...config.headers,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  // Function to make POST requests
  const post = useCallback(async (url, data, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure URL starts with backendUrl if it's a relative path
      const fullUrl = url.startsWith('http') ? url : `${backendUrl}${url}`;
      
      const response = await axios.post(fullUrl, data, {
        ...config,
        headers: {
          ...config.headers,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (err) {
      console.error(`Error posting to ${url}:`, err);
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  // Function to make PUT requests
  const put = useCallback(async (url, data, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure URL starts with backendUrl if it's a relative path
      const fullUrl = url.startsWith('http') ? url : `${backendUrl}${url}`;
      
      const response = await axios.put(fullUrl, data, {
        ...config,
        headers: {
          ...config.headers,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (err) {
      console.error(`Error updating ${url}:`, err);
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  // Function to make DELETE requests
  const del = useCallback(async (url, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure URL starts with backendUrl if it's a relative path
      const fullUrl = url.startsWith('http') ? url : `${backendUrl}${url}`;
      
      const response = await axios.delete(fullUrl, {
        ...config,
        headers: {
          ...config.headers,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (err) {
      console.error(`Error deleting ${url}:`, err);
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  return {
    get,
    post,
    put,
    delete: del, // 'delete' is a reserved word, so we use 'del' and rename it here
    loading,
    error,
    setError
  };
};

export default useApi;