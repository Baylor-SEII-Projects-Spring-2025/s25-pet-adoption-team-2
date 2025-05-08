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
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://35.225.196.242:8080';

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        logout();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  const get = useCallback(async (url, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
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

  const post = useCallback(async (url, data, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
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

  const put = useCallback(async (url, data, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
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

  const del = useCallback(async (url, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
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
    delete: del, 
    loading,
    error,
    setError
  };
};

export default useApi;