import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = `${import.meta.env.VITE_API_BASE_URL}/auth`;

    const checkUser = async () => {
        try {
            const res = await axios.get(`${API_URL}/me`, { withCredentials: true });
            setUser(res.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post(`${API_URL}/login`, { email, password }, { withCredentials: true });
        setUser(res.data);
        return res.data;
    };

    const register = async (userData) => {
        const res = await axios.post(`${API_URL}/register`, userData, { withCredentials: true });
        setUser(res.data);
        return res.data;
    };

    const logout = async () => {
        await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        checkUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
