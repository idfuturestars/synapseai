import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  axios.defaults.baseURL = backendUrl;

  // Check for existing token on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('/api/user/profile');
        setUser({
          ...response.data,
          token
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      
      const { access_token, user_id, email: userEmail } = response.data;
      
      // Store token
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Get user profile
      const profileResponse = await axios.get('/api/user/profile');
      
      setUser({
        ...profileResponse.data,
        token: access_token
      });
      
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.detail || 'Login failed');
      return false;
    }
  };

  const register = async (email, password, fullName) => {
    try {
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        full_name: fullName
      });
      
      const { access_token, user_id, email: userEmail } = response.data;
      
      // Store token
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Get user profile
      const profileResponse = await axios.get('/api/user/profile');
      
      setUser({
        ...profileResponse.data,
        token: access_token
      });
      
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error.response?.data?.detail || 'Registration failed');
      return false;
    }
  };

  const oauthLogin = async (accessToken, provider) => {
    try {
      const response = await axios.post('/api/auth/oauth', {
        access_token: accessToken,
        provider
      });
      
      const { access_token: jwtToken, user_id, email } = response.data;
      
      // Store token
      localStorage.setItem('token', jwtToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      
      // Get user profile
      const profileResponse = await axios.get('/api/user/profile');
      
      setUser({
        ...profileResponse.data,
        token: jwtToken
      });
      
      toast.success(`${provider} login successful!`);
      return true;
    } catch (error) {
      console.error('OAuth login failed:', error);
      toast.error(error.response?.data?.detail || 'OAuth login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    register,
    oauthLogin,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};