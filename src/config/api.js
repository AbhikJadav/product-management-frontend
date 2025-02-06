export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  products: `${API_BASE_URL}/products`,
  categories: `${API_BASE_URL}/categories`,
  materials: `${API_BASE_URL}/materials`,
  statistics: `${API_BASE_URL}/products/statistics`,
};
