import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios to always send cookies
  axios.defaults.withCredentials = true;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/profile`);
      setUser(res.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    setUser(res.data);
    return res.data;
  };

  const signup = async (name, email, password) => {
    const res = await axios.post(`${API_URL}/auth/signup`, { name, email, password });
    // Wait for email verification
    return res.data;
  };

  const verifyEmailAndLogin = async () => {
    // Re-check session after verification
    await checkUser();
  };

  const googleLogin = async (googleData) => {
    const res = await axios.post(`${API_URL}/auth/google`, googleData);
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    await axios.post(`${API_URL}/auth/logout`);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, googleLogin, verifyEmailAndLogin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
