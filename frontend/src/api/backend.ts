import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const predictPrice = async (coinSymbol: string) => {
    try {
        const response = await axios.post(`${API_URL}/predict/`, {
            coin_symbol: coinSymbol,
        });
        return response.data;
    } catch (error) {
        console.error('Error predicting price:', error);
        throw error;
    }
};

export const getPredictionHistory = async () => {
    try {
        const response = await axios.get(`${API_URL}/history/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching prediction history:', error);
        return [];
    }
};
