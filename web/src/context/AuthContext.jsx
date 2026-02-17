import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user on mount
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken && savedUser !== 'undefined' && savedUser !== 'null') {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, isTechnician = false) => {
    try {
      console.log('AuthContext: Attempting login', { email, isTechnician });

      const response = isTechnician
        ? await authAPI.loginTechnician(email, password)
        : await authAPI.login(email, password);

      console.log('AuthContext: Login response', response.data);

      const { user: userData, token: authToken } = response.data.data;

      setUser(userData);
      setToken(authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', authToken);

      console.log('AuthContext: Login successful', userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('AuthContext: Login error', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return {
        success: false,
        error: error.response?.data?.error || error.message || '로그인에 실패했습니다'
      };
    }
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      const { user: userData, token: authToken } = response.data.data;

      setUser(userData);
      setToken(authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', authToken);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
