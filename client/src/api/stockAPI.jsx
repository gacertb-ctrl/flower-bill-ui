// client/src/api/stockAPI.jsx
import apiClient from './apiClient';

export const fetchStocks = async (date) => {
  try {
    let url = '/stock/stocks';
    if (date) {
      // Format the date to YYYY-MM-DD using local time
      let formattedDate;
      if (typeof date === 'string') {
        formattedDate = date;
      } else if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      } else {
        formattedDate = String(date);
      }
      url += `?date=${formattedDate}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    throw error;
  }
};

// Add other stock-related API calls here, e.g., updateStock, createStock, deleteStock
