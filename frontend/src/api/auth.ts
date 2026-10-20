import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

export const login = async (identifier: string, password: string) => {
    try {
        const payload: any = { identifier, password };
        const response = await axios.post(`${API_URL}/login`, payload);
        return response.data;
    } catch (error: any) {
        throw error.response?.data?.detail || 'Login failed';
    }
};

export const register = async (userData: any) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error: any) {
        throw error.response?.data?.detail || 'Registration failed';
    }
};
