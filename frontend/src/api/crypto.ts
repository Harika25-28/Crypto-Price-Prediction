import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export const getMarketData = async (currency = 'inr', order = 'market_cap_desc', perPage = 10, page = 1) => {
    try {
        const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
            params: {
                vs_currency: currency,
                order,
                per_page: perPage,
                page,
                sparkline: true,
                price_change_percentage: '24h',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching market data:', error);
        return [];
    }
};

export const getCoinHistory = async (id: string, days = 7) => {
    try {
        const response = await axios.get(`${COINGECKO_API}/coins/${id}/market_chart`, {
            params: {
                vs_currency: 'inr',
                days,
            },
        });
        return response.data.prices;
    } catch (error) {
        console.error('Error fetching coin history:', error);
        return [];
    }
};
