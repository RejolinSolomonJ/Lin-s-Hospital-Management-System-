import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Verify token and refresh user profile on initial load
    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const res = await axios.get(`${API_BASE_URL}/api/auth/me`);
                    if (res.data?.user) {
                        setUser(res.data.user);
                        localStorage.setItem('user', JSON.stringify(res.data.user));
                    }
                } catch (error) {
                    console.error('Session expired or invalid:', error);
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [token]);

    const login = async (email, password, role) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password, role });
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setToken(token);
            setUser(user);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return { success: true, user };
        } catch (error) {
            console.error('Login Error:', error);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
            return { success: true, message: res.data?.message };
        } catch (error) {
            console.error('Registration Error:', error);
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
