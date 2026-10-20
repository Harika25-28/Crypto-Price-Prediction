import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        Authorization: `Bearer ${token}`
    };
};

export const getAdminUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/admin/users/`, { headers: getHeaders() });
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

export const getAdminMetrics = async () => {
    try {
        const response = await axios.get(`${API_URL}/admin/metrics/`, { headers: getHeaders() });
        return response.data;
    } catch (error) {
        console.error("Error fetching admin metrics:", error);
        throw error;
    }
};

export const getManagementMetrics = async () => {
    try {
        const response = await axios.get(`${API_URL}/management/metrics/`, { headers: getHeaders() });
        return response.data;
    } catch (error) {
        console.error("Error fetching management metrics:", error);
        throw error;
    }
};

export const getManagementHistory = async (skip = 0, limit = 200) => {
    try {
        const response = await axios.get(`${API_URL}/management/history/?skip=${skip}&limit=${limit}`, { headers: getHeaders() });
        return response.data;
    } catch (error) {
        console.error("Error fetching management history:", error);
        return [];
    }
};

export const getManagementUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/management/users/`, { headers: getHeaders() });
        return response.data;
    } catch (error) {
        console.error("Error fetching management users:", error);
        return [];
    }
};

export const updateUserPlan = async (userId: number, plan: string) => {
    try {
        const response = await axios.patch(
            `${API_URL}/management/users/${userId}/plan`,
            { plan },
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating user plan:", error);
        throw error;
    }
};
